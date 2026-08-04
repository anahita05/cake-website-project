import { FaMapMarkerAlt, FaPhoneAlt, FaStar } from "react-icons/fa";
import type { Product } from "../../types/product";

interface ProductHeroProps {
  product: Product;
}

const CONTACT_INFO = {
  address: "123 Dessert St, Somewhere in city :)",
  phone: "012 345 678 | @cakehouse",
};

const ProductHero = ({ product }: ProductHeroProps) => {
  return (
    <section className="relative pt-8 pb-24 overflow-hidden">
      <div className="relative max-w-5xl mx-auto px-6 pt-6 flex flex-wrap gap-6 text-[#B83232] font-bold text-sm md:text-base">
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt />
          {CONTACT_INFO.address}
        </div>
        <div className="flex items-center gap-2">
          <FaPhoneAlt aria-hidden="true" />
          {CONTACT_INFO.phone}
        </div>
      </div>

      
      <div className="relative mt-8">
        {/* Cream blob background */}
        <svg
          viewBox="0 0 800 600"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,120 C150,40 320,10 480,60 C660,115 780,40 800,140 L800,560 C650,610 480,540 320,580 C160,615 60,540 0,560 Z"
            fill="#ffe3d4"
          />
        </svg>

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-28 grid md:grid-cols-2 gap-10 items-center min-h-112">
          <div className="order-2 md:order-1 text-center md:text-left">
            <h1 className="font-serif font-bold text-[#B83232] text-5xl md:text-7xl uppercase mb-3">
              Wanna
              <br /> Taste!?
            </h1>

            <div className="inline-block bg-[#B83232] text-white rounded-2xl px-5 py-3 -rotate-2 shadow-2xl mb-4">
              <h2 className="font-serif font-bold text-lg md:text-2xl leading-tight">
                {product.name}
              </h2>
              <p className="text-xs md:text-sm text-white/80 mt-1">
                Rich — Sweet — Irresistible
              </p>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
              <div className="flex text-yellow-500">
                  <FaStar />
              </div>
              <span className="text-gray-500 text-sm">
                ({product.reviews.count} + reviews)
              </span>
            </div>
          </div>

          <div className="md:order-2 relative flex items-center justify-center">
            <div className="absolute w-80 h-80 md:w-96 md:h-96 rounded-full bg-[#f7b89b]" />
            <div className="relative w-64 h-64 md:w-85 md:h-85 rounded-full overflow-hidden drop-shadow-2xl rotate-12 hover:rotate-0 active:rotate-0 transition-transform duration-600">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-6 -mt-8 flex items-center justify-between gap-4">
        <div className="bg-[#B83232] text-white font-serif font-bold text-2xl md:text-3xl uppercase rounded-2xl px-6 py-4 rotate-3 shadow-lg">
          Try it
          <br />
          Today!
        </div>

        <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-[#FFD2BD] flex items-center justify-center">
            <img
              src={product.image}
              alt=""
              aria-hidden="true"
              className="w-8 h-8 rounded-full"
            />
          </div>
          <div className="leading-tight">
            <p className="font-serif font-bold text-[#B83232] text-sm">
              Cake House
            </p>
            <p className="text-xs text-gray-400">Taste the joy</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductHero;
