import type { Product } from "../types";

export const initialProducts: Product[] = [
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
