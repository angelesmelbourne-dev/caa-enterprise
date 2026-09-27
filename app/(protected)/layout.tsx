"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AppSidebar from "@/components/AppSidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
       if (!session) {
        router.replace("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("users")
        .select("status")
        .eq("auth_user_id", session.user.id)
        .single();

      if (profile?.status === "INACTIVE") {
        await supabase.auth.signOut();

        router.replace("/login");

        return;
      }
     

      setLoading(false);
    };

    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />

      <main className="flex-1 bg-zinc-950 text-white">
        {children}
      </main>
    </div>
  );
}