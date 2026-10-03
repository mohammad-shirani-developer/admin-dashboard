import type { Product } from "../types";
import ProductsTable from "./components/ProductsTable";

const products: Product[] = [
  {
    id: 1,
    name: "MacBook Pro",
    price: 1999,
    category: "Laptop",
    stock: 12,
    status: "In Stock",
  },
  {
    id: 2,
    name: "iPhone 17",
    price: 999,
    category: "Phone",
    stock: 25,
    status: "In Stock",
  },
  {
    id: 3,
    name: "Sony WH-1000XM5",
    price: 349,
    category: "Headphones",
    stock: 0,
    status: "Out of Stock",
  },
  {
    id: 4,
    name: "Samsung Galaxy S26",
    price: 899,
    category: "Phone",
    stock: 8,
    status: "Low Stock",
  },
];

const ProductsPage = () => {
  return (
    <div className="mx-4 mt-6 sm:mx-6 lg:mx-8">
      <h1 className="mb-5 text-2xl font-bold text-gray-900">Products</h1>

      <ProductsTable products={products} />
    </div>
  );
};

export default ProductsPage;
