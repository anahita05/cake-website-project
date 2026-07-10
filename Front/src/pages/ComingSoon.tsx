import { motion } from "framer-motion";
import CakeAnimation from "../assets/Coming soon.svg";
import { Link } from "react-router-dom";

const ComingSoon = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF8F0] text-center px-4">
      
      <motion.img
        src={CakeAnimation}
        className="w-72 h-72"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      <h1 className="text-2xl font-bold text-[#B83232] mt-6">
         This page is baking ...

      </h1>
      <p className="text-gray-500 mt-2">
        We’re still preparing something delicious...
      </p>
      <Link to="/">
      <button className="mt-6 px-6 py-3 bg-[#B83232] text-white rounded-full hover:bg-[#922727] transition">
        Back Home
      </button>
      </Link>
    </div>
  );
};

export default ComingSoon;