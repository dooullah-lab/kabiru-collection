import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 grid sm:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="font-bold text-cream mb-2">Kabiru Collection</div>
          <p className="text-dim">Quality goods, honest prices. Based in Lagos, Nigeria.</p>
        </div>
        <div>
          <div className="font-semibold text-cream mb-2">Quick links</div>
          <div className="flex flex-col gap-1 text-dim">
            <Link href="/" className="hover:text-cream">Shop</Link>
            <Link href="/categories" className="hover:text-cream">Categories</Link>
            <Link href="/support" className="hover:text-cream">Support</Link>
            <Link href="/contact" className="hover:text-cream">Contact</Link>
          </div>
        </div>
        <div>
          <div className="font-semibold text-cream mb-2">Get in touch</div>
          <div className="text-dim">+234 801 234 5678</div>
          <div className="text-dim">hello@kabirucollection.com</div>
        </div>
      </div>
      <div className="text-center text-dim text-xs pb-6">
        © {new Date().getFullYear()} Kabiru Collection. All rights reserved.
      </div>
    </footer>
  );
}
