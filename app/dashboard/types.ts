export type UserRole = "Admin" | "User" | "Manager";

export type UserStatus = "Active" | "Inactive";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  image?: string;
};
export type ProductCategory = "Laptop" | "Phone" | "Headphones";

export type ProductStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type Product = {
  id: number;
  name: string;
  price: number;
  category: ProductCategory;
  stock: number;
  status: ProductStatus;
  description?: string;
  thumbnail?: string;
};

export type OrderStatus = "Delivered" | "Processing" | "Pending" | "Cancelled";

export type OrderItem = {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  thumbnail?: string;
};

export type Order = {
  id: number;
  customer: string;
  product: string;
  amount: number;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
};

export type CustomerStatus = "Active" | "Inactive";

export type Customer = {
  id: number;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  status: CustomerStatus;
  image?: string;
};
