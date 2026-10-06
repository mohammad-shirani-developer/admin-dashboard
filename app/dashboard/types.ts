export type UserRole = "Admin" | "User" | "Manager";

export type UserStatus = "Active" | "Inactive";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
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
};

export type OrderStatus = "Completed" | "Pending" | "Cancelled";

export type Order = {
  id: number;
  customer: string;
  product: string;
  amount: number;
  date: string;
  status: OrderStatus;
};

export type CustomerStatus = "Active" | "Inactive";

export type Customer = {
  id: number;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  status: CustomerStatus;
};
