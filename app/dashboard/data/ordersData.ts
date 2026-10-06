import type { Order } from "../types";

export const initialOrders: Order[] = [
  {
    id: 1001,
    customer: "Ali Ahmadi",
    product: "MacBook Pro",
    amount: 1999,
    date: "2026-10-01",
    status: "Completed",
  },
  {
    id: 1002,
    customer: "Sara Mohammadi",
    product: "iPhone 17",
    amount: 999,
    date: "2026-10-02",
    status: "Pending",
  },
  {
    id: 1003,
    customer: "Reza Karimi",
    product: "Sony WH-1000XM5",
    amount: 349,
    date: "2026-10-02",
    status: "Cancelled",
  },
  {
    id: 1004,
    customer: "Nima Hosseini",
    product: "Samsung Galaxy S26",
    amount: 899,
    date: "2026-10-03",
    status: "Completed",
  },
];
