"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setErrorMsg("");
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) router.push("/admin/dashboard");
    else setErrorMsg("Wrong password.");
  }

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto mt-20 text-center">
      <h1 className="text-xl font-bold mb-4">Admin login</h1>
      <input
        type="password"
        className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-center font-mono tracking-widest"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {errorMsg && <div className="text-red text-sm mt-2">{errorMsg}</div>}
      <button className="w-full mt-3 bg-gold text-bg font-bold py-2.5 rounded-lg">Enter</button>
    </form>
  );
}
