export interface NewTransaction {
  user_id: string
  amount: number
  currency: string
  transaction_type: "deposit" | "withdrawal" | "transfer" | "payment"
  source: string
  destination: string
  ip_address: string
  device_info?: string
  location: string
  metadata?: Record<string, any>
}

export interface Transaction extends NewTransaction {
  id: string
  user_id: string
  amount: number
  currency: string
  transaction_type: "deposit" | "withdrawal" | "transfer" | "payment"
  status: "pending" | "completed" | "failed" | "flagged"
  source: string
  destination: string
  ip_address: string
  device_info?: string
  location: string
  created_at: string
  metadata?: Record<string, any>
}

export interface FlaggedTransaction {
  id: string
  transaction_id: string
  risk_score: number
  flagged_reason: string
  reviewed: boolean
  reviewed_by?: string
  reviewed_at?: string
  resolution?: "false_positive" | "confirmed_fraud" | "resolved" | null
  notes?: string
  created_at: string
  updated_at: string
  transaction?: Transaction
}

export interface FraudRule {
  id: string
  name: string
  description?: string
  rule_type: "threshold" | "pattern" | "location" | "velocity" | "custom"
  rule_config: Record<string, any>
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}
