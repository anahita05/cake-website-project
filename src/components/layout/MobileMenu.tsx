import { useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FiUser } from "react-icons/fi";

const navLinks = [
  "Cakes",
  "Theme Cakes",
  "Desserts",
  "Birthday",
  "Anniversary",
  "Occasions",
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-60 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`fixed top-0 right-0 h-full w-[80%] max-w-sm z-70 flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "#fdf6ee" }}
      >

        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-red-100">
          <span
            className="text-xl font-black text-red-700 tracking-tight font-serif"
          >
            CAKE SHOP
          </span>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 transition-colors"
            aria-label="Close menu"
          >
            <IoClose className="w-5 h-5 text-red-700" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col mt-4 px-4 gap-0.5 flex-1 overflow-y-auto">
          {navLinks.map((item) => (
            <a
              key={item}
              onClick={onClose}
              className="footer-link px-4 py-3.5 text-base font-medium text-gray-700 hover:text-red-700 active:text-red-700 rounded-xl hover:bg-[#F5E6E6] active:bg-[#F5E6E6] transition-colors relative"
            >
              {item}
            </a>
          ))}
        </nav>


        <div className="px-6 pb-8 pt-4 flex flex-col gap-3">
          <button className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-red-300 text-gray-700 font-medium text-sm hover:bg-[#F5E6E6] transition-colors">
            <FiUser className="w-4 h-4 text-red-700" />
            Login / Signup
          </button>
          <a className="flex items-center justify-center w-full py-3 rounded-full bg-[#B83232] hover:bg-red-900 text-white font-bold text-sm shadow-md transition-colors cursor-pointer">
            ORDER NOW
          </a>
        </div>
      </div>
    </>
  );
}
