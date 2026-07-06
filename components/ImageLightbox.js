"use client";
import { useEffect, useState } from "react";

// Full-screen photo viewer. Click the image once to zoom in on the
// exact spot you clicked, click again to zoom back out. Press Escape
// or click the background to close.
export default function ImageLightbox({ src, alt, onClose }) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("center center");

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function handleImgClick(e) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
    setZoomed((z) => !z);
  }

  return (
    <div
      className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white text-3xl leading-none w-10 h-10 flex items-center justify-center"
      >
        ✕
      </button>
      <div className="absolute top-6 left-6 text-white/70 text-sm">
        {zoomed ? "Click photo to zoom out" : "Click photo to zoom in"}
      </div>
      <img
        src={src}
        alt={alt || ""}
        onClick={handleImgClick}
        style={{
          transformOrigin: origin,
          transform: zoomed ? "scale(2.4)" : "scale(1)",
          cursor: zoomed ? "zoom-out" : "zoom-in",
          transition: "transform .25s ease",
        }}
        className="max-w-[90vw] max-h-[90vh] object-contain select-none"
      />
    </div>
  );
}
