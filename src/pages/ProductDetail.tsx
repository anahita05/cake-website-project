import { useParams } from "react-router-dom";
import { products } from "../types/ProductTypes";
import ProductHero from "../components/cards/ProductHero";
import ProductAbout from "../components/cards/ProductAbout";
import ProductGallery from "../components/cards/ProductGallery";
import ProductOrder from "../components/cards/ProductOrder";
import ProductReviews from "../components/cards/ProductReviews";
import BackButton from "../components/BackButton";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === Number(id));
  if (!product) {
    return <div>Product not found !</div>;
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] overflow-x-hidden relative">
      <BackButton />

      <ProductHero product={product} />
      <ProductAbout product={product} />
      <ProductGallery product={product} />
      <ProductOrder product={product} />
      <ProductReviews />
    </div>
  );
};

export default ProductDetail;
