"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertTriangleIcon, ArrowLeftIcon } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { FlaggedTransaction, Transaction } from "@/types/transaction"

type FlaggedTransactionDetailClientProps = {
  id: string
}

export default function FlaggedTransactionDetailClient({ id }: FlaggedTransactionDetailClientProps) {
  const [flaggedTransaction, setFlaggedTransaction] = useState<FlaggedTransaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolution, setResolution] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem("user")
        if (userData) setUser(JSON.parse(userData))

        type SupabaseFlaggedTransaction = {
          id: string
          transaction_id: string
          risk_score: number
          flagged_reason: string
          reviewed: boolean
          reviewed_by: string | null
          reviewed_at: string | null
          resolution: "false_positive" | "confirmed_fraud" | "resolved" | null
          notes: string | null
          created_at: string
          updated_at: string
          transaction: Transaction | null
        }

        const { data, error } = await supabase
          .from("flagged_transactions")
          .select(`
            *,
            transaction:transaction_id (
              id,
              user_id,
              amount,
              currency,
              transaction_type,
              status,
              source,
              destination,
              ip_address,
              device_info,
              location,
              created_at,
              metadata
            )
          `)
          .eq("id", id)
          .single()

        if (error) throw error
        if (!data) throw new Error("Transaction not found")
        
        const flaggedTransaction: FlaggedTransaction = {
          id: data.id as string,
          transaction_id: data.transaction_id as string,
          risk_score: data.risk_score as number,
          flagged_reason: data.flagged_reason as string,
          reviewed: data.reviewed as boolean,
          reviewed_by: data.reviewed_by as string | undefined,
          reviewed_at: data.reviewed_at as string | undefined,
          resolution: data.resolution as "false_positive" | "confirmed_fraud" | "resolved" | undefined,
          notes: data.notes as string | undefined,
          created_at: data.created_at as string,
          updated_at: data.updated_at as string,
          transaction: data.transaction && !('error' in data.transaction) ? data.transaction as Transaction : undefined
        }
        
        setFlaggedTransaction(flaggedTransaction)
      } catch (err: any) {
        setError(err.message || "Failed to fetch transaction details")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, supabase])

  const handleReview = async () => {
    if (!resolution) {
      setError("Please select a resolution")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/fraud/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flaggedId: id,
          resolution,
          notes,
          reviewerId: user?.id,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to submit review")

      router.push("/dashboard/flagged")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-3xl">
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
            <AlertTriangleIcon className="h-12 w-12 text-destructive" />
            <p className="text-lg font-medium">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const transaction = flaggedTransaction?.transaction

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Flagged Transaction</h1>
          <p className="text-muted-foreground">Transaction ID: {transaction?.id.substring(0, 8)}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>Information about the flagged transaction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-medium text-gray-500">Amount</div>
                <div>{transaction?.amount} {transaction?.currency}</div>
              </div>
              <div>
                <div className="font-medium text-gray-500">Type</div>
                <div className="capitalize">{transaction?.transaction_type}</div>
              </div>
              <div>
                <div className="font-medium text-gray-500">Status</div>
                <div className="capitalize">{transaction?.status}</div>
              </div>
              <div>
                <div className="font-medium text-gray-500">Created At</div>
                <div>{new Date(transaction?.created_at || "").toLocaleString()}</div>
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-500">Source</div>
              <div>{transaction?.source}</div>
            </div>
            <div>
              <div className="font-medium text-gray-500">Destination</div>
              <div>{transaction?.destination}</div>
            </div>
            <div>
              <div className="font-medium text-gray-500">Location</div>
              <div>{transaction?.location}</div>
            </div>
            <div>
              <div className="font-medium text-gray-500">IP Address</div>
              <div>{transaction?.ip_address}</div>
            </div>
            <div>
              <div className="font-medium text-gray-500">Device Info</div>
              <div>{transaction?.device_info}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review Decision</CardTitle>
            <CardDescription>Submit your review for this flagged transaction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Resolution</Label>
              <RadioGroup value={resolution} onValueChange={setResolution}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false_positive" id="false_positive" />
                  <Label htmlFor="false_positive">False Positive</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="confirmed_fraud" id="confirmed_fraud" />
                  <Label htmlFor="confirmed_fraud">Confirmed Fraud</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="needs_investigation" id="needs_investigation" />
                  <Label htmlFor="needs_investigation">Needs Further Investigation</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or observations..."
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleReview}
              disabled={submitting || !resolution}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
