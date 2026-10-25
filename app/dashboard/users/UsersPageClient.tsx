"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { createUser, deleteUser, fetchUsers, updateUser } from "@/app/lib/api";
import type { UserWriteInput } from "@/app/lib/api";
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
 * Mutations hit the real DummyJSON write endpoints (POST /users/add,
 * PUT/DELETE /users/:id) and every list change is applied optimistically:
 * the cache updates before the request, so the UI reacts instantly, and a
 * failed request rolls the snapshot back instead of leaving the table in a
 * state the server never confirmed. Entities created this session stay
 * cache-only afterwards — DummyJSON's fake database would 404 them (see
 * api.ts) — while original entities are really written.
 */

const PageUsers = () => {
  const queryClient = useQueryClient();

  const {
    data: userList = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState<"All" | UserRole>("All");

  const [statusFilter, setStatusFilter] = useState<"All" | UserStatus>("All");

  const [sort, setSort] = useState<UserSort>("default");

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  /* ------------------------------ mutations ------------------------------ */

  const createUserMutation = useMutation({
    mutationFn: (input: UserWriteInput) => createUser(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });

      const optimisticId = -Date.now();

      queryClient.setQueryData<User[]>(["users"], (old = []) => [
        { id: optimisticId, ...input },
        ...old,
      ]);

      return { optimisticId };
    },
    onSuccess: (createdUser, _input, context) => {
      // Swap the optimistic row for the created one (unique local id).
      queryClient.setQueryData<User[]>(["users"], (old = []) =>
        old.map((user) =>
          user.id === context?.optimisticId ? createdUser : user,
        ),
      );

      // The optimistic row is prepended, so it always lands on page 1.
      setPage(1);
      setEditingUser(null);
      resetForm();
      setIsFormOpen(false);
    },
    onError: (_error, _input, context) => {
      /* Narrow rollback: only the optimistic row is removed. Restoring a
         whole-list snapshot here would silently revert an unrelated
         mutation that succeeded while this create was in flight. */
      queryClient.setQueryData<User[]>(["users"], (old = []) =>
        old.filter((user) => user.id !== context?.optimisticId),
      );

      // The form stays open with the values intact so nothing is retyped.
      setFormError("Could not create the user. Please try again.");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (user: User) => updateUser(user),
    onMutate: async (updatedUser) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });

      // Snapshot only the affected row — not the whole list.
      const previousUser = queryClient
        .getQueryData<User[]>(["users"])
        ?.find((user) => user.id === updatedUser.id);

      queryClient.setQueryData<User[]>(["users"], (old = []) =>
        old.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
      );

      return { previousUser };
    },
    onSuccess: (savedUser) => {
      queryClient.setQueryData<User[]>(["users"], (old = []) =>
        old.map((user) => (user.id === savedUser.id ? savedUser : user)),
      );

      setEditingUser(null);
      resetForm();
      setIsFormOpen(false);
    },
    onError: (_error, _updatedUser, context) => {
      /* Narrow rollback: only the edited row reverts. A wholesale snapshot
         restore would also revert unrelated mutations that succeeded while
         this save was in flight. */
      if (context?.previousUser) {
        const previousUser = context.previousUser;

        queryClient.setQueryData<User[]>(["users"], (old = []) =>
          old.map((user) =>
            user.id === previousUser.id ? previousUser : user,
          ),
        );
      }

      setFormError("Could not save the changes. Please try again.");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (user: User) => deleteUser(user),
    onMutate: async (user) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });

      const oldUsers = queryClient.getQueryData<User[]>(["users"]) ?? [];
      const deletedAtIndex = oldUsers.findIndex(
        (candidate) => candidate.id === user.id,
      );

      queryClient.setQueryData<User[]>(["users"], (old = []) =>
        old.filter((candidate) => candidate.id !== user.id),
      );

      setDeletingUser(null);
      setDeleteError(null);

      return { deletedUser: user, deletedAtIndex };
    },
    onError: (_error, _user, context) => {
      if (context?.deletedUser) {
        /* Narrow rollback: re-insert only the deleted row at its original
           position instead of restoring the whole pre-delete snapshot. */
        queryClient.setQueryData<User[]>(["users"], (old = []) => {
          if (
            old.some((candidate) => candidate.id === context.deletedUser.id)
          ) {
            return old;
          }

          const restored = [...old];

          restored.splice(
            Math.min(context.deletedAtIndex, restored.length),
            0,
            context.deletedUser,
          );

          return restored;
        });
      }

      setDeleteError(
        `Could not delete ${context?.deletedUser.name ?? "the user"}. The list was restored — please try again.`,
      );
    },
  });

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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
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

    // Optimistic: the row appears instantly and is replaced by the
    // server-created user (real id) once POST /users/add answers.
    createUserMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      role,
      status,
    });
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
    if (!editingUser || !validateForm()) {
      return;
    }

    // Optimistic: the edit applies to the table at once; a failed PUT
    // rolls the row back and reopens the error inside the form.
    updateUserMutation.mutate({
      ...editingUser,
      name: name.trim(),
      email: email.trim(),
      role,
      status,
    });
  };

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
  };

  const handleConfirmDelete = () => {
    if (!deletingUser) {
      return;
    }

    // Optimistic: the row disappears at once; a failed DELETE restores it
    // and surfaces the error above the table.
    deleteUserMutation.mutate(deletingUser);
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
        <ErrorState onRetry={() => void refetch()} retrying={isFetching} />
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
            <p
              role="alert"
              id="user-form-error"
              className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400"
            >
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
                aria-invalid={Boolean(formError) || undefined}
                aria-describedby={formError ? "user-form-error" : undefined}
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
                aria-invalid={Boolean(formError) || undefined}
                aria-describedby={formError ? "user-form-error" : undefined}
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
                disabled={createUserMutation.isPending || updateUserMutation.isPending}
                onClick={editingUser ? handleUpdateUser : handleAddUser}
                className={withClasses(primaryButtonClasses, "w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto")}
              >
                {editingUser
                  ? updateUserMutation.isPending
                    ? "Saving..."
                    : "Update User"
                  : createUserMutation.isPending
                    ? "Creating..."
                    : "Create User"}
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
              disabled={deleteUserMutation.isPending}
              className={withClasses(dangerButtonClasses, "w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto")}
              onClick={handleConfirmDelete}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </button>
          </div>
        </div>
      )}

      {deleteError && (
        <div
          className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          role="alert"
        >
          <span>{deleteError}</span>

          <button
            type="button"
            onClick={() => setDeleteError(null)}
            className="font-semibold underline underline-offset-2"
          >
            Dismiss
          </button>
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
