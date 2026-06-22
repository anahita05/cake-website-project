import { PiCake, PiCakeLight } from "react-icons/pi";
import { useCartStore } from "../../store/cartStore";

const CURRENCY = "$";

const parsePrice = (price: string) =>
  parseFloat(price.replace(/[^0-9.]/g, "")) || 0;

const OrderSummary = () => {
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const delivery = 5;
  const subtotal = getTotalPrice();
  const total = subtotal + (items.length > 0 ? delivery : 0);

  return (
    <div className="lg:sticky lg:top-24">
      <div className="bg-white rounded-3xl shadow-md overflow-hidden">
        <div className="relative bg-[#B83232] px-6 py-5">
          <p className="font-serif font-bold text-white text-lg uppercase">
            Order Summary
          </p>
        </div>

        <div className="p-6 flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-500 truncate mr-4">
                {item.name}
                <span className="text-gray-400"> × {item.quantity}</span>
              </span>

              <span className="font-semibold text-gray-700 shrink-0">
                {CURRENCY}
                {(parsePrice(item.price) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}

          <div className="border-t border-red-50 pt-3 mt-1 flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>

              <span className="font-semibold text-gray-700">
                {CURRENCY}
                {subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Delivery</span>

              <span className="font-semibold text-gray-700">
                {CURRENCY}
                {delivery.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-base font-bold text-[#B83232] border-t border-red-100 pt-2 mt-1">
              <span>Total</span>

              <span>
                {CURRENCY}
                {total.toFixed(2)}
              </span>
            </div>
          </div>

          <button className="mt-2 w-full bg-[#B83232] text-white font-bold py-4 rounded-full hover:bg-[#922727] transition-all flex items-center justify-center gap-2">
            Place Order 
            <PiCake 
            className="w-5 h-5"/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;