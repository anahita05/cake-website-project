export interface ProductHighlight {
  title: string;
  subtitle: string;
}

export interface ProductGalleryItem {
  image: string;
  imageAlt: string;
}

export interface ProductReview {
  name: string;
  text: string;
}

export interface ProductReviews {
  count: number;
  items: ProductReview[];
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  price: string;
  oldPrice: string;
  rating: string;
  image: string;
  description: string;
  highlights: ProductHighlight[];
  galleryItems: ProductGalleryItem[];
  reviews: ProductReviews;
}
