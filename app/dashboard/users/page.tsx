"use client";

import { useState } from "react";
import { initialUsers } from "../data/usersData";
import type { User, UserRole, UserStatus } from "../types";
import UsersTable from "./components/UsersTable";

const PageUsers = () => {
  const [userList, setUserList] = useState<User[]>(initialUsers);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("All");

  const [statusFilter, setStatusFilter] = useState("All");

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [role, setRole] = useState<UserRole>("User");

  const [status, setStatus] = useState<UserStatus>("Active");

  const [formError, setFormError] = useState("");

  const filteredUsers = userList.filter((user) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      user.name.toLowerCase().includes(searchValue) ||
      user.email.toLowerCase().includes(searchValue);

    const matchesRole = roleFilter === "All" || user.role === roleFilter;

    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("All");
    setStatusFilter("All");
  };

  const handleAddUser = () => {
    if (!name.trim() || !email.trim()) {
      setFormError("Name and email are required.");
      return;
    }

    if (!email.includes("@")) {
      setFormError("Please enter a valid email.");
      return;
    }

    setFormError("");

    const newUser: User = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      role,
      status,
    };

    setUserList((currentUsers) => [...currentUsers, newUser]);

    setName("");
    setEmail("");
    setRole("User");
    setStatus("Active");
    setIsFormOpen(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setStatus(user.status);
    setIsFormOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    if (!name.trim() || !email.trim()) {
      setFormError("Name and email are required.");
      return;
    }

    if (!email.includes("@")) {
      setFormError("Please enter a valid email.");
      return;
    }

    setFormError("");

    setUserList((currentUsers) =>
      currentUsers.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              name: name.trim(),
              email: email.trim(),
              role,
              status,
            }
          : user,
      ),
    );

    setEditingUser(null);
    setName("");
    setEmail("");
    setRole("User");
    setStatus("Active");
    setIsFormOpen(false);
  };

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
  };

  const handleConfirmDelete = () => {
    if (!deletingUser) return;

    setUserList((currentUsers) =>
      currentUsers.filter((user) => user.id !== deletingUser.id),
    );

    setDeletingUser(null);
  };

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

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setEditingUser(null);
              setName("");
              setEmail("");
              setRole("User");
              setStatus("Active");
              setFormError("");
              setIsFormOpen(true);
            }}
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Add User
          </button>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:w-64"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:w-40"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
            <option value="Manager">Manager</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:w-40"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {search || roleFilter !== "All" || statusFilter !== "All" ? (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      </div>

      {isFormOpen && (
        <div className="mb-5 rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingUser ? "Edit User" : "Add New User"}
          </h2>

          {formError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {formError}
            </p>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormError("");
                }}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition  focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                placeholder="Enter name"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition  focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Role
              </label>

              <select
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition  focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as UserStatus)
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition  focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingUser(null);
                  setName("");
                  setEmail("");
                  setRole("User");
                  setStatus("Active");
                  setFormError("");
                }}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={editingUser ? handleUpdateUser : handleAddUser}
                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                {editingUser ? "Update User" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="mb-5 rounded-lg border border-red-100 bg-red-50 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Delete User</h2>

          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-medium text-gray-900">
              {deletingUser.name}
            </span>
            ?
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setDeletingUser(null)}
              className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Cancel
            </button>

            <button
              type="button"
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
              onClick={handleConfirmDelete}
            >
              Delete User
            </button>
          </div>
        </div>
      )}

      <UsersTable
        users={filteredUsers}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
    </div>
  );
};

export default PageUsers;
