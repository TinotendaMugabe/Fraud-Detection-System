import type { NewTransaction } from "@/types/transaction"

// Simple rule-based fraud detection
export function detectFraud(
  transaction: NewTransaction,
  rules: any[],
): {
  isFraudulent: boolean
  riskScore: number
  reason: string | null
} {
  let isFraudulent = false
  let highestRiskScore = 0
  let reason = null

  // Apply each rule to the transaction
  for (const rule of rules) {
    if (!rule.is_active) continue

    const { riskScore, flagged, flagReason } = applyRule(transaction, rule)

    if (flagged && riskScore > highestRiskScore) {
      highestRiskScore = riskScore
      reason = flagReason
      isFraudulent = true
    }
  }

  return {
    isFraudulent,
    riskScore: highestRiskScore,
    reason,
  }
}

function applyRule(
  transaction: NewTransaction,
  rule: any,
): {
  riskScore: number
  flagged: boolean
  flagReason: string | null
} {
  const config = rule.rule_config

  switch (rule.rule_type) {
    case "threshold":
      if (transaction.amount >= config.threshold) {
        return {
          riskScore: calculateRiskScore(transaction.amount, config.threshold),
          flagged: true,
          flagReason: `Amount (${transaction.amount} ${transaction.currency}) exceeds threshold (${config.threshold} ${config.currency})`,
        }
      }
      break

    case "location":
      const trustedCountries = config.trusted_countries || []
      const country = extractCountry(transaction.location)

      if (!trustedCountries.includes(country)) {
        return {
          riskScore: 0.8,
          flagged: true,
          flagReason: `Transaction from untrusted location: ${transaction.location}`,
        }
      }
      break

    case "velocity":
      // Note: Velocity checks would typically require historical data
      // This is a simplified implementation
      return {
        riskScore: 0,
        flagged: false,
        flagReason: null,
      }

    // Add more rule types as needed
  }

  return {
    riskScore: 0,
    flagged: false,
    flagReason: null,
  }
}

function calculateRiskScore(amount: number, threshold: number): number {
  // Simple risk score calculation based on how much the amount exceeds the threshold
  const excessRatio = amount / threshold
  return Math.min(0.5 + (excessRatio - 1) * 0.1, 0.99)
}

function extractCountry(location: string): string {
  // Simple function to extract country from location string
  // In a real system, this would be more sophisticated
  const parts = location.split(",")
  if (parts.length > 1) {
    return parts[parts.length - 1].trim()
  }
  return location.trim()
}
