"use client";
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Load saved cart from this browser when the page opens
  useEffect(() => {
    const saved = localStorage.getItem("kabiru_cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Save cart to this browser whenever it changes
  useEffect(() => {
    localStorage.setItem("kabiru_cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(product, size) {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id && c.size === size);
      if (existing) {
        return prev.map((c) =>
          c.id === product.id && c.size === size ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price,
        discount: product.discount, image_url: product.image_url, size, qty: 1 }];
    });
  }

  function changeQty(id, size, delta) {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id && c.size === size ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, changeQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
