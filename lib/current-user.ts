import { supabase } from "@/lib/supabaseClient";

export async function getCurrentUserRole() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("role, full_name, email")
    .eq("auth_user_id", user.id)
    .single();

  return data;
}