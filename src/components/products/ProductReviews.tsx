import { useState } from "react";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import type { Product, ProductReview } from "../../types/product";

const VISIBLE_COUNT = 3;

interface Props {
  product: Product;
}

const ReviewCard = ({ name, text }: ProductReview) => (
  <article className="bg-[#FFF0E8] rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex gap-1 text-[#B83232] mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <FaStar key={i} className="text-sm" />
      ))}
    </div>

    <p className="text-gray-600 text-sm leading-relaxed mb-4">{text}</p>

    <footer>
      <span className="font-serif font-bold text-[#B83232] text-sm">
        {name}
      </span>
    </footer>
  </article>
);

const ProductReviews = ({ product }: Props) => {
  const [startIndex, setStartIndex] = useState(0);
  const reviews = product.reviews.items;

  const goNext = () => {
    setStartIndex((prev) =>
      prev + VISIBLE_COUNT >= reviews.length ? 0 : prev + VISIBLE_COUNT
    );
  };

  const goPrev = () => {
    setStartIndex((prev) =>
      prev - VISIBLE_COUNT < 0
        ? Math.max(reviews.length - VISIBLE_COUNT, 0)
        : prev - VISIBLE_COUNT
    );
  };

  const visibleReviews = reviews.slice(
    startIndex,
    startIndex + VISIBLE_COUNT
  );

  return (
    <section className="relative py-24">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="font-serif font-bold text-[#B83232] text-4xl md:text-5xl uppercase text-center mb-14">
          Customer <br /> Love
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {visibleReviews.map((review) => (
            <ReviewCard key={review.name} {...review} />
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-10">
          <button
            onClick={goPrev}
            className="w-10 h-10 rounded-full bg-[#B83232] text-white flex items-center justify-center hover:scale-110 transition"
          >
            <FaChevronLeft />
          </button>

          <button
            onClick={goNext}
            className="w-10 h-10 rounded-full bg-[#B83232] text-white flex items-center justify-center hover:scale-110 transition"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductReviews;