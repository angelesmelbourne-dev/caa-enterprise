import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
    const body = await request.json();

    const { fullName, email, role } = body;

    const tempPassword = "Password123!";

    const { data, error } =
        await supabaseAdmin.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
        });

    if (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            {
                status: 400,
            }
        );
    }
    const { error: insertError } = await supabaseAdmin
        .from("users")
        .insert({
            full_name: fullName,
            email,
            role,
            auth_user_id: data.user.id,
        });

    if (insertError) {
        console.error(insertError);

        return NextResponse.json(
            {
                success: false,
                error: insertError.message,
            },
            {
                status: 400,
            }
        );
    }
    return NextResponse.json({
        success: true,
        authUserId: data.user.id,
        email,
        role,
        fullName,
    });
}