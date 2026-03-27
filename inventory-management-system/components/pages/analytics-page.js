
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useInventory } from "@/lib/inventory-context"
import { logsAPI } from "@/lib/api"
import {
  BarChart3,
  Package,
  TrendingDown,
  AlertTriangle,
  ShoppingCart,
  Download,
  Users,
  BarChart4,
  PieChart,
  Layers,
  ChevronRight,
  Sparkles,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  LineChart,
  RefreshCw,
} from "lucide-react"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 transition-all duration-200 overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        success:
          "border-transparent bg-emerald-500 text-white shadow-sm hover:bg-emerald-600",
        warning:
          "border-transparent bg-amber-500 text-white shadow-sm hover:bg-amber-600",
        info:
          "border-transparent bg-blue-500 text-white shadow-sm hover:bg-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Badge({ className, variant, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border-2 shadow-sm",
        className,
      )}
      style={{ borderColor: "oklch(24.571% 0.12604 288.685)" }}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 pt-5 pb-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 pb-6", className)}
      {...props}
    />
  )
}

function Table({ className, ...props }) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto rounded-lg border-2"
      style={{ borderColor: "oklch(24.571% 0.12604 288.685)" }}
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5",
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }) {
  return (
    <td
      data-slot="table-cell"
      className={cn("p-4 align-middle", className)}
      {...props}
    />
  )
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export function AnalyticsPage() {
  const { products, borrowRecords, getMonthlyReport, refreshData } = useInventory()
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [selectedYear, setSelectedYear] = React.useState(null)
  const [borrowedSearch, setBorrowedSearch] = React.useState("")
  const [purchasedSearch, setPurchasedSearch] = React.useState("")

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshData()
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  const monthlyData = getMonthlyReport()
  
  // Get unique years from monthly data and sort in descending order
  const availableYears = React.useMemo(() => {
    const years = [...new Set(monthlyData.map(m => m.year))].sort((a, b) => b - a)
    return years
  }, [monthlyData])

  // Set selected year to current year if not set
  React.useEffect(() => {
    if (selectedYear === null && availableYears.length > 0) {
      setSelectedYear(availableYears[0])
    }
  }, [availableYears, selectedYear])

  // Filter monthly data by selected year
  const filteredMonthlyData = React.useMemo(() => {
    if (!selectedYear) return monthlyData
    return monthlyData.filter(m => m.year === selectedYear)
  }, [monthlyData, selectedYear])

  const totalMasterCount = products.reduce(
    (s, p) => s + p.masterCount,
    0,
  )
  const totalAvailability = products.reduce(
    (s, p) => s + p.availability,
    0,
  )

  const isReturned = React.useCallback((record) => {
    if (!record?.returnDate) return false
    const parsed = new Date(record.returnDate)
    if (Number.isNaN(parsed.getTime())) return false
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    return parsed <= today
  }, [])

  const totalBorrowed = borrowRecords
    .filter((r) => r.type === "borrow" && !isReturned(r))
    .reduce((s, r) => s + r.quantity, 0)

  const totalPurchased = borrowRecords
    .filter((r) => r.type === "purchase")
    .reduce((s, r) => s + r.quantity, 0)

  const productNameById = React.useMemo(() => {
    const map = new Map()
    products.forEach((p) => {
      map.set(p.id, p.name)
    })
    return map
  }, [products])

  const getProductTotals = React.useCallback((type, excludeReturned) => {
    const counts = new Map()
    borrowRecords
      .filter((r) => r.type === type && (!excludeReturned || !isReturned(r)))
      .forEach((r) => {
        const name = productNameById.get(r.productId) || "Unknown product"
        counts.set(name, (counts.get(name) || 0) + (r.quantity || 1))
      })
    return Array.from(counts.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
  }, [borrowRecords, isReturned, productNameById])

  const borrowedByProduct = React.useMemo(
    () => getProductTotals("borrow", true),
    [getProductTotals],
  )

  const purchasedByProduct = React.useMemo(
    () => getProductTotals("purchase", false),
    [getProductTotals],
  )

  const filteredBorrowedProducts = React.useMemo(() => {
    const query = borrowedSearch.trim().toLowerCase()
    if (!query) return borrowedByProduct
    return borrowedByProduct.filter((item) => item.name.toLowerCase().includes(query))
  }, [borrowedByProduct, borrowedSearch])

  const filteredPurchasedProducts = React.useMemo(() => {
    const query = purchasedSearch.trim().toLowerCase()
    if (!query) return purchasedByProduct
    return purchasedByProduct.filter((item) => item.name.toLowerCase().includes(query))
  }, [purchasedByProduct, purchasedSearch])

  const lowStockProducts = products.filter(
    (p) => p.masterCount > 0 && (p.availability / p.masterCount <= 0.50 || p.availability === 1)
  )

  const downloadMonthlyReport = async (month, year) => {
    try {
      const report = await logsAPI.getMonthlyProductReport(month, year)
      const rows = report?.rows || []
      const title = `INVENTORY DETAILS - ${month} ${year}`

      const headers = [
        "Sl.No",
        "Particulars",
        "OP Bal",
        "Addition (Purchases)",
        "Scrap",
        "Utilised",
        "Closing Stock",
      ]

      const formatValue = (value) => {
        if (value === 0) return "-"
        if (value === null || value === undefined || value === "") return "-"
        return value
      }

      const dataRows = rows.map((row, index) => [
        index + 1,
        row.productName,
        formatValue(row.openingStock),
        formatValue(row.additions),
        formatValue(row.scrap),
        formatValue(row.utilized),
        formatValue(row.closingStock),
      ])

      const formatRow = (row) =>
        row.map((cell) => {
          const value = cell ?? ""
          const text = String(value).replace(/"/g, '""')
          return `"${text}"`
        }).join(",")

      const csv = [
        [title],
        [""],
        headers,
        ...dataRows,
      ]
        .map(formatRow)
        .join("\n")

      const a = document.createElement("a")
      a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
      a.download = `Inventory-Details-${month}-${year}.csv`
      a.click()
    } catch (error) {
      window.alert(error.message || "Failed to download report")
    }
  }

  const downloadAllMonthsReport = () => {
    if (filteredMonthlyData.length === 0) return

    const summaryRows = [
      ["Month", "Year", "Opening Stock", "Closing Stock", "Purchased", "Defective"],
      ...filteredMonthlyData.map((m) => [
        m.month,
        m.year,
        m.openingStock,
        m.closingStock,
        m.newlyPurchased,
        m.defectiveRemoved,
      ]),
    ]

    const transactionHeader = [
      "Month",
      "Year",
      "Date",
      "Product",
      "Student",
      "USN",
      "Section",
      "Type",
      "Quantity",
      "Return Date",
    ]

    const transactionRows = filteredMonthlyData.flatMap((m) =>
      (m.transactions || []).map((t) => [
        m.month,
        m.year,
        t.date || "",
        t.productName || "",
        t.studentName || "",
        t.usn || "",
        t.section || "",
        t.type || "",
        t.quantity ?? "",
        t.returnDate || "",
      ])
    )

    const csv = [
      ...summaryRows,
      [""],
      ["Transactions"],
      transactionHeader,
      ...transactionRows,
    ]
      .map((r) => r.join(","))
      .join("\n")

    const a = document.createElement("a")
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    a.download = `Analytics-${selectedYear}.csv`
    a.click()
  }

  return (
    <div className="space-y-6 px-4 py-2 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 
              className="text-2xl font-bold tracking-tight"
              style={{ color: "oklch(24.571% 0.12604 288.685)" }}
            >
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Comprehensive insights and performance metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border-2 p-5" style={{ borderColor: "oklch(24.571% 0.12604 288.685)" }}>
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border-2 p-5" style={{ borderColor: "oklch(24.571% 0.12604 288.685)" }}>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Opening Stock</p>
                <p className="text-2xl font-bold">{totalMasterCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border-2 p-5" style={{ borderColor: "oklch(24.571% 0.12604 288.685)" }}>
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Closing Stock</p>
                <p className="text-2xl font-bold">{totalAvailability}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transaction Analytics</CardTitle>
              <Badge variant="outline">
                <LineChart className="h-3 w-3" />
                30 Days
              </Badge>
            </div>
            <CardDescription>Total borrow and purchase activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="rounded-lg border-2 p-5" style={{ borderColor: "oklch(24.571% 0.12604 288.685)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Total Borrowed</p>
                      <p className="text-2xl font-bold">{totalBorrowed}</p>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "oklch(24.571% 0.12604 288.685 / 0.25)" }}>
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((totalBorrowed / (totalMasterCount || 1)) * 100, 100)}%` }}
                    />
                  </div>
                  {borrowedByProduct.length > 0 ? (
                    <div className="mt-3 border-t border-slate-200/70 dark:border-slate-700/60 pt-3">
                      <p className="text-[11px] font-semibold uppercase text-muted-foreground">By Product</p>
                      <div className="mt-2">
                        <input
                          type="text"
                          value={borrowedSearch}
                          onChange={(e) => setBorrowedSearch(e.target.value)}
                          placeholder="Search products"
                          className="h-8 w-full rounded-md border-2 bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                          style={{ borderColor: "oklch(24.571% 0.12604 288.685)" }}
                        />
                        <div className="mt-3 max-h-40 overflow-y-auto pr-1 pb-2 space-y-1">
                          {filteredBorrowedProducts.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                              <span className="truncate">{item.name}</span>
                              <span className="font-medium">{item.total}</span>
                            </div>
                          ))}
                          {filteredBorrowedProducts.length === 0 && (
                            <p className="text-xs text-muted-foreground">No matching products.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">No borrowed items yet.</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border-2 p-5" style={{ borderColor: "oklch(24.571% 0.12604 288.685)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Total Purchased</p>
                      <p className="text-2xl font-bold">{totalPurchased}</p>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "oklch(24.571% 0.12604 288.685 / 0.25)" }}>
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((totalPurchased / (totalMasterCount || 1)) * 100, 100)}%` }}
                    />
                  </div>
                  {purchasedByProduct.length > 0 ? (
                    <div className="mt-3 border-t border-slate-200/70 dark:border-slate-700/60 pt-3">
                      <p className="text-[11px] font-semibold uppercase text-muted-foreground">By Product</p>
                      <div className="mt-2">
                        <input
                          type="text"
                          value={purchasedSearch}
                          onChange={(e) => setPurchasedSearch(e.target.value)}
                          placeholder="Search products"
                          className="h-8 w-full rounded-md border-2 bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                          style={{ borderColor: "oklch(24.571% 0.12604 288.685)" }}
                        />
                        <div className="mt-3 max-h-40 overflow-y-auto pr-1 pb-2 space-y-1">
                          {filteredPurchasedProducts.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                              <span className="truncate">{item.name}</span>
                              <span className="font-medium">{item.total}</span>
                            </div>
                          ))}
                          {filteredPurchasedProducts.length === 0 && (
                            <p className="text-xs text-muted-foreground">No matching products.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">No purchased items yet.</p>
                  )}
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Low Stock Alerts</CardTitle>
              {lowStockProducts.length > 0 && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3" />
                  {lowStockProducts.length}
                </Badge>
              )}
            </div>
            <CardDescription>Products at or below 50% availability or single items in stock</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="mb-4 h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">All products are well-stocked</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => {
                  const percentage = Math.round((product.availability / product.masterCount) * 100)
                  return (
                    <div
                      key={product.id}
                      className="rounded-lg border border-input p-3 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <Badge variant="destructive" className="text-xs">
                          {product.availability}/{product.masterCount}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Stock Level</span>
                          <span className="font-medium">{percentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
                {lowStockProducts.length > 5 && (
                  <Button variant="ghost" size="sm" className="w-full">
                    View All {lowStockProducts.length} Items
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Monthly Reports</CardTitle>
              <CardDescription>Detailed inventory analytics by month</CardDescription>
            </div>
            {monthlyData.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                {availableYears.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Year:</span>
                    <select
                      value={selectedYear || ''}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {availableYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadAllMonthsReport}
                >
                  <Download className="h-4 w-4" />
                  Export All
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {monthlyData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No monthly data available yet</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Reports will appear as data accumulates
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Month</TableHead>
                    <TableHead className="w-[100px]">Year</TableHead>
                    <TableHead className="text-right">Opening</TableHead>
                    <TableHead className="text-right">Closing</TableHead>
                    <TableHead className="text-right">Purchased</TableHead>
                    <TableHead className="text-right">Defective</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMonthlyData.map((m) => (
                    <TableRow key={`${m.year}-${m.month}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          {m.month}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-muted-foreground">
                        {m.year}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {m.openingStock == null ? "-" : m.openingStock}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-medium">
                            {m.closingStock == null ? "-" : m.closingStock}
                          </span>
                          {m.closingStock != null && m.openingStock != null ? (
                            m.closingStock > m.openingStock ? (
                              <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            ) : m.closingStock < m.openingStock ? (
                              <ArrowDownRight className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            ) : null
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {m.newlyPurchased == null ? "-" : `+${m.newlyPurchased}`}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {m.defectiveRemoved == null ? "-" : `-${m.defectiveRemoved}`}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/analytics/monthly?year=${m.year}&month=${encodeURIComponent(m.month)}`)}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadMonthlyReport(m.month, m.year)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
            </>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
