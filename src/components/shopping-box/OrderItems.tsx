import { FaTrash } from "react-icons/fa";
import type { CartItem } from "../../store/cartStore";

const OrderItems = ({
  items,
  updateQuantity,
  removeItem,
}: {
  items: CartItem[];
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-md p-6">
      <h2 className="font-serif font-bold text-[#B83232] text-xl mb-5">
        Order Items
      </h2>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 bg-[#FFF8F0] rounded-2xl"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FFE3D4] shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">
                {item.name}
              </p>
              <p className="text-[#B83232] font-bold text-sm mt-0.5">
                {item.price}
                <span className="text-gray-400 font-normal line-through ml-2 text-xs">
                  {item.oldPrice}
                </span>
              </p>
            </div>

            <div className="flex items-center bg-white rounded-full shadow-sm overflow-hidden border border-red-100">
              <button
                onClick={() =>
                  updateQuantity(item.id, item.quantity - 1)
                }
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-[#B83232] hover:text-white transition-colors font-bold"
              >
                −
              </button>

              <span className="w-8 text-center font-bold text-gray-700 text-sm">
                {item.quantity}
              </span>

              <button
                onClick={() =>
                  updateQuantity(item.id, item.quantity + 1)
                }
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-[#B83232] hover:text-white transition-colors font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-[#B83232] transition-colors shrink-0"
            >
              <FaTrash className="text-xs" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default OrderItems;