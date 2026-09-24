"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
    const [customerCount, setCustomerCount] = useState(0);
    const [vehicleCount, setVehicleCount] = useState(0);
    const [openJobs, setOpenJobs] = useState(0);
    const [completedJobs, setCompletedJobs] = useState(0);

    const loadDashboard = async () => {

        const { count: customers } = await supabase
            .from("customers")
            .select("*", { count: "exact", head: true });

        const { count: vehicles } = await supabase
            .from("vehicles")
            .select("*", { count: "exact", head: true });

        const { count: open } = await supabase
            .from("job_orders")
            .select("*", { count: "exact", head: true })
            .in("status", ["pending", "in_progress"]);

        const { count: completed } = await supabase
            .from("job_orders")
            .select("*", { count: "exact", head: true })
            .eq("status", "completed");

        setCustomerCount(customers ?? 0);
        setVehicleCount(vehicles ?? 0);
        setOpenJobs(open ?? 0);
        setCompletedJobs(completed ?? 0);
    };
    useEffect(() => {
        loadDashboard();
    }, []);
    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="max-w-7xl mx-auto p-8">

                <h1 className="text-3xl font-bold">
                    Dashboard
                </h1>

                <p className="text-zinc-400 mt-2">
                    ShopGrid Overview
                </p>

                <div className="grid gap-4 mt-8 md:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                        <p className="text-zinc-400">Customers</p>
                        <h2 className="text-4xl font-bold">
                            {customerCount}
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                        <p className="text-zinc-400">Vehicles</p>
                        <h2 className="text-4xl font-bold">
                            {vehicleCount}
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                        <p className="text-zinc-400">Open Job Orders</p>
                        <h2 className="text-4xl font-bold text-amber-400">
                            {openJobs}
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                        <p className="text-zinc-400">Completed Jobs</p>
                        <h2 className="text-4xl font-bold text-emerald-400">
                            {completedJobs}
                        </h2>
                    </div>

                </div>

            </div>
        </div>
    );
}