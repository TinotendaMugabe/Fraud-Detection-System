import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

export async function DELETE(request: Request) {
  try {
    const supabase = getSupabaseServer()
    const { userId } = await request.json()

    // First, delete user from auth.users
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    if (authError) {
      console.error("Error deleting user from auth:", authError)
      return NextResponse.json({ error: "Failed to delete user authentication" }, { status: 500 })
    }

    // Then delete from our users table
    const { error: dbError } = await supabase.from("users").delete().eq("id", userId)
    if (dbError) {
      console.error("Error deleting user from database:", dbError)
      return NextResponse.json({ error: "Failed to delete user data" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer()
    const { email, password, full_name, role } = await request.json()

    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("Error creating user auth:", authError)
      return NextResponse.json({ error: "Failed to create user authentication" }, { status: 500 })
    }

    // Create user in our users table
    const { data: userData, error: dbError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email,
        full_name,
        role: role || "user",
      })
      .select()
      .single()

    if (dbError) {
      console.error("Error creating user in database:", dbError)
      // Clean up auth user if database insert fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: "Failed to create user data" }, { status: 500 })
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = getSupabaseServer()
    const { userId, full_name, role } = await request.json()

    const { data: userData, error: dbError } = await supabase
      .from("users")
      .update({
        full_name,
        role,
      })
      .eq("id", userId)
      .select()
      .single()

    if (dbError) {
      console.error("Error updating user:", dbError)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
