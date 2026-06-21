const Header = () => {
  
  return (
    <>
      <div className="relative bg-[#B83232] overflow-hidden">
          <svg
            viewBox="0 0 800 180"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 L800,0 L800,140 C600,180 400,100 0,160 Z"
              fill="rgba(0,0,0,0.08)"
            />
          </svg>

          <div className="relative max-w-5xl mx-auto px-6 py-10 flex items-center gap-4">
            <div>
              <h1 className="font-serif font-bold text-white text-3xl md:text-4xl uppercase">
                Your Cart
              </h1>
            </div>
          </div>
      </div>
    </>
  );
};

export default Header;
