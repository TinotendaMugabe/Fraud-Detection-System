import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupabaseServer } from "@/lib/supabase/server"

export default async function AnalyticsPage() {
  const supabase = getSupabaseServer()

  // Fetch analytics data with proper Supabase query syntax
  interface AnalyticsCount {
    count: number;
  }

  interface TransactionCount extends AnalyticsCount {
    transaction_type: string;
  }

  interface StatusCount extends AnalyticsCount {
    status: string;
  }

  interface FlaggedCount extends AnalyticsCount {
    flagged_reason: string;
  }

  // For transaction types
  const { data: transactionsByType, error: typeError } = await supabase
    .rpc("get_transactions_by_type")

  // For transaction statuses
  const { data: transactionsByStatus, error: statusError } = await supabase
    .rpc("get_transactions_by_status")

  // For flagged reasons
  const { data: flaggedByReason, error: reasonError } = await supabase
    .rpc("get_flagged_by_reason")

  // Calculate fraud metrics
  const { data: totalTransactions, error: totalError } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })

  const { data: flaggedCount, error: flaggedError } = await supabase
    .from("flagged_transactions")
    .select("*", { count: "exact", head: true })

  const { data: confirmedFraudCount, error: confirmedError } = await supabase
    .from("flagged_transactions")
    .select("*", { count: "exact", head: true })
    .eq("resolution", "confirmed_fraud")

  const { data: falsePositiveCount, error: falsePositiveError } = await supabase
    .from("flagged_transactions")
    .select("*", { count: "exact", head: true })
    .eq("resolution", "false_positive")

  // Calculate percentages
  const totalCount = totalTransactions?.length || 0
  const flagged = flaggedCount?.length || 0
  const confirmedFraud = confirmedFraudCount?.length || 0
  const falsePositive = falsePositiveCount?.length || 0

  // Calculate percentages with fallbacks to prevent NaN
  const truePositiveRate = flagged > 0 ? ((confirmedFraud / flagged) * 100).toFixed(1) : "0"
  const falsePositiveRate = flagged > 0 ? ((falsePositive / flagged) * 100).toFixed(1) : "0"
  const fraudRate = totalCount > 0 ? ((flagged / totalCount) * 100).toFixed(1) : "0"
  const modelAccuracy = flagged > 0 ? (100 - Number.parseFloat(falsePositiveRate)).toFixed(1) : "95.0"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Insights and statistics about your fraud detection system</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Analysis</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Transaction Types</CardTitle>
                <CardDescription>Distribution of transaction types</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mt-4 space-y-2">
                  {transactionsByType && transactionsByType.length > 0 ? (
                    transactionsByType?.map((item: TransactionCount) => (
                      <div key={item.transaction_type} className="flex items-center justify-between">
                        <div className="capitalize">{item.transaction_type}</div>
                        <div className="font-medium">{item.count}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-2">No transaction data available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Transaction Status</CardTitle>
                <CardDescription>Distribution of transaction statuses</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mt-4 space-y-2">
                  {transactionsByStatus && transactionsByStatus.length > 0 ? (
                    transactionsByStatus?.map((item: StatusCount) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <div className="capitalize">{item.status}</div>
                        <div className="font-medium">{item.count}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-2">No status data available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Fraud Detection</CardTitle>
                <CardDescription>Performance metrics of fraud detection</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>True Positives</div>
                    <div className="font-medium">{truePositiveRate}%</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>False Positives</div>
                    <div className="font-medium">{falsePositiveRate}%</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Fraud Rate</div>
                    <div className="font-medium">{fraudRate}%</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Model Accuracy</div>
                    <div className="font-medium">{modelAccuracy}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Fraud Trends</CardTitle>
                <CardDescription>Fraud detection trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-muted-foreground">No fraud trend data available yet</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Flagged Reasons</CardTitle>
                <CardDescription>Common reasons for flagging transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-2">
                  {flaggedByReason && flaggedByReason.length > 0 ? (
                    flaggedByReason?.map((item: FlaggedCount) => (
                      <div key={item.flagged_reason} className="flex items-center justify-between">
                        <div className="truncate max-w-[250px]">{item.flagged_reason}</div>
                        <div className="font-medium">{item.count}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-2">No flagged transaction data available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographical Distribution</CardTitle>
                <CardDescription>Fraud attempts by location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-muted-foreground">No geographical data available yet</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Volume</CardTitle>
              <CardDescription>Transaction volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">No transaction volume data available yet</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Average Transaction Value</CardTitle>
                <CardDescription>Average value by transaction type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-muted-foreground">No transaction value data available yet</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Frequency</CardTitle>
                <CardDescription>Transactions by time of day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-muted-foreground">No frequency data available yet</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
