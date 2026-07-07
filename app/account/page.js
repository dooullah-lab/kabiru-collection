"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";

function naira(n) {
  return "₦" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="text-dim">Loading…</div>}>
      <AccountInner />
    </Suspense>
  );
}

function AccountInner() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  const [user, setUser] = useState(undefined); // undefined = still checking
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
  }, []);

  useEffect(() => {
    if (user) {
      fetch("/api/my-orders").then((r) => r.json()).then((d) => setOrders(d.orders || []));
    }
  }, [user]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.fullName, phone: form.phone } },
      });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Account created! Check your email to confirm it, then sign in.");
      else { router.push(redirectTo); router.refresh(); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (error) setMsg(error.message);
      else { router.push(redirectTo); router.refresh(); }
    }
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.refresh();
    setUser(null);
  }

  if (user === undefined) return <div className="text-dim">Loading…</div>;

  if (user) {
    return (
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">My Account</h1>
        <p className="text-dim mb-6">{user.email}</p>
        <button onClick={signOut} className="mb-8 text-red border border-red rounded-lg px-4 py-2 text-sm font-semibold">
          Sign out
        </button>

        <h2 className="font-bold mb-3">Order history</h2>
        {orders.length === 0 ? (
          <div className="text-dim text-sm">No orders yet — go find something you like!</div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <a key={o.id} href={`/order/${o.id}`} className="block bg-surface border border-border rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Order #{o.id.slice(0, 8)}</span>
                  <span className={o.status === "paid" ? "text-green font-semibold" : "text-gold font-semibold"}>
                    {o.status}
                  </span>
                </div>
                <div className="text-dim text-sm mt-1">{naira(o.total)} · {new Date(o.created_at).toLocaleDateString()}</div>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex gap-2 mb-6 bg-surface border border-border rounded-lg p-1">
        <button onClick={() => setMode("login")} className={`flex-1 py-2 rounded-md font-semibold text-sm ${mode === "login" ? "bg-gold text-bg" : "text-dim"}`}>
          Sign In
        </button>
        <button onClick={() => setMode("register")} className={`flex-1 py-2 rounded-md font-semibold text-sm ${mode === "register" ? "bg-gold text-bg" : "text-dim"}`}>
          Register
        </button>
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "register" && (
          <>
            <input required placeholder="Full name" value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full bg-surface2 border border-border rounded-lg px-3 py-2" />
            <input required placeholder="Phone number" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-surface2 border border-border rounded-lg px-3 py-2" />
          </>
        )}
        <input required type="email" placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2" />
        <input required type="password" placeholder="Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2" />
        {msg && <div className="text-sm text-gold">{msg}</div>}
        <button disabled={loading} className="w-full bg-gold text-bg font-bold py-2.5 rounded-lg">
          {loading ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
        </button>
      </form>
    </div>
  );
}