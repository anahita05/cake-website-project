import { useEffect, useRef, useState } from "react";
import { IoClose, IoSearch, IoTimeOutline } from "react-icons/io5";
import { LuTrendingUp } from "react-icons/lu";

const suggestions = ["Birthday Cake", "Chocolate Truffle", "Theme Cakes", "Anniversary"];
const trending = ["Red Velvet", "Cupcakes", "Cheesecake"];

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!visible) return null;

  if (typeof window !== "undefined" && window.innerWidth >= 1024) 
    return null;


  return (
    <div
      className={`fixed inset-0 z-80 flex flex-col items-center pt-20 px-4 transition-all duration-300 bg-black/55 backdrop-blur-[6px] ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
       >
      {/* Search box */}
      <div
        className={`w-full max-w-xl transition-all duration-300 ${
          isOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3.5 shadow-2xl ring-2 ring-red-200">
          <IoSearch className="w-5 h-5 text-red-700 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cakes, desserts, themes..."
            className="flex-1 text-base outline-none text-gray-800 placeholder:text-gray-400 bg-transparent"
          />

          <div className="w-px h-5 bg-gray-200" />
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors shrink-0"
            aria-label="Close search"
          >
            <IoClose className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Suggestions panel */}
        <div
          className={`mt-3 bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 delay-75 ${
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <div className="px-5 pt-4 pb-3 border-b border-gray-100">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <IoTimeOutline className="w-3.5 h-3.5" />
              Quick picks
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="text-sm px-3.5 py-1.5 rounded-full border border-red-100 bg-red-50 text-red-700 hover:bg-red-100 transition-colors font-medium"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>


          <div className="px-5 pt-3 pb-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <LuTrendingUp className="w-3.5 h-3.5" />
              Trending now
            </p>
            <ul>
              {trending.map((item, i) => (
                <li key={item}>
                  <button
                    onClick={() => setQuery(item)}
                    className="w-full text-left flex items-center gap-3 py-2 text-sm text-gray-700 hover:text-red-700 transition-colors group"
                  >
                    <span className="text-[11px] font-bold text-gray-300 w-4 text-center group-hover:text-red-300 transition-colors">
                      {i + 1}
                    </span>
                    {item}
                  </button>
                  {i < trending.length - 1 && (
                    <div className="h-px bg-gray-50 ml-7" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
