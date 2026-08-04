import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../../store/cartStore";
import type { Product } from "../../../types/product";


interface ProductCardProps {
  product: Product;
  liked: boolean;
  onToggleLike: () => void;
};

const ProductCard = ({ product, liked, onToggleLike }: ProductCardProps) => {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);

  const goToDetail = () => {
    navigate(`/products/${product.slug}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      image: product.image,
    });
  };

  return (
    <div className="group bg-white rounded-2xl shadow-md cursor-pointer hover:scale-105 hover:shadow-xl transition-transform duration-300">
      <div className="relative bg-[#d2d4a044] h-44 flex rounded-t-2xl items-center justify-center p-4 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="product-img h-36 w-36 object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-110"
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike();
          }}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#86333333] flex items-center justify-center hover:bg-red-300 transition-colors"
        >
          {liked ? (
            <FaHeart className="text-red-700" />
          ) : (
            <FaRegHeart className="text-white" />
          )}
        </button>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-800">{product.name}</h3>

        <div className="flex items-center gap-1 mt-1">
          <span className="text-red-800 font-bold text-sm">
            {product.price}
          </span>
          <span className="text-gray-400 text-xs line-through ml-1">
            {product.oldPrice}
          </span>
        </div>

        <div className="flex items-center gap-1 mt-1">
          <span className="text-yellow-600 text-xs">{product.rating}</span>
          <span className="text-gray-400 text-xs">{product.reviews.count} reviews</span>
        </div>

        <button
          onClick={(e) => {
            handleAddToCart(e);
            goToDetail();
          }}
          className="mt-2 w-full bg-[#B83232] text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-red-900 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
