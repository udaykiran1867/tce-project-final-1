"use client"

import { useEffect, useMemo, useState } from "react"
import { logsAPI } from "@/lib/api"
import { NotebookText, RefreshCw, AlertCircle, Package } from "lucide-react"

const formatDate = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString()
}

export function RemarksPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchRemarks = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await logsAPI.getDefectiveRemarks(1000)
      setRows(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || "Failed to load remarks")
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRemarks()
  }, [])

  const grouped = useMemo(() => {
    const map = new Map()
    rows.forEach((row) => {
      const key = row.productName || "Unknown product"
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key).push(row)
    })
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [rows])

  const totalDefective = useMemo(() => {
    return rows.reduce((sum, row) => sum + (row.quantity || 0), 0)
  }, [rows])

  const primaryColor = "oklch(24.571% 0.12604 288.685)"

  return (
    <div className="space-y-6 px-4 py-2 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: primaryColor }}
          >
            Defective Remarks
          </h1>
          <p className="text-muted-foreground">
            Track and monitor component-wise defective item history.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRemarks}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border-2 p-5" style={{ borderColor: primaryColor }}>
          <p className="text-sm text-muted-foreground">Total Entries</p>
          <p className="mt-1 text-2xl font-bold">{rows.length}</p>
        </div>
        <div className="rounded-xl border-2 p-5" style={{ borderColor: primaryColor }}>
          <p className="text-sm text-muted-foreground">Total Defective</p>
          <p className="mt-1 text-2xl font-bold">{totalDefective}</p>
        </div>
        <div className="rounded-xl border-2 p-5" style={{ borderColor: primaryColor }}>
          <p className="text-sm text-muted-foreground">Components</p>
          <p className="mt-1 text-2xl font-bold">{grouped.length}</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-xl bg-card shadow-sm" style={{ border: `2px solid ${primaryColor}` }}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: primaryColor }}>
          <div className="flex items-center gap-2">
            <NotebookText className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Defective Records</h2>
          </div>
          <span className="text-sm text-muted-foreground">{rows.length} records</span>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-sm text-muted-foreground">Loading remarks...</div>
        ) : grouped.length === 0 ? (
          <div className="px-6 py-8 text-sm text-muted-foreground">No defective remarks found.</div>
        ) : (
          <div className="divide-y" style={{ borderColor: primaryColor }}>
            {grouped.map(([component, entries]) => {
              const componentTotal = entries.reduce((sum, e) => sum + (e.quantity || 0), 0)
              return (
                <div key={component}>
                  <div className="flex items-center justify-between border-b bg-muted/40 px-6 py-3" style={{ borderColor: primaryColor }}>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium">{component}</h3>
                    </div>
                    <span className="text-sm text-muted-foreground">{componentTotal} defective</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-muted/40 text-left" style={{ borderColor: primaryColor }}>
                        <tr>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Quantity</th>
                          <th className="px-6 py-3">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry, idx) => (
                          <tr key={entry.id || `${component}-${idx}`} className="border-b last:border-0" style={{ borderColor: primaryColor }}>
                            <td className="px-6 py-3 text-muted-foreground">{formatDate(entry.createdAt)}</td>
                            <td className="px-6 py-3 font-medium">{entry.quantity || 0}</td>
                            <td className="px-6 py-3">
                              {entry.remarks && entry.remarks !== "-" ? (
                                entry.remarks
                              ) : (
                                <span className="text-muted-foreground">No remarks</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
