"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircleIcon, CheckCircleIcon, PlayIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SimulatePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSimulate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to simulate transaction")
      }

      setResult(data)
      router.refresh()
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSimulateMultiple = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Simulate 5 transactions in sequence
      const results = []

      for (let i = 0; i < 5; i++) {
        const response = await fetch("/api/simulate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to simulate transaction")
        }

        results.push(data)
      }

      setResult({
        success: true,
        multipleResults: true,
        count: results.length,
        fraudCount: results.filter((r) => r.isFraudulent).length,
      })

      router.refresh()
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Simulation</h1>
        <p className="text-muted-foreground">Generate test transactions to evaluate your fraud detection system</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircleIcon className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Simulator</CardTitle>
            <CardDescription>Generate random transactions to test your fraud detection rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                The simulator will generate random transactions with varying characteristics. Some transactions will be
                designed to trigger your fraud rules.
              </p>
              <p className="text-sm text-muted-foreground">
                Click the buttons below to generate transactions and see how your system responds.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleSimulate} disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Simulating...
                </>
              ) : (
                <>
                  <PlayIcon className="mr-2 h-4 w-4" />
                  Simulate Transaction
                </>
              )}
            </Button>
            <Button onClick={handleSimulateMultiple} disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Simulating Multiple...
                </>
              ) : (
                <>
                  <PlayIcon className="mr-2 h-4 w-4" />
                  Simulate 5 Transactions
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simulation Results</CardTitle>
            <CardDescription>View the outcome of your simulated transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Simulating transactions...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-8">
                <AlertCircleIcon className="h-12 w-12 text-destructive" />
                <p className="mt-4 text-destructive font-medium">{error}</p>
              </div>
            )}

            {result && !result.multipleResults && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {result.isFraudulent ? (
                    <AlertCircleIcon className="h-5 w-5 text-destructive" />
                  ) : (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                  <h3 className="font-medium">
                    {result.isFraudulent ? "Fraudulent Transaction Detected" : "Transaction Approved"}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Transaction ID</div>
                    <div className="font-medium">{result.transaction.id.substring(0, 8)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Amount</div>
                    <div className="font-medium">
                      {result.transaction.amount} {result.transaction.currency}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Type</div>
                    <div className="font-medium capitalize">{result.transaction.transaction_type}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Status</div>
                    <div className="font-medium capitalize">{result.transaction.status}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Risk Score</div>
                    <div className="font-medium">
                      {result.riskScore ? `${(result.riskScore * 100).toFixed(0)}%` : "N/A"}
                    </div>
                  </div>
                </div>

                {result.reason && (
                  <div>
                    <div className="text-muted-foreground">Flagged Reason</div>
                    <div className="p-2 bg-muted rounded-md mt-1">{result.reason}</div>
                  </div>
                )}
              </div>
            )}

            {result && result.multipleResults && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">Multiple Transactions Simulated</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Transactions</div>
                    <div className="font-medium">{result.count}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Flagged as Fraud</div>
                    <div className="font-medium">{result.fraudCount}</div>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <Button variant="outline" onClick={() => router.push("/dashboard/transactions")}>
                    View All Transactions
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
