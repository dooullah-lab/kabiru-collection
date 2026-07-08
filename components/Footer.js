import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 grid sm:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="font-bold text-white mb-2">Kabiru Collection</div>
          <p className="text-white/60">Quality goods, honest prices. Based in Lagos, Nigeria.</p>
        </div>
        <div>
          <div className="font-semibold text-white mb-2">Quick links</div>
          <div className="flex flex-col gap-1 text-white/60">
            <Link href="/" className="hover:text-white">Shop</Link>
            <Link href="/categories" className="hover:text-white">Categories</Link>
            <Link href="/support" className="hover:text-white">Support</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
        <div>
          <div className="font-semibold text-white mb-2">Get in touch</div>
          <div className="text-white/60">+234 801 234 5678</div>
          <div className="text-white/60">hello@kabirucollection.com</div>
        </div>
      </div>
      <div className="text-center text-white/40 text-xs pb-6">
        © {new Date().getFullYear()} Kabiru Collection. All rights reserved.
      </div>
    </footer>
  );
}
