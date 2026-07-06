"use client";
import { useState } from "react";
import Link from "next/link";

const faqs = [
  { q: "How do I pay?", a: "We accept card payments, bank transfer, and USSD, all handled securely through Paystack at checkout." },
  { q: "How long does delivery take?", a: "Orders within Lagos usually arrive in 1–3 working days. Other states typically take 3–7 working days." },
  { q: "Can I return an item?", a: "Yes — items can be returned within 7 days if unused and in their original packaging. Contact us to arrange a return." },
  { q: "How do I know my size?", a: "Check the size options listed on each product page. If you're unsure, message us on WhatsApp with your measurements and we'll help." },
  { q: "Is my payment secure?", a: "Yes. All payments are processed by Paystack — we never see or store your card details." },
];

export default function SupportPage() {
  const [open, setOpen] = useState(null);
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Support</h1>
      <p className="text-dim mb-6">
        Answers to common questions. Still stuck?{" "}
        <Link href="/contact" className="text-gold underline">Contact us</Link>.
      </p>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left px-4 py-3 font-semibold flex justify-between items-center"
            >
              {f.q} <span className="text-dim">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <div className="px-4 pb-4 text-dim text-sm">{f.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
