"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DownloadIcon, FilterIcon, PlusIcon, TrashIcon, UploadIcon } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { DatePicker } from "@/components/ui/date-picker"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    startDate: "",
    endDate: ""
  })
  const [newTransaction, setNewTransaction] = useState({
    transaction_type: "",
    amount: "",
    currency: "USD",
    source: "",
    destination: "",
    location: ""
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadType, setUploadType] = useState<"csv" | "json" | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { toast } = useToast()
  const supabase = getSupabaseClient()

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true)
    try {
      let url = "/api/transactions"
      const params = new URLSearchParams()
      if (filters.type) params.append("type", filters.type)
      if (filters.status) params.append("status", filters.status)
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)
      
      const response = await fetch(`${url}?${params}`)
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      setTransactions(data.transactions || [])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch transactions"
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", uploadType || "")

    try {
      const response = await fetch("/api/transactions/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      toast({
        title: "Success",
        description: `Successfully processed ${data.processedCount} transactions`,
      })

      // Refresh transactions list
      await fetchTransactions()
      setShowAddDialog(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process file"
      })
    } finally {
      setIsUploading(false)
      setUploadType(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // Handle export
  const handleExport = async (format: "csv" | "json") => {
    try {
      let url = "/api/transactions"
      const params = new URLSearchParams({ format })
      
      // Add filters to export if they exist
      if (filters.type) params.append("type", filters.type)
      if (filters.status) params.append("status", filters.status)
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)
      
      window.location.href = `${url}?${params}`
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to export transactions"
      })
    }
  }

  // Handle delete
  const handleDelete = async (transactionId: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return

    try {
      const response = await fetch("/api/transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      toast({
        title: "Success",
        description: "Transaction deleted successfully"
      })
      fetchTransactions()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete transaction"
      })
    }
  }

  // Handle add transaction
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTransaction)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      toast({
        title: "Success",
        description: "Transaction added successfully"
      })
      setShowAddDialog(false)
      setNewTransaction({
        transaction_type: "",
        amount: "",
        currency: "USD",
        source: "",
        destination: "",
        location: ""
      })
      fetchTransactions()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add transaction"
      })
    } finally {
      setLoading(false)
    }
  }

  // Load transactions on mount
  useEffect(() => {
    fetchTransactions()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">View and manage all transactions in the system</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FilterIcon className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Transactions</DialogTitle>
                <DialogDescription>Filter transactions by various criteria</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Transaction Type</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters({ ...filters, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Date Range</Label>
                  <div className="flex gap-2">
                    <DatePicker
                      selected={filters.startDate ? new Date(filters.startDate) : null}
                      onSelect={(date) => setFilters({ ...filters, startDate: date?.toISOString() || "" })}
                      placeholderText="Start date"
                    />
                    <DatePicker
                      selected={filters.endDate ? new Date(filters.endDate) : null}
                      onSelect={(date) => setFilters({ ...filters, endDate: date?.toISOString() || "" })}
                      placeholderText="End date"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => {
                  fetchTransactions()
                  setShowFilterDialog(false)
                }}>Apply Filters</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>Create a new transaction or upload transactions file</DialogDescription>
              </DialogHeader>
              
              {/* File Upload Section */}
              <div className="flex justify-center gap-4 mb-4">
                <Button
                  variant="outline"
                  onClick={() => setUploadType("csv")}
                  className={uploadType === "csv" ? "ring-2 ring-primary" : ""}
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Upload CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setUploadType("json")}
                  className={uploadType === "json" ? "ring-2 ring-primary" : ""}
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Upload JSON
                </Button>
              </div>

              {uploadType ? (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="file" className="text-right">
                      File
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="file"
                        type="file"
                        accept={uploadType === "csv" ? ".csv" : ".json"}
                        ref={fileInputRef}
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddTransaction}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="transaction_type" className="text-right">
                        Type
                      </Label>
                      <Select
                        value={newTransaction.transaction_type}
                        onValueChange={(value) =>
                          setNewTransaction({ ...newTransaction, transaction_type: value })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deposit">Deposit</SelectItem>
                          <SelectItem value="withdrawal">Withdrawal</SelectItem>
                          <SelectItem value="transfer">Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">
                        Amount
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="source" className="text-right">
                        Source
                      </Label>
                      <Input
                        id="source"
                        value={newTransaction.source}
                        onChange={(e) => setNewTransaction({ ...newTransaction, source: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="destination" className="text-right">
                        Destination
                      </Label>
                      <Input
                        id="destination"
                        value={newTransaction.destination}
                        onChange={(e) => setNewTransaction({ ...newTransaction, destination: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="location" className="text-right">
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={newTransaction.location}
                        onChange={(e) => setNewTransaction({ ...newTransaction, location: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>Add Transaction</Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport("csv")}>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport("json")}>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id.substring(0, 8)}</TableCell>
                  <TableCell className="capitalize">{transaction.transaction_type}</TableCell>
                  <TableCell>
                    {transaction.amount} {transaction.currency}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.status === "completed"
                          ? "outline"
                          : transaction.status === "flagged"
                            ? "destructive"
                            : transaction.status === "pending"
                              ? "secondary"
                              : "default"
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.source}</TableCell>
                  <TableCell>{transaction.destination}</TableCell>
                  <TableCell>{transaction.location}</TableCell>
                  <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="ml-2">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (!transactions || transactions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
