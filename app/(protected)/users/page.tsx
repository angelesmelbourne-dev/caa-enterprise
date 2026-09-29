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
  status: string;
}
const ROLES = ["OWNER", "MANAGER", "TECHNICIAN", "CASHIER"];

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedRole, setEditedRole] = useState("");
  const [editedStatus, setEditedStatus] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("");


  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("TECHNICIAN");
  const [createdUser, setCreatedUser] = useState<{
    email: string;
    password: string;
    role: string;
  } | null>(null);



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
        .select("id, role, full_name")
        .eq("auth_user_id", user.id)
        .single();
setCurrentUserName(currentUser?.full_name || "");
      setCurrentUserId(currentUser?.id || null);


      if (!currentUser || !canAccessUsers(currentUser.role)) {
        router.replace("/dashboard");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email, role, status")
        .order("id");

      console.log("USERS DATA:", data);
      console.log("USERS ERROR:", error);

      if (!error && data) {
        setUsers(data);
      }
    };

    loadUsers();
  }, [router]);
  const handleSaveRole = async () => {
    if (selectedUser?.id === currentUserId) {
      alert("You cannot change your own role.");
      return;
    }
    if (!selectedUser) return;
    const originalStatus = selectedUser.status;
    if (originalStatus !== editedStatus) {
      const { error: auditError } = await supabase
        .from("audit_logs")
        .insert({
          action:
            editedStatus === "ACTIVE"
              ? "USER_ACTIVATED"
              : "USER_DEACTIVATED",

          details: `${selectedUser.full_name}`,
          performed_by_name: currentUserName,
        });

      console.log("STATUS AUDIT ERROR:", auditError);
    }
    const originalRole = selectedUser.role;

    const { data, error } = await supabase
      .from("users")
      .update({
        role: editedRole,
        status: editedStatus,
      })
      .eq("id", selectedUser.id)
      .select();

    console.log("UPDATE DATA:", data);
    console.log("UPDATE ERROR:", error);
    console.log("EDITED ROLE:", editedRole);
    console.log("SELECTED USER:", selectedUser);
    if (error) {
      console.error(error);
      return;
    }
    if (originalRole !== editedRole) {
      const { error: auditError } = await supabase
        .from("audit_logs")
        .insert({
          action: "ROLE_UPDATED",
          details: `${selectedUser.full_name}: ${originalRole} -> ${editedRole}`,
        });

      console.log("ROLE AUDIT ERROR:", auditError);
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? {
            ...u,
            role: editedRole,
            status: editedStatus,
          }
          : u
      )
    );

    setIsModalOpen(false);
  };

  const handleCreateUser = async () => {
    const response = await fetch("/api/users/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: newFullName,
        email: newEmail,
        role: newRole,
      }),
    });

    const result = await response.json();

    console.log("CREATE USER RESPONSE:", result);

    if (result.success) {
      setCreatedUser({
        email: result.email,
        password: result.tempPassword,
        role: result.role,
      });

      setIsAddUserModalOpen(false);

      setNewFullName("");
      setNewEmail("");
      setNewRole("TECHNICIAN");

      const { data } = await supabase
        .from("users")
        .select("id, full_name, email, role, status")
        .order("id");

      if (data) {
        setUsers(data);
      }
    }
  };
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          Users
        </h1>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="..."
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
              <th className="text-left p-4">Status</th>
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
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === "ACTIVE"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                      }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setEditedRole(user.role);
                      setEditedStatus(user.status);
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
                  disabled={selectedUser.id === currentUserId}
                  value={editedRole}
                  onChange={(e) => setEditedRole(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 mb-6 disabled:opacity-50"
                >
                  <option value="OWNER">OWNER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="TECHNICIAN">TECHNICIAN</option>
                  <option value="CASHIER">CASHIER</option>
                </select>
                {selectedUser.id === currentUserId && (
                  <p className="text-xs text-zinc-500 mt-1">
                    You can&apos;t change your own role.
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Status
              </label>

              <select
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveRole}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">
              Add User
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  Full Name
                </label>

                <input
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  Email
                </label>

                <input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  Role
                </label>

                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateUser}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
      {createdUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">

            <h2 className="text-xl font-bold mb-4">
              User Created Successfully
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-zinc-400">Email</p>
                <p>{createdUser.email}</p>
              </div>

              <div>
                <p className="text-sm text-zinc-400">
                  Temporary Password
                </p>

                <p className="font-mono">
                  {createdUser.password}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-400">Role</p>
                <p>{createdUser.role}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    createdUser.password
                  )
                }
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
              >
                Copy Password
              </button>

              <button
                onClick={() => setCreatedUser(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}