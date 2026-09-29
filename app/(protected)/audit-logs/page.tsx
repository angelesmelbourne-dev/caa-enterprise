"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AuditLog {
    id: number;
    action: string;
    details: string;
    created_at: string;
    performed_by_name: string;
}

export default function AuditLogsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [actionFilter, setActionFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const actionLabels: Record<string, string> = {
        USER_CREATED: "User Created",
        ROLE_UPDATED: "Role Updated",
        USER_ACTIVATED: "User Activated",
        USER_DEACTIVATED: "User Deactivated",
    };

    const actionStyles: Record<string, string> = {
        USER_CREATED: "bg-blue-500/10 text-blue-400",
        ROLE_UPDATED: "bg-yellow-500/10 text-yellow-400",
        USER_ACTIVATED: "bg-green-500/10 text-green-400",
        USER_DEACTIVATED: "bg-red-500/10 text-red-400",
    };
    const PAGE_SIZE = 20;

    useEffect(() => {
        const loadLogs = async () => {
            let query = supabase
                .from("audit_logs")
                .select("*", { count: "exact" })
                .order("created_at", { ascending: false });

            if (actionFilter !== "ALL") {
                query = query.eq("action", actionFilter);
            }
            if (searchTerm.trim()) {
                query = query.ilike(
                    "details",
                    `%${searchTerm}%`
                );
            }

            const from = (page - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            query = query.range(from, to);

            const { data, count } = await query;

            if (data) {
                setLogs(data);
            }

            const pages = Math.ceil(
                (count || 0) / PAGE_SIZE
            );

            setTotalPages(pages);
        };

        loadLogs();
    }, [page, actionFilter, searchTerm]);


    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">
                Audit Logs
            </h1>

            <div className="flex gap-3 mb-4">
                <select
                    className="bg-zinc-800 text-white border border-zinc-700 rounded-lg px-3 py-2"
                    value={actionFilter}
                    onChange={(e) => {
                        setActionFilter(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="ALL">All Actions</option>

                    {Object.keys(actionLabels).map((action) => (
                        <option key={action} value={action}>
                            {actionLabels[action]}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    placeholder="Search details..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                    }}
                    className="bg-zinc-800 text-white border border-zinc-700 rounded-lg px-3 py-2 w-72"
                />
            </div>
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-zinc-800">
                        <tr>
                            <th className="text-left p-4">Date</th>
                            <th className="text-left p-4">Performed By</th>
                            <th className="text-left p-4">Action</th>
                            <th className="text-left p-4">Details</th>
                        </tr>
                    </thead>

                    <tbody>
                        {logs.map((log) => (
                            <tr
                                key={log.id}
                                className="border-t border-zinc-800"
                            >
                                <td className="p-4">
                                    {new Date(log.created_at).toLocaleString()}
                                </td>

                                <td className="p-4">
                                    {log.performed_by_name}
                                </td>

                                <td className="p-4">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${actionStyles[log.action]
                                            }`}
                                    >
                                        {actionLabels[log.action] || log.action}
                                    </span>
                                </td>

                                <td className="p-4">
                                    {log.details}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex items-center gap-3">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Previous
                    </button>

                    <span>
                        Page {page} of {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}