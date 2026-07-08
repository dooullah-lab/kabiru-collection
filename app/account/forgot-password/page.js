"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";

export default function ForgotPassword() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account/reset-password`,
    });
    if (error) setMsg(error.message);
    else setMsg("If that email has an account, a reset link has been sent. Check your inbox.");
    setLoading(false);
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-2">Forgot your password?</h1>
      <p className="text-dim text-sm mb-5">Enter your email and we'll send you a link to set a new one.</p>
      <form onSubmit={submit} className="space-y-3">
        <input
          required type="email" placeholder="Your email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2"
        />
        {msg && <div className="text-sm text-green font-semibold">{msg}</div>}
        <button disabled={loading} className="w-full bg-gold text-ink font-bold py-2.5 rounded-lg">
          {loading ? "Sending…" : "Send reset link"}
        </button>
        <a href="/account" className="block text-center text-sm text-dim">← Back to sign in</a>
      </form>
    </div>
  );
}
