import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const BackButton = () => {
  return (
    <div>
      <Link
        to="/"
        className="fixed top-16 right-6 md:top-24 z-50 flex items-center gap-2 bg-[#B83232] text-white px-5 py-2.5 rounded-full shadow-lg hover:bg-[#922727] hover:scale-105 transition-all duration-300"
      >
        <FaArrowLeft />
      </Link>
    </div>
  );
};

export default BackButton;
