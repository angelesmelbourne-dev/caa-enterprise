import { createClient } from "@/lib/supabase/server";

export async function getCurrentUserServer() {
  const supabase = await createClient();

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