import { useParams } from "react-router-dom";
import ProductHero from "../components/products/ProductHero";
import ProductAbout from "../components/products/ProductAbout";
import ProductGallery from "../components/products/ProductGallery";
import ProductOrder from "../components/products/ProductOrder";
import ProductReviews from "../components/products/ProductReviews";
import BackButton from "../components/BackButton";
import { getProduct } from "../service/product.service";

const ProductDetail = () => {

const { slug } = useParams<{ slug: string }>();
const product = getProduct(slug ?? "");
if (!product) {
  return <div>Product not found!</div>;
}

  return (
    <div className="min-h-screen bg-[#FFF8F0] overflow-x-hidden relative">
      <BackButton />

      <ProductHero product={product} />
      <ProductAbout product={product} />
      <ProductGallery product={product} />
      <ProductOrder product={product} />
      <ProductReviews product={product} />
    </div>
  );
};

export default ProductDetail;
