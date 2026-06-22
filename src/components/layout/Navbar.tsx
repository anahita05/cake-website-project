import { useState } from "react";
import { useNavigate } from "react-router";
import { IoSearch } from "react-icons/io5";
import { FiMenu, FiUser } from "react-icons/fi";
import { IoBagHandleOutline } from "react-icons/io5";
import MobileMenu from "./MobileMenu";
import SearchOverlay from "./SearchOverlay";
import { useCartStore } from "../../store/cartStore";


const navLinks = [
  "Cakes",
  "Theme Cakes",
  "Desserts",
  "Birthday",
  "Anniversary",
  "Occasions",
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.getTotalItems());

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-red-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative flex items-center justify-between h-14 gap-4">

            <a
              className="text-2xl font-black tracking-tight text-red-700 shrink-0 cursor-pointer font-serif"
              onClick={() => navigate("/")}
            >
              CAKE SHOP
            </a>

            <div className="group hidden lg:flex items-center gap-2 bg-orange-50 rounded-full px-4 py-2 border border-red-100 focus-within:border-red-700 transition-colors
              w-48 lg:w-72 absolute left-1/2 -translate-x-1/2">
              <IoSearch className="w-5 h-5 text-black group-focus-within:text-red-800 transition-colors shrink-0" />
              <input
                type="text"
                placeholder="Search cakes, desserts..."
                className="text-sm outline-none w-full bg-transparent placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-2 ml-auto md:ml-0">

              <button
                onClick={() => setSearchOpen(true)}
                className="lg:hidden p-2 rounded-full hover:bg-red-50 transition-colors text-gray-600 hover:text-red-700"
                aria-label="Open search"
              >
                <IoSearch className="w-5 h-5" />
              </button>

              <button
                className="group relative hidden lg:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-700 transition-colors
                  after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-[#B83232] after:transition-all after:duration-300 hover:after:w-full"
              >
                <FiUser className="w-5 h-5" />
                <span>Login / Signup</span>
              </button>

              <div
                className="relative p-2 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                role="link"
                aria-label="Shopping cart"
              >
                <IoBagHandleOutline className="w-6 h-6" />
                <span className="absolute top-1 right-0 flex items-center justify-center w-4 h-4 rounded-full bg-[#B83232] text-white text-[10px] font-bold">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              </div>

              <a className="hidden lg:block bg-[#B83232] hover:bg-red-900 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors shadow-md cursor-pointer whitespace-nowrap"
                onClick={() => navigate("/cart")}
                >
                ORDER NOW
              </a>

              <button
                onClick={() => setMenuOpen(true)}
                className="lg:hidden flex justify-center items-center w-9 h-9 rounded-lg hover:bg-red-50 transition-colors"
                aria-label="Open menu"
              >
                <FiMenu className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6 pb-2 text-sm font-medium text-gray-600">
            {navLinks.map((item) => (
              <a
                key={item}
                className="footer-link hover:text-red-700 transition-colors relative cursor-pointer after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-[#B83232] after:transition-all after:duration-300 hover:after:w-full"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
