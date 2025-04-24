import { getSupabaseServer } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckIcon, XIcon, AlertTriangleIcon } from "lucide-react"
import Link from "next/link"

export default async function FlaggedTransactionsPage() {
  const supabase = getSupabaseServer()

  // Fetch flagged transactions with transaction details
  const { data: flaggedTransactions, error } = await supabase
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
        location,
        created_at
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching flagged transactions:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flagged Transactions</h1>
          <p className="text-muted-foreground">Review and manage potentially fraudulent transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Filter</Button>
          <Button>Export</Button>
        </div>
      </div>

      <div className="grid gap-6">
        {flaggedTransactions?.map((flagged) => (
          <Card key={flagged.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
                    Transaction #{flagged.transaction?.id.substring(0, 8)}
                  </CardTitle>
                  <CardDescription>Flagged on {new Date(flagged.created_at).toLocaleString()}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={flagged.reviewed ? "outline" : "secondary"}>
                    {flagged.reviewed ? "Reviewed" : "Pending Review"}
                  </Badge>
                  <Badge
                    variant={
                      flagged.risk_score > 0.8 ? "destructive" : flagged.risk_score > 0.5 ? "default" : "outline"
                    }
                  >
                    Risk: {(flagged.risk_score * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Transaction Details</h3>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Amount</div>
                      <div className="font-medium">
                        {flagged.transaction?.amount} {flagged.transaction?.currency}
                      </div>
                      <div className="text-muted-foreground">Type</div>
                      <div className="font-medium capitalize">{flagged.transaction?.transaction_type}</div>
                      <div className="text-muted-foreground">Date</div>
                      <div className="font-medium">
                        {new Date(flagged.transaction?.created_at || "").toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">Source</div>
                      <div className="font-medium">{flagged.transaction?.source}</div>
                      <div className="text-muted-foreground">Destination</div>
                      <div className="font-medium">{flagged.transaction?.destination}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Fraud Analysis</h3>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Reason</div>
                      <div className="font-medium">{flagged.flagged_reason}</div>
                      <div className="text-muted-foreground">IP Address</div>
                      <div className="font-medium">{flagged.transaction?.ip_address}</div>
                      <div className="text-muted-foreground">Location</div>
                      <div className="font-medium">{flagged.transaction?.location}</div>
                      <div className="text-muted-foreground">Resolution</div>
                      <div className="font-medium capitalize">{flagged.resolution || "Pending"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <Link href={`/dashboard/flagged/${flagged.id}`}>
                      <Button variant="default">Review Details</Button>
                    </Link>
                    <Button variant="outline" className="gap-1">
                      <CheckIcon className="h-4 w-4 text-green-500" />
                      Approve
                    </Button>
                    <Button variant="outline" className="gap-1">
                      <XIcon className="h-4 w-4 text-red-500" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {flaggedTransactions?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="rounded-full bg-muted p-3">
                <CheckIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No Flagged Transactions</h3>
              <p className="text-center text-muted-foreground">
                There are currently no flagged transactions that require your attention.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
