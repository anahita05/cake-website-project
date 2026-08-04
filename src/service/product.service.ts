import { products } from "../data/products";

export function getAllProducts() {
  return products;
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}