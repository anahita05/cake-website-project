import { MdOutlineCookie } from "react-icons/md";
import { MdAddCircleOutline } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { PiWineDuotone } from "react-icons/pi";
import { Link } from "react-router-dom";

const MenuSection = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-gray-900">
              Menu
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              What will you wish for?
            </p>
          </div>

          <div className="grid grid-cols-4 md:flex md:flex-wrap gap-3">
            <Link to="*">
              <button className="flex flex-col items-center gap-2 px-3 py-3 md:px-5 bg-[#B83232] text-white rounded-2xl shadow-md shadow-red-300/30 hover:bg-red-900 transition-colors">
                <MdAddCircleOutline />
                <span className="text-xs font-semibold">CLASSIC</span>
              </button>
            </Link>
            <Link to="*">
              <button className="flex flex-col items-center gap-2 px-3 py-3 md:px-5 bg-[#f4eed4] text-red-600 rounded-2xl hover:bg-red-100 transition-colors">
                <PiWineDuotone />
                <span className="text-xs font-semibold">GOURMET</span>
              </button>
            </Link>
            <Link to="*">
              <button className="flex flex-col items-center gap-2 px-3 py-3 md:px-5 bg-[#f4eed4] text-red-600 rounded-2xl hover:bg-red-100 transition-colors">
                <IoLocationOutline />
                <span className="text-xs font-semibold">DESSERTS</span>
              </button>
            </Link>
            <Link to="*">
              <button className="flex flex-col items-center gap-2 px-3 py-3 md:px-5 bg-[#f4eed4] text-red-600 rounded-2xl hover:bg-red-100 transition-colors">
                <MdOutlineCookie />
                <span className="text-xs font-semibold tracking-wide">
                  COOKIES
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
