export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: string;
};

export type Order = {
  id: number;
  customer: string;
  product: string;
  amount: number;
  date: string;
  status: string;
};

export type Customer = {
  id: number;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  status: string;
};
