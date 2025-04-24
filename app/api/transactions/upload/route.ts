import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"
import { detectFraud } from "@/lib/utils/fraud-detection"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!["csv", "json"].includes(type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    const fileContent = await file.text()
    let transactions: any[] = []

    // Parse file content based on type
    if (type === "csv") {
      // Parse CSV manually
      const lines = fileContent.split(/\r?\n/)
      const headers = lines[0].split(',').map(h => h.trim())
      
      // Skip header row and empty lines
      transactions = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim())
          const record: any = {}
          headers.forEach((header, index) => {
            record[header.toLowerCase()] = values[index]
          })
          return {
            transaction_type: record.transaction_type?.toLowerCase() || "",
            amount: parseFloat(record.amount) || 0,
            currency: record.currency || "USD",
            source: record.source || "",
            destination: record.destination || "",
            location: record.location || "",
            timestamp: record.timestamp || new Date().toISOString()
          };
        })
    } else {
      // JSON parsing
      try {
        const jsonData = JSON.parse(fileContent)
        transactions = Array.isArray(jsonData) ? jsonData : [jsonData]
      } catch (error) {
        return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 })
      }
    }

    // Validate transactions
    if (!transactions.length) {
      return NextResponse.json({ error: "No valid transactions found" }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    // Fetch fraud rules
    const { data: rules, error: rulesError } = await supabase
      .from("fraud_rules")
      .select("*")
      .eq("is_active", true)

    if (rulesError) {
      console.error("Error fetching fraud rules:", rulesError)
      return NextResponse.json({ error: "Failed to fetch fraud rules" }, { status: 500 })
    }

    // Process each transaction
    const processedTransactions = []
    for (const transaction of transactions) {
      // Validate required fields
      if (!transaction.amount || !transaction.transaction_type) {
        continue
      }

      // Detect fraud
      const { isFraudulent, riskScore, reason } = detectFraud(transaction, rules || [])
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
        continue
      }

      // If fraudulent, create flagged transaction record
      if (isFraudulent && insertedTransaction) {
        const { error: flagError } = await supabase
          .from("flagged_transactions")
          .insert({
            transaction_id: insertedTransaction.id,
            risk_score: riskScore,
            flagged_reason: reason || "Suspicious activity detected",
          })

        if (flagError) {
          console.error("Error flagging transaction:", flagError)
        }
      }

      processedTransactions.push(insertedTransaction)
    }

    return NextResponse.json({
      success: true,
      processedCount: processedTransactions.length,
      totalCount: transactions.length,
    })
  } catch (error) {
    console.error("Error processing file upload:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
