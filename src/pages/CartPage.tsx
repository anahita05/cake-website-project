import DeliveryDetails from "../components/shopping-box/DeliveryDetails";
import Header from "../components/shopping-box/Header";
import OrderItems from "../components/shopping-box/OrderItems";
import OrderSummary from "../components/shopping-box/OrderSummary";
import { useCartStore } from "../store/cartStore";

export interface CartItem {
  id: number;
  name: string;
  price: string;
  oldPrice: string;
  image: string;
  quantity: number;
}
const CartPage = () => {
  const items = useCartStore((state) => state.items);
  console.log(items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <>
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-10 grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        <div className="flex flex-col gap-6">
          <OrderItems
            items={items}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
          />
          <DeliveryDetails />
        </div>
        <OrderSummary />
      </div>
    </>
  );
};

export default CartPage;
