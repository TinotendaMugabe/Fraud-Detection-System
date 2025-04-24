"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        // Get additional user data from the users table
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single()

        setUser({
          ...user,
          ...userData,
        })
      }
    }

    fetchUser()
  }, [supabase])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url} alt={user.full_name || user.email} />
              <AvatarFallback>
                {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user.full_name || "No name set"}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-500">Account ID</h3>
              <p>{user.id}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Email Verified</h3>
              <p>{user.email_confirmed_at ? "Yes" : "No"}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Account Created</h3>
              <p>{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
