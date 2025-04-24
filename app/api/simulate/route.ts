import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"
import { detectFraud } from "@/lib/utils/fraud-detection"

// Helper function to generate a random transaction
async function generateRandomTransaction() {
  // Get transaction types from request or use defaults
  const transactionTypes = ["deposit", "withdrawal", "transfer", "payment"] as const
  type TransactionType = typeof transactionTypes[number]
  const sources = ["Bank Account", "Credit Card", "Wallet", "PayPal"]
  const destinations = ["Wallet", "Bank Account", "Merchant", "External Account"]

  // Get the current user's ID from the request
  const supabase = getSupabaseServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    throw new Error("User not authenticated")
  }

  const userId = user.id
  const transactionType: TransactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)]
  const source = sources[Math.floor(Math.random() * sources.length)]
  const destination = destinations[Math.floor(Math.random() * destinations.length)]
  
  // Use the user's actual location from their profile or request
  const { data: userData } = await supabase
    .from("users")
    .select("location")
    .eq("id", userId)
    .single()
  
  const location = userData?.location || "Unknown Location"

  // Generate amount (potentially suspicious for testing)
  const isSuspicious = Math.random() < 0.3 // 30% chance of suspicious transaction
  const amount = isSuspicious
    ? Math.floor(Math.random() * 9000) + 1000 // $1000-$10000
    : Math.floor(Math.random() * 900) + 100 // $100-$1000

  return {
    user_id: userId,
    amount,
    currency: "USD",
    transaction_type: transactionType,
    source,
    destination,
    ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    location,
    device_info: "Simulation",
    metadata: { simulated: true },
  }
}

export async function POST() {
  try {
    const supabase = getSupabaseServer()

    // Generate a random transaction
    const transaction = await generateRandomTransaction()

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
    console.error("Error simulating transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
