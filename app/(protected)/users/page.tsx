"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { canAccessUsers } from "@/lib/authorization";


interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedRole, setEditedRole] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: currentUser } = await supabase
        .from("users")
        .select("role")
        .eq("auth_user_id", user.id)
        .single();

      if (!currentUser || !canAccessUsers(currentUser.role)) {
        router.replace("/dashboard");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email, role")
        .order("id");

      console.log("USERS DATA:", data);
      console.log("USERS ERROR:", error);

      if (!error && data) {
        setUsers(data);
      }
    };

    loadUsers();
  }, [router]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          Users
        </h1>

        <button
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
        >
          + Add User
        </button>
      </div>

      <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
        <table className="w-full">
          <thead className="bg-zinc-800">
            <tr>
              <th className="text-left p-4">Full Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-zinc-800">
                <td className="p-4">{user.full_name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === "OWNER"
                      ? "bg-amber-500/20 text-amber-400"
                      : user.role === "TECHNICIAN"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : user.role === "MANAGER"
                          ? "bg-blue-500/20 text-blue-400"
                          : user.role === "CASHIER"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-zinc-500/20 text-zinc-400"
                      }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setEditedRole(user.role);
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm"
                  >
                    Edit
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">
              Edit User
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  Full Name
                </label>

                <input
                  value={selectedUser.full_name}
                  readOnly
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  Email
                </label>

                <input
                  value={selectedUser.email}
                  readOnly
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  Role
                </label>

                <select
                  value={editedRole}
                  onChange={(e) => setEditedRole(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                >
                  <option value="OWNER">OWNER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="TECHNICIAN">TECHNICIAN</option>
                  <option value="CASHIER">CASHIER</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}