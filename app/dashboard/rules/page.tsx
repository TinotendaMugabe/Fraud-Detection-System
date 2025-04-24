import { getSupabaseServer } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react"

export default async function FraudRulesPage() {
  const supabase = getSupabaseServer()

  // Fetch fraud rules
  const { data: fraudRules, error } = await supabase
    .from("fraud_rules")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching fraud rules:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fraud Rules</h1>
          <p className="text-muted-foreground">Manage rules for detecting fraudulent transactions</p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add New Rule
        </Button>
      </div>

      <div className="grid gap-6">
        {fraudRules?.map((rule) => (
          <Card key={rule.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {rule.name}
                  <Badge variant={rule.is_active ? "default" : "outline"}>
                    {rule.is_active ? "Active" : "Inactive"}
                  </Badge>
                </CardTitle>
                <CardDescription>{rule.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={rule.is_active} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Rule Configuration</h3>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Type</div>
                      <div className="font-medium capitalize">{rule.rule_type}</div>

                      {rule.rule_type === "threshold" && (
                        <>
                          <div className="text-muted-foreground">Threshold</div>
                          <div className="font-medium">
                            {rule.rule_config.threshold} {rule.rule_config.currency}
                          </div>
                        </>
                      )}

                      {rule.rule_type === "location" && (
                        <>
                          <div className="text-muted-foreground">Trusted Countries</div>
                          <div className="font-medium">{rule.rule_config.trusted_countries.join(", ")}</div>
                        </>
                      )}

                      {rule.rule_type === "velocity" && (
                        <>
                          <div className="text-muted-foreground">Max Transactions</div>
                          <div className="font-medium">{rule.rule_config.max_transactions}</div>
                          <div className="text-muted-foreground">Time Window</div>
                          <div className="font-medium">{rule.rule_config.time_window_minutes} minutes</div>
                        </>
                      )}

                      <div className="text-muted-foreground">Created</div>
                      <div className="font-medium">{new Date(rule.created_at).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">Last Updated</div>
                      <div className="font-medium">{new Date(rule.updated_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-end justify-end space-x-2">
                  <Button variant="outline" size="icon">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
