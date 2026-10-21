"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import FilterSelect from "@/app/components/ui/FilterSelect";
import {
  dangerButtonClasses,
  inputClasses,
  primaryButtonClasses,
  secondaryButtonClasses,
  withClasses,
} from "@/app/components/ui/form-controls";
import Pagination from "@/app/components/ui/Pagination";
import usePagination from "@/app/hooks/usePagination";
import type { UserRole, UserStatus } from "@/app/dashboard/types";
import ErrorState from "../components/ErrorState";
import TableSkeleton from "../components/TableSkeleton";
import { fetchUsers } from "@/app/lib/api";
import type { User } from "../types";
import UsersTable from "./components/UsersTable";

const ROLE_OPTIONS: ReadonlyArray<{ value: UserRole; label: string }> = [
  { value: "User", label: "User" },
  { value: "Admin", label: "Admin" },
  { value: "Manager", label: "Manager" },
];

type UserSort = "default" | "name-asc" | "name-desc";

const USER_SORT_OPTIONS: ReadonlyArray<{ value: UserSort; label: string }> = [
  { value: "default", label: "Sort: Featured" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

const USER_STATUS_OPTIONS: ReadonlyArray<{ value: UserStatus; label: string }> =
  [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

const USERS_PAGE_SIZE = 8;

/**
 * DummyJSON is a read-only API — created/updated/deleted users live only in
 * the React Query cache, with ids coming from a module-level counter.
 */
let createdUserCount = 0;
const nextCreatedUserId = () => {
  createdUserCount += 1;
  return 900000 + createdUserCount;
};

const PageUsers = () => {
  const queryClient = useQueryClient();

  const {
    data: userList = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState<"All" | UserRole>("All");

  const [statusFilter, setStatusFilter] = useState<"All" | UserStatus>("All");

  const [sort, setSort] = useState<UserSort>("default");

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [role, setRole] = useState<UserRole>("User");

  const [status, setStatus] = useState<UserStatus>("Active");

  const [formError, setFormError] = useState("");

  const filteredUsers = useMemo(() => {
    const searchValue = search.toLowerCase();

    const matches = userList.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue);

      const matchesRole = roleFilter === "All" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });

    const sorted = [...matches];

    switch (sort) {
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted;
    }
  }, [userList, search, roleFilter, statusFilter, sort]);

  const {
    page,
    pageCount,
    pageItems: pageUsers,
    setPage,
    totalItems,
  } = usePagination(filteredUsers, USERS_PAGE_SIZE);

  // Every filter change sends the user back to the first page.
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleChange = (value: "All" | UserRole) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleStatusChange = (value: "All" | UserStatus) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleSortChange = (value: UserSort) => {
    setSort(value);
    setPage(1);
  };

  const clearFilters = () => {
    handleSearchChange("");
    handleRoleChange("All");
    handleStatusChange("All");
    handleSortChange("default");
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("User");
    setStatus("Active");
    setFormError("");
  };

  const validateForm = () => {
    if (!name.trim() || !email.trim()) {
      setFormError("Name and email are required.");
      return false;
    }

    if (!email.includes("@")) {
      setFormError("Please enter a valid email.");
      return false;
    }

    setFormError("");
    return true;
  };

  const handleAddUser = () => {
    if (!validateForm()) {
      return;
    }

    // DummyJSON is read-only — the new user is added to the query cache only.
    queryClient.setQueryData<User[]>(["users"], (previous = []) => [
      {
        id: nextCreatedUserId(),
        name: name.trim(),
        email: email.trim(),
        role,
        status,
      },
      ...previous,
    ]);

    resetForm();
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
    if (!editingUser) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    // DummyJSON is read-only — the edit is applied to the query cache only.
    queryClient.setQueryData<User[]>(["users"], (previous = []) =>
      previous.map((user) =>
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
    resetForm();
    setIsFormOpen(false);
  };

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
  };

  const handleConfirmDelete = () => {
    if (!deletingUser) {
      return;
    }

    // DummyJSON is read-only — the delete is applied to the query cache only.
    queryClient.setQueryData<User[]>(["users"], (previous = []) =>
      previous.filter((user) => user.id !== deletingUser.id),
    );

    setDeletingUser(null);
  };

  if (isLoading) {
    return (
      <div className="mx-4 mt-6 sm:mx-6 lg:mx-8">
        <TableSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-4 mt-6 sm:mx-6 lg:mx-8">
        <ErrorState onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-4 mt-6 pb-6 sm:mx-6 lg:mx-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Users
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your users
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingUser(null);
            resetForm();
            setIsFormOpen(true);
          }}
          className={withClasses(primaryButtonClasses, "w-full sm:w-auto")}
        >
          Add User
        </button>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={withClasses(inputClasses, "sm:flex-1")}
        />

        <FilterSelect
          ariaLabel="Filter by role"
          value={roleFilter}
          options={[
            { value: "All" as const, label: "All Roles" },
            ...ROLE_OPTIONS,
          ]}
          onChange={handleRoleChange}
          className="sm:w-40"
        />

        <FilterSelect
          ariaLabel="Filter by status"
          value={statusFilter}
          options={[
            { value: "All" as const, label: "All Status" },
            ...USER_STATUS_OPTIONS,
          ]}
          onChange={handleStatusChange}
          className="sm:w-40"
        />

        <FilterSelect
          ariaLabel="Sort users"
          value={sort}
          options={USER_SORT_OPTIONS}
          onChange={handleSortChange}
          className="sm:w-44"
        />

        {(search ||
          roleFilter !== "All" ||
          statusFilter !== "All" ||
          sort !== "default") && (
          <button
            type="button"
            onClick={clearFilters}
            className={withClasses(secondaryButtonClasses, "w-full sm:w-auto")}
          >
            Clear Filters
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editingUser ? "Edit User" : "Add New User"}
          </h2>

          {formError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {formError}
            </p>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="user-name"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Name
              </label>
              <input
                id="user-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormError("");
                }}
                className={inputClasses}
                placeholder="Enter name"
              />
            </div>

            <div>
              <label
                htmlFor="user-email"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
                placeholder="Enter email"
              />
            </div>

            <div>
              <label
                htmlFor="user-role"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Role
              </label>

              <FilterSelect
                id="user-role"
                value={role}
                options={ROLE_OPTIONS}
                onChange={setRole}
              />
            </div>

            <div>
              <label
                htmlFor="user-status"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Status
              </label>

              <FilterSelect
                id="user-status"
                value={status}
                options={USER_STATUS_OPTIONS}
                onChange={setStatus}
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className={withClasses(secondaryButtonClasses, "w-full sm:w-auto")}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={editingUser ? handleUpdateUser : handleAddUser}
                className={withClasses(primaryButtonClasses, "w-full sm:w-auto")}
              >
                {editingUser ? "Update User" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm dark:border-red-900 dark:bg-red-950/40">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">
            Delete User
          </h2>

          <p className="mt-2 text-sm text-red-700 dark:text-red-300/90">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{deletingUser.name}</span>?
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setDeletingUser(null)}
              className={withClasses(secondaryButtonClasses, "w-full sm:w-auto")}
            >
              Cancel
            </button>

            <button
              type="button"
              className={withClasses(dangerButtonClasses, "w-full sm:w-auto")}
              onClick={handleConfirmDelete}
            >
              Delete User
            </button>
          </div>
        </div>
      )}

      <UsersTable
        users={pageUsers}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      <Pagination
        page={page}
        pageCount={pageCount}
        totalItems={totalItems}
        pageSize={USERS_PAGE_SIZE}
        itemLabel="users"
        onPageChange={setPage}
      />
    </div>
  );
};

export default PageUsers;
