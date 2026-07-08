"use client";
import { useState } from "react";

// NOTE: these are placeholder details -- replace them with your real
// address, phone number, email and WhatsApp number.
export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  async function submit(e) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } else {
      setStatus("error");
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div>
        <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
        <div className="space-y-3 text-dim text-sm">
          <div><span className="text-cream font-semibold">Address:</span> 14 Adeniran Ogunsanya Street, Surulere, Lagos, Nigeria</div>
          <div><span className="text-cream font-semibold">Phone:</span> +234 801 234 5678</div>
          <div><span className="text-cream font-semibold">Email:</span> hello@kabirucollection.com</div>
          <div><span className="text-cream font-semibold">Hours:</span> Monday – Saturday, 9am – 7pm</div>
        </div>
        <a
          href="https://wa.me/2348012345678"
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-5 bg-green text-white font-bold px-5 py-2.5 rounded-lg"
        >
          Chat on WhatsApp
        </a>
        <div className="text-xs text-dim mt-4">
          (These are placeholder details — edit them in <code>app/contact/page.js</code>)
        </div>
      </div>

      <form onSubmit={submit} className="bg-surface border border-border rounded-2xl p-6 space-y-3">
        <h2 className="font-bold mb-1">Send us a message</h2>
        <input
          required placeholder="Your name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2"
        />
        <input
          required type="email" placeholder="Your email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2"
        />
        <textarea
          required placeholder="Your message" rows={4} value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2"
        />
        <button className="bg-gold text-ink font-bold px-5 py-2.5 rounded-lg" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        {status === "sent" && <div className="text-green text-sm font-semibold">Message sent — we'll get back to you soon.</div>}
        {status === "error" && <div className="text-red text-sm font-semibold">Something went wrong, please try again.</div>}
      </form>
    </div>
  );
}
