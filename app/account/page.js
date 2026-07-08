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

  const [user, setUser] = useState(undefined);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ fullName: "", phone: "", address: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info"); // info | success | error
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState("all");

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
        options: { data: { full_name: form.fullName, phone: form.phone, address: form.address } },
      });
      if (error) {
        setMsgType("error");
        setMsg(error.message);
      } else if (!data.session) {
        setMsgType("success");
        setMsg("Account created! Check your email to confirm it, then sign in.");
      } else {
        setMsgType("success");
        setMsg("Account created successfully! Taking you in…");
        setTimeout(() => { router.push(redirectTo); router.refresh(); }, 1000);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (error) {
        setMsgType("error");
        setMsg(error.message);
      } else {
        setMsgType("success");
        setMsg("Signed in! Taking you in…");
        setTimeout(() => { router.push(redirectTo); router.refresh(); }, 600);
      }
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
    const meta = user.user_metadata || {};
    const list = orders || [];
    const paid = list.filter((o) => o.status === "paid");
    const pending = list.filter((o) => o.status !== "paid");
    const totalSpent = paid.reduce((s, o) => s + Number(o.total), 0);

    const filtered =
      filter === "pending" ? pending : filter === "completed" ? paid : list;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Account</h1>
            <p className="text-dim text-sm mt-1">{meta.full_name || "—"} · {user.email}</p>
            {meta.phone && <p className="text-dim text-sm">{meta.phone}</p>}
            {meta.address && <p className="text-dim text-sm">{meta.address}</p>}
          </div>
          <button onClick={signOut} className="text-red border border-red rounded-lg px-4 py-2 text-sm font-semibold shrink-0">
            Sign out
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-xl font-bold">{list.length}</div>
            <div className="text-dim text-xs mt-1">Total orders</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-gold">{pending.length}</div>
            <div className="text-dim text-xs mt-1">Pending</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-green">{paid.length}</div>
            <div className="text-dim text-xs mt-1">Completed</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-xl font-bold font-mono">{naira(totalSpent)}</div>
            <div className="text-dim text-xs mt-1">Total spent</div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {[["all", "All"], ["pending", "Pending"], ["completed", "Completed"]].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${filter === k ? "bg-green text-white border-green" : "border-border text-dim"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {orders === null ? (
          <div className="text-dim text-sm">Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div className="text-dim text-sm">No orders in this view yet.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((o) => (
              <a key={o.id} href={`/order/${o.id}`} className="block bg-surface border border-border rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Order #{o.id.slice(0, 8)}</span>
                  <span className={o.status === "paid" ? "text-green font-semibold" : "text-gold font-semibold"}>
                    {o.status === "paid" ? "Completed" : "Pending"}
                  </span>
                </div>
                <div className="text-dim text-sm mt-1">{naira(o.total)} · {new Date(o.created_at).toLocaleDateString()}</div>
                {o.status === "paid" && (
                  <div className="text-dim text-xs mt-1">
                    Delivery: <span className="font-semibold">
                      {{ processing: "Processing", in_transit: "In Transit", delivered: "Delivered", received: "Received" }[o.delivery_status || "processing"]}
                    </span>
                  </div>
                )}
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
        <button onClick={() => setMode("login")} className={`flex-1 py-2 rounded-md font-semibold text-sm ${mode === "login" ? "bg-gold text-ink" : "text-dim"}`}>
          Sign In
        </button>
        <button onClick={() => setMode("register")} className={`flex-1 py-2 rounded-md font-semibold text-sm ${mode === "register" ? "bg-gold text-ink" : "text-dim"}`}>
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
            <textarea required placeholder="Delivery address" rows={2} value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-surface2 border border-border rounded-lg px-3 py-2" />
          </>
        )}
        <input required type="email" placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2" />
        <input required type="password" placeholder="Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2" />
        {msg && (
          <div className={`text-sm font-semibold ${msgType === "error" ? "text-red" : msgType === "success" ? "text-green" : "text-gold"}`}>
            {msg}
          </div>
        )}
        <button disabled={loading} className="w-full bg-gold text-ink font-bold py-2.5 rounded-lg">
          {loading ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
        </button>
        {mode === "login" && (
          <a href="/account/forgot-password" className="block text-center text-sm text-dim">Forgot your password?</a>
        )}
      </form>
    </div>
  );
}
