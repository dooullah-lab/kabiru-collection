"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";

export default function ResetPassword() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // The reset link from the email logs the user in automatically --
    // we just wait for that session to be ready before showing the form.
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (password.length < 6) {
      setMsgType("error");
      setMsg("Password should be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setMsgType("error");
      setMsg("Passwords don't match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMsgType("error");
      setMsg(error.message);
    } else {
      setMsgType("success");
      setMsg("Password updated! Taking you to your account…");
      setTimeout(() => { router.push("/account"); router.refresh(); }, 1000);
    }
    setLoading(false);
  }

  if (!ready) {
    return (
      <div className="max-w-sm mx-auto text-center text-dim">
        Confirming your reset link… if this doesn't finish in a few seconds, the link may have expired —
        <a href="/account/forgot-password" className="text-gold underline block mt-2">request a new one</a>.
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-5">Set a new password</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          required type="password" placeholder="New password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2"
        />
        <input
          required type="password" placeholder="Confirm new password" value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2"
        />
        {msg && (
          <div className={`text-sm font-semibold ${msgType === "error" ? "text-red" : "text-green"}`}>{msg}</div>
        )}
        <button disabled={loading} className="w-full bg-gold text-ink font-bold py-2.5 rounded-lg">
          {loading ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
