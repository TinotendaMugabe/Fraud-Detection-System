import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseServer } from "@/lib/supabase/server"
import { BarChart3Icon, AlertTriangleIcon, DollarSignIcon, ShieldCheckIcon } from "lucide-react"

export default async function DashboardPage() {
  const supabase = getSupabaseServer()

  // Fetch dashboard data
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: flaggedCount } = await supabase.from("flagged_transactions").select("*", { count: "exact", head: true })

  const { data: totalTransactions } = await supabase.from("transactions").select("*", { count: "exact", head: true })

  const { data: totalAmount } = await supabase.from("transactions").select("amount").eq("status", "completed")

  // Calculate statistics
  const flaggedTransactions = flaggedCount?.length || 0
  const transactionCount = totalTransactions?.length || 0
  const fraudRate = transactionCount > 0 ? ((flaggedTransactions / transactionCount) * 100).toFixed(1) : "0"

  const totalProcessed = totalAmount?.reduce((sum, tx) => sum + Number.parseFloat(tx.amount), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your fraud detection system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Transactions</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedTransactions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Rate</CardTitle>
            <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fraudRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalProcessed.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest transactions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions && transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center gap-4">
                    <div
                      className={`rounded-full p-2 ${transaction.status === "flagged" ? "bg-red-100" : "bg-green-100"}`}
                    >
                      {transaction.status === "flagged" ? (
                        <AlertTriangleIcon className="h-4 w-4 text-red-500" />
                      ) : (
                        <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="font-medium">${Number.parseFloat(transaction.amount).toFixed(2)}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No transactions available</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Fraud Detection Stats</CardTitle>
            <CardDescription>Performance of your fraud detection system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flaggedTransactions > 0 ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">True Positives</div>
                      <div className="font-medium">
                        {flaggedCount && flaggedCount.length > 0
                          ? (
                              (flaggedCount.filter((f) => f.resolution === "confirmed_fraud").length /
                                flaggedCount.length) *
                              100
                            ).toFixed(0)
                          : "0"}
                        %
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${
                            flaggedCount && flaggedCount.length > 0
                              ? (
                                  flaggedCount.filter((f) => f.resolution === "confirmed_fraud").length /
                                    flaggedCount.length
                                ) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">False Positives</div>
                      <div className="font-medium">
                        {flaggedCount && flaggedCount.length > 0
                          ? (
                              (flaggedCount.filter((f) => f.resolution === "false_positive").length /
                                flaggedCount.length) *
                              100
                            ).toFixed(0)
                          : "0"}
                        %
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{
                          width: `${
                            flaggedCount && flaggedCount.length > 0
                              ? (
                                  flaggedCount.filter((f) => f.resolution === "false_positive").length /
                                    flaggedCount.length
                                ) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No fraud detection statistics available yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
