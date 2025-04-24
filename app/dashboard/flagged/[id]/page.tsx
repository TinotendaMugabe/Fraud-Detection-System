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
import type { FlaggedTransaction } from "@/types/transaction"

export default function FlaggedTransactionDetailPage({ params }: { params: { id: string } }) {
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
        // Get user from localStorage
        const userData = localStorage.getItem("user")
        if (userData) {
          setUser(JSON.parse(userData))
        }

        // Fetch flagged transaction details
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
          .eq("id", params.id)
          .single()

        if (error) {
          throw error
        }

        setFlaggedTransaction(data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch transaction details")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, supabase])

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flaggedId: params.id,
          resolution,
          notes,
          reviewerId: user?.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review")
      }

      // Redirect back to flagged transactions list
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading transaction details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangleIcon className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="mt-4 text-xl font-semibold">Error</h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/flagged")}>
            Back to Flagged Transactions
          </Button>
        </div>
      </div>
    )
  }

  if (!flaggedTransaction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangleIcon className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="mt-4 text-xl font-semibold">Transaction Not Found</h2>
          <p className="mt-2 text-muted-foreground">The flagged transaction you're looking for doesn't exist.</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/flagged")}>
            Back to Flagged Transactions
          </Button>
        </div>
      </div>
    )
  }

  const transaction = flaggedTransaction.transaction

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/flagged")}>
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
                <div className="text-sm font-medium text-muted-foreground">Amount</div>
                <div className="text-lg font-semibold">
                  {transaction?.amount} {transaction?.currency}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Type</div>
                <div className="text-lg font-semibold capitalize">{transaction?.transaction_type}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Source</div>
                <div>{transaction?.source}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Destination</div>
                <div>{transaction?.destination}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">IP Address</div>
                <div>{transaction?.ip_address}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Location</div>
                <div>{transaction?.location}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Date</div>
                <div>{new Date(transaction?.created_at || "").toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <div className="capitalize">{transaction?.status}</div>
              </div>
            </div>

            {transaction?.device_info && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Device Info</div>
                <div className="text-sm mt-1">{transaction.device_info}</div>
              </div>
            )}

            {transaction?.metadata && Object.keys(transaction.metadata).length > 0 && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Additional Data</div>
                <pre className="text-xs mt-1 p-2 bg-muted rounded-md overflow-auto">
                  {JSON.stringify(transaction.metadata, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fraud Analysis</CardTitle>
            <CardDescription>Review and take action on this flagged transaction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Risk Score</div>
              <div className="text-lg font-semibold">{(flaggedTransaction.risk_score * 100).toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Flagged Reason</div>
              <div className="p-2 bg-muted rounded-md mt-1">{flaggedTransaction.flagged_reason}</div>
            </div>

            {!flaggedTransaction.reviewed && (
              <>
                <div className="pt-4">
                  <div className="text-sm font-medium mb-2">Resolution</div>
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
                      <RadioGroupItem value="resolved" id="resolved" />
                      <Label htmlFor="resolved">Resolved</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Notes</div>
                  <Textarea
                    placeholder="Add notes about your decision..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </>
            )}

            {flaggedTransaction.reviewed && (
              <>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Resolution</div>
                  <div className="capitalize font-medium">{flaggedTransaction.resolution}</div>
                </div>
                {flaggedTransaction.notes && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Review Notes</div>
                    <div className="p-2 bg-muted rounded-md mt-1">{flaggedTransaction.notes}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Reviewed At</div>
                  <div>{new Date(flaggedTransaction.reviewed_at || "").toLocaleString()}</div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {!flaggedTransaction.reviewed ? (
              <>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" onClick={() => router.push("/dashboard/flagged")}>
                    Cancel
                  </Button>
                  <Button onClick={handleReview} disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={() => router.push("/dashboard/flagged")}>
                  Back
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
