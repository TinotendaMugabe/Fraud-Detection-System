import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"
import { detectFraud } from "@/lib/utils/fraud-detection"

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer()
    const transaction = await request.json()

    // Validate transaction data
    if (!transaction.user_id || !transaction.amount || !transaction.transaction_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch fraud rules
    const { data: rules, error: rulesError } = await supabase.from("fraud_rules").select("*").eq("is_active", true)

    if (rulesError) {
      console.error("Error fetching fraud rules:", rulesError)
      return NextResponse.json({ error: "Failed to fetch fraud rules" }, { status: 500 })
    }

    // Detect fraud
    const { isFraudulent, riskScore, reason } = detectFraud(transaction, rules || [])

    // Set transaction status based on fraud detection
    const status = isFraudulent ? "flagged" : "completed"

    // Insert transaction
    const { data: insertedTransaction, error: insertError } = await supabase
      .from("transactions")
      .insert({
        ...transaction,
        status,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting transaction:", insertError)
      return NextResponse.json({ error: "Failed to insert transaction" }, { status: 500 })
    }

    // If fraudulent, create flagged transaction record
    if (isFraudulent && insertedTransaction) {
      const { error: flagError } = await supabase.from("flagged_transactions").insert({
        transaction_id: insertedTransaction.id,
        risk_score: riskScore,
        flagged_reason: reason || "Suspicious activity detected",
      })

      if (flagError) {
        console.error("Error flagging transaction:", flagError)
      }
    }

    return NextResponse.json({
      success: true,
      transaction: insertedTransaction,
      isFraudulent,
      riskScore,
      reason,
    })
  } catch (error) {
    console.error("Error processing transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { transactionId } = await request.json()
    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    // Delete from flagged_transactions first (if exists)
    await supabase.from("flagged_transactions").delete().eq("transaction_id", transactionId)

    // Then delete the transaction
    const { error } = await supabase.from("transactions").delete().eq("id", transactionId)

    if (error) {
      console.error("Error deleting transaction:", error)
      return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format")
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const supabase = getSupabaseServer()

    let query = supabase.from("transactions").select("*")

    // Apply filters
    if (type) query = query.eq("transaction_type", type)
    if (status) query = query.eq("status", status)
    if (startDate) query = query.gte("created_at", startDate)
    if (endDate) query = query.lte("created_at", endDate)

    const { data: transactions, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching transactions:", error)
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }

    if (format === "csv" || format === "json") {
      let exportData = transactions
      if (format === "csv") {
        // Convert to CSV
        const headers = ["id", "transaction_type", "amount", "currency", "status", "source", "destination", "location", "created_at"]
        const csv = [
          headers.join(","),
          ...exportData.map(row => 
            headers.map(header => 
              JSON.stringify(row[header] || "").replace(/\,/g, "")
            ).join(",")
          )
        ].join("\n")
        
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename=transactions-${new Date().toISOString().split("T")[0]}.csv`
          }
        })
      } else {
        // JSON format
        return new NextResponse(JSON.stringify(exportData, null, 2), {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename=transactions-${new Date().toISOString().split("T")[0]}.json`
          }
        })
      }
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
