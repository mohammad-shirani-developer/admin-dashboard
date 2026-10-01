"use client";

import { useState } from "react";
import { User } from "../types";
import UsersTable from "./components/UsersTable";

const users: User[] = [
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

const PageUsers = () => {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((user) => {
    const searchValue = search.toLowerCase();

    return (
      user.name.toLowerCase().includes(searchValue) ||
      user.email.toLowerCase().includes(searchValue)
    );
  });
  return (
    <div className="mx-4 mt-6 sm:mx-6 lg:mx-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">Manage dashboard users</p>
          <p className="mt-1 text-sm text-gray-500">
            {filteredUsers.length} users found
          </p>
        </div>

        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:w-64"
        />
      </div>

      <UsersTable users={filteredUsers} />
    </div>
  );
};

export default PageUsers;
