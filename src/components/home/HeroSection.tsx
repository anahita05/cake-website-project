import strawberry from "../../assets/HomeIcon/Strawberry-cake.jpg";
import macaron from "../../assets/HomeIcon/macaron.jpg";
import blueCake from "../../assets/HomeIcon/blueCake.jpg";

const HeroSection = () => {
  return (
    <section className="bg-[#B83232] overflow-hidden relative">
      {/* Blobs */}
      <div className="absolute top-6 right-16 w-48 h-48 bg-white/5 rounded-[60%_40%_30%_70%/60%_30%_70%_40%]" />
      <div className="absolute bottom-4 left-1/3 w-32 h-32 bg-white/5 rounded-[60%_40%_30%_70%/60%_30%_70%_40%]" />
      <div className="absolute top-5 left-9 w-87 h-87 bg-white/5 rounded-[40%_90%_30%_70%/60%_90%_70%_80%]" />
      <div className="absolute bottom-8 right-89 w-77 h-88 bg-white/5 rounded-[90%_40%_30%_70%/60%_30%_70%_40%]" />
      <div className="absolute bottom-8 right-22 w-22 h-22 bg-white/5 rounded-[60%_40%_30%_50%/60%_30%_70%_90%]" />
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 relative z-10"> 
        
        {/* Mobile Layout */}
        <div className="flex md:hidden flex-col gap-6">
          <div className="flex items-start gap-4 relative">
            <div className="shrink-0 w-52 h-52 rounded-full bg-white/10 border-4 border-white/20 overflow-hidden shadow-2xl">
              <img
                src={strawberry}
                alt="Strawberry Cake"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute right-0 -top-9 flex flex-col gap-3">
              <div className="w-24 h-24 mt-32 rounded-2xl bg-white/10 overflow-hidden border-2 border-white/20 shadow-xl">
                <img
                  src={macaron}
                  alt="Macaron"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-24 h-24 rounded-2xl bg-white/10 overflow-hidden border-2 border-white/20 shadow-xl">
                <img
                  src={blueCake}
                  alt="Blueberry Cake"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="self-start text-white text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-200 mb-2">
              Limited Time Offer
            </p>

            <h1 className="font-serif text-4xl font-black leading-tight">
              Decadent
              <br />
              <span className="italic text-red-100">Strawberry</span>
              <br />
              Bliss!
            </h1>

            <p className="mt-3 text-red-200 text-base">
              Satisfy Your Sweetest Cravings
            </p>

            <div className="mt-5 inline-flex items-center gap-3">
              <span className="bg-white text-[#E53935] font-black text-xl px-5 py-2.5 rounded-full">
                SAVE 20%
              </span>

              <span className="text-xs text-red-200 font-medium">
                Special Offer!
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 justify-start">
              <a className="bg-white text-[#E53935] font-bold px-7 py-3 rounded-full hover:bg-[#FFF8F0] transition-colors shadow-lg text-sm">
                Order Now
              </a>

              <a className="border-2 border-white/40 text-white font-medium px-7 py-3 rounded-full hover:bg-white/10 transition-colors text-sm">
                Explore Menu
              </a>
            </div>
          </div>
        </div>

        {/* Tablet & Desktop Layout original */}
        <div className="hidden md:flex items-center gap-8">
          <div className="shrink-0 w-52 h-52 md:w-64 md:h-64 rounded-full bg-white/10 border-4 border-white/20 overflow-hidden shadow-2xl">
            <img
              src={strawberry}
              alt="Strawberry Cake"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-white text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-200 mb-2">
              Limited Time Offer
            </p>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
              Decadent
              <br />
              <span className="italic text-red-100">Strawberry</span>
              <br />
              Bliss!
            </h1>

            <p className="mt-3 text-red-200 text-base md:text-lg">
              Satisfy Your Sweetest Cravings
            </p>

            <div className="mt-5 inline-flex items-center gap-3">
              <span className="bg-white text-[#E53935] font-black text-xl px-5 py-2.5 rounded-full">
                SAVE 20%
              </span>

              <span className="text-xs text-red-200 font-medium">
                Special Offer!
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
              <a className="bg-white text-[#E53935] font-bold px-7 py-3 rounded-full hover:bg-[#FFF8F0] transition-colors shadow-lg text-sm">
                Order Now
              </a>

              <a className="border-2 border-white/40 text-white font-medium px-7 py-3 rounded-full hover:bg-white/10 transition-colors text-sm">
                Explore Menu
              </a>
            </div>
          </div>

          <div className="hidden md:flex flex-col gap-4 shrink-0">
            <div className="w-28 h-28 rounded-2xl bg-white/10 overflow-hidden border-3 border-white/20 shadow-xl">
              <img
                src={macaron}
                alt="Macaron"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-28 h-28 rounded-2xl bg-white/10 overflow-hidden border-3 border-white/20 shadow-xl animate-[fade-in_0.6s_ease_both] [animation-delay:500ms]">
              <img
                src={blueCake}
                alt="Blueberry Cake"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;