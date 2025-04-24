import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export const getSupabaseServer = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      auth: {
        persistSession: false
      }
    }
  )
}
