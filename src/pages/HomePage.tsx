import Footer from "../components/footer/Footer";
import BestSellerSection from "../components/home/BestSellerSection";
import HeroSection from "../components/home/HeroSection";
import MenuSection from "../components/home/MenuSection";
import PromiseSection from "../components/home/PromiseSection";
import { getAllProducts } from "../service/product.service";

const HomePage = () => {
  const products = getAllProducts();
  return (
    <>
      <HeroSection />
      <MenuSection />
      <BestSellerSection products={products} />
      <PromiseSection />
      <Footer />
    </>
  );
};

export default HomePage;
