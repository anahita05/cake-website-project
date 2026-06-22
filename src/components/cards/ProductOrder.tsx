import { useState } from "react";
import { FaShoppingCart, FaCheck } from "react-icons/fa";
import type { ProductTypes } from "../../types/ProductTypes";
import { useCartStore } from "../../store/cartStore";

interface ProductOrderProps {
  product: ProductTypes;
}

const SIGNED_DURATION_MS = 2200;

const SignatureAnimation = () => (
  <span className="absolute inset-0 flex items-center justify-center gap-2">
    <svg
      viewBox="0 0 120 40"
      className="w-24 h-8 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="M5 25 C 15 8, 22 8, 28 22 C 33 33, 38 18, 45 15 C 52 12, 58 28, 65 20 C 72 12, 80 30, 90 18 C 98 9, 105 22, 115 14"
        pathLength="1"
        className="signature-path"
      />
    </svg>

    <FaCheck className="signature-check text-lg text-white" />
  </span>
);

const ProductOrder = ({ product }: ProductOrderProps) => {
  const [quantity, setQuantity] = useState(1);
  const [signed, setSigned] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        image: product.image,
      });
    }
    setSigned(true);
    setTimeout(() => setSigned(false), SIGNED_DURATION_MS);
  };

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => q + 1);

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Red blob */}
      <svg
        viewBox="0 0 800 500"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,60 C250,140 550,0 800,80 L800,500 L0,500 Z"
          fill="#B83232"
        />
      </svg>

      <div className="relative max-w-2xl mx-auto px-6 pt-12 text-center">
        <h2 className="font-serif font-bold text-white text-4xl md:text-5xl uppercase leading-tight mb-3">
          Ready For A<br /> Slice?
        </h2>
        <p className="text-white/85 mb-10">
          Freshly baked and delivered straight to your door.
        </p>

        <div className="bg-[#fcefe2] rounded-[2.5rem] shadow-2xl p-8 md:p-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[#B83232] font-bold text-4xl">
              {product.price}
            </span>
            <span className="text-gray-400 text-lg line-through">
              {product.oldPrice}
            </span>
          </div>

          <div
            className="flex items-center bg-white rounded-full overflow-hidden shadow-sm"
            role="group"
            aria-label="Quantity"
          >
            <button
              onClick={decrement}
              className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-[#B83232] hover:text-white transition-colors duration-200 text-xl font-bold"
            >
              −
            </button>
            <span className="w-14 text-center font-bold text-gray-800 text-lg">
              {quantity}
            </span>
            <button
              onClick={increment}
              className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-[#B83232] hover:text-white transition-colors duration-200 text-xl font-bold"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={signed}
            aria-label={signed ? "Added to cart" : "Add to cart"}
            className="relative w-full sm:w-auto overflow-hidden bg-[#B83232] text-white font-bold py-4 px-12 rounded-full transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3 min-h-14.5 min-w-55"
          >
            <span
              className={`flex items-center gap-3 transition-opacity duration-200 ${
                signed ? "opacity-0" : "opacity-100"
              }`}
            >
              <FaShoppingCart className="text-lg" />
              Add to Cart
            </span>

            {signed && <SignatureAnimation />}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductOrder;
