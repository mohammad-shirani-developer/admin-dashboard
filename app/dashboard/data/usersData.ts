import type { User } from "../types";

export const initialUsers: User[] = [
  {
    id: 1,
    name: "Ali Ahmadi",
    email: "ali@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Reza Mohammadi",
    email: "reza@example.com",
    role: "User",
    status: "Active",
  },
  {
    id: 3,
    name: "Sara Karimi",
    email: "sara@example.com",
    role: "User",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Mehdi Hosseini",
    email: "mehdi@example.com",
    role: "Manager",
    status: "Active",
  },
];
