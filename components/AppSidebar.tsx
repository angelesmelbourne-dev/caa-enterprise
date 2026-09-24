
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const [email, setEmail] = useState("");

    useEffect(() => {
        const loadUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            setEmail(user?.email ?? "");
        };

        loadUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const links = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/customers", label: "Customers" },
        { href: "/vehicles", label: "Vehicles" },
        { href: "/job-orders", label: "Job Orders" },
        { href: "/reports", label: "Reports" },
    ];

    return (
        <aside className="w-64 min-h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col">
            <div className="p-6 border-b border-zinc-800">
                <h1 className="text-xl font-bold text-white">ShopGrid</h1>
                <div className="mt-1">
                    <p className="text-xs text-zinc-500">
                        {email || "Loading user..."}
                    </p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => {
                    const isActive =
                        pathname === link.href || pathname?.startsWith(link.href + "/");
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`block px-4 py-3 rounded-lg transition ${isActive
                                ? "bg-zinc-800 text-white"
                                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                                }`}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-zinc-800">
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-semibold"
                >
                    Logout
                </button>
            </div>
        </aside>
    );
}
