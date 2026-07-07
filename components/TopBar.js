export default function TopBar() {
  return (
    <div className="bg-[#0c0c12] text-cream text-xs sm:text-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-2 flex flex-wrap gap-x-6 gap-y-1 justify-center sm:justify-between items-center">
        <span>🚚 Free delivery on orders above ₦20,000</span>
        <span>↩ 7-day returns</span>
        <span>🔒 Secure checkout with Paystack</span>
      </div>
    </div>
  );
}
