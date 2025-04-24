import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer()
    const { flaggedId, resolution, notes, reviewerId } = await request.json()

    // Validate required fields
    if (!flaggedId || !resolution || !reviewerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update flagged transaction
    const { data, error } = await supabase
      .from("flagged_transactions")
      .update({
        reviewed: true,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        resolution,
        notes,
      })
      .eq("id", flaggedId)
      .select()
      .single()

    if (error) {
      console.error("Error updating flagged transaction:", error)
      return NextResponse.json({ error: "Failed to update flagged transaction" }, { status: 500 })
    }

    // If this is confirmed fraud, update the transaction status
    if (resolution === "confirmed_fraud") {
      const { error: txError } = await supabase
        .from("transactions")
        .update({ status: "fraud" })
        .eq("id", data.transaction_id)

      if (txError) {
        console.error("Error updating transaction status:", txError)
      }
    }

    // Log the review action
    const { error: logError } = await supabase.from("audit_logs").insert({
      user_id: reviewerId,
      action: "review_fraud",
      entity_type: "flagged_transaction",
      entity_id: flaggedId,
      details: {
        resolution,
        notes,
        transaction_id: data.transaction_id,
      },
    })

    if (logError) {
      console.error("Error logging review action:", logError)
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error reviewing flagged transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
