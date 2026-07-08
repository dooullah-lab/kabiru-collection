import Link from "next/link";

export default function AdminNav({ active }) {
  const tabs = [
    { href: "/admin/dashboard", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/reports", label: "Reports" },
  ];
  return (
    <div className="flex gap-2 mb-6">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
            active === t.label ? "bg-gold text-ink border-gold" : "border-border text-dim"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
