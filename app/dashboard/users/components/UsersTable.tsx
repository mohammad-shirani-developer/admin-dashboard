"use client";

import { withClasses } from "@/app/components/ui/form-controls";
import Avatar from "@/app/components/ui/Avatar";
import StatusBadge from "../../components/StatusBadge";
import type { User } from "../../types";

type UsersTableProps = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

const actionClasses =
  "rounded text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-900";

const UsersTable = ({ users, onEdit, onDelete }: UsersTableProps) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {users.length > 0 ? (
            users.map((user) => (
              <tr
                key={user.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={user.image} name={user.name} />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {user.name}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {user.email}
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={user.role} />
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={user.status} />
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      className={withClasses(
                        actionClasses,
                        "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
                      )}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(user)}
                      className={withClasses(
                        actionClasses,
                        "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300",
                      )}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                className="px-4 py-8 text-center text-sm text-gray-600 dark:text-gray-400"
                colSpan={5}
              >
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
