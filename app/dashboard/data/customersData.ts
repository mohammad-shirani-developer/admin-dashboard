import type { Customer } from "../types";

export const initialCustomers: Customer[] = [
  {
    id: 1,
    name: "Ali Ahmadi",
    email: "ali@example.com",
    orders: 8,
    totalSpent: 4250,
    status: "Active",
  },
  {
    id: 2,
    name: "Sara Mohammadi",
    email: "sara@example.com",
    orders: 5,
    totalSpent: 2180,
    status: "Active",
  },
  {
    id: 3,
    name: "Reza Karimi",
    email: "reza@example.com",
    orders: 2,
    totalSpent: 740,
    status: "Inactive",
  },
  {
    id: 4,
    name: "Nima Hosseini",
    email: "nima@example.com",
    orders: 11,
    totalSpent: 5890,
    status: "Active",
  },
];
