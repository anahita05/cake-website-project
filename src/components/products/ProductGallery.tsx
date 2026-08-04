import type { Product } from "../../types/product";

interface ProductGalleryProps {
  product: Product;

}

const ProductGallery = ({ product }: ProductGalleryProps) => {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="relative max-w-5xl mx-auto px-6">
        <h2 className="font-serif font-bold text-[#B83232] text-4xl md:text-5xl uppercase text-center mb-14">
          A Closer<br/> Look
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {product.galleryItems.map(({ image, imageAlt }) => (
            <div key={imageAlt} className="group relative">
              <div className="relative aspect-square overflow-hidden p-6">
                <img src={image} alt={imageAlt} className="w-full h-full object-cover" />
              </div>
              <p className="relative text-center font-serif font-bold text-[#B83232] mt-2">
                {imageAlt}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGallery;
