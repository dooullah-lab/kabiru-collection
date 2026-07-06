import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";

export const metadata = {
  title: "Kabiru Collection",
  description: "Quality goods, honest prices."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
