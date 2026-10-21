import { withClasses } from "@/app/components/ui/form-controls";
import StatusBadge from "../../components/StatusBadge";
import type { User } from "../../types";

type UsersTableProps = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

const actionClasses =
  "rounded text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1";

const UsersTable = ({ users, onEdit, onDelete }: UsersTableProps) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-100 transition-colors hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  {user.name}
                </td>

                <td className="px-4 py-3 text-gray-600">{user.email}</td>

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
                        "text-blue-600 hover:text-blue-700",
                      )}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(user)}
                      className={withClasses(
                        actionClasses,
                        "text-red-600 hover:text-red-700",
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
                className="px-4 py-8 text-gray-600 text-center text-sm"
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
