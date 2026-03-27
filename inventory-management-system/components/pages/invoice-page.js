"use client"

import { useEffect, useMemo, useState } from "react"
import { invoicesAPI } from "@/lib/api"
import { FileUp, FileText, Eye, Download, Trash2 } from "lucide-react"

const acceptedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/",
]

const isAcceptedFile = (file) => {
  if (!file) return false
  if (file.type.startsWith("image/")) return true
  return acceptedTypes.includes(file.type)
}

const formatBytes = (size) => {
  if (!Number.isFinite(size)) return "-"
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString()
}

export function InvoicePage() {
  const [title, setTitle] = useState("")
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [invoices, setInvoices] = useState([])
  const [deletingId, setDeletingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")

  const currentDate = useMemo(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }, [])

  const [invoiceDate, setInvoiceDate] = useState(currentDate)

  const filteredInvoices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    
    let filtered = invoices
    
    // Filter by date
    if (dateFrom) {
      filtered = filtered.filter((invoice) => {
        const stamp = invoice.uploaded_at || invoice.created_at
        if (!stamp) return false
        const invoiceDate = new Date(stamp).toISOString().split('T')[0]
        return invoiceDate >= dateFrom
      })
    }
    
    // Filter by search query
    if (!query) return filtered
    return filtered.filter((invoice) => {
      const titleMatch = invoice.title?.toLowerCase().includes(query)
      const nameMatch = invoice.file_name?.toLowerCase().includes(query)
      return titleMatch || nameMatch
    })
  }, [invoices, dateFrom, searchQuery])

  const fetchInvoices = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await invoicesAPI.getAll()
      setInvoices(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || "Failed to load invoices")
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const handleUpload = async (event) => {
    event.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Please enter an invoice title.")
      return
    }

    if (!file) {
      setError("Please select a file to upload.")
      return
    }

    if (!isAcceptedFile(file)) {
      setError("Upload a PDF, DOC, DOCX, or image file.")
      return
    }

    setUploading(true)
    try {
      await invoicesAPI.upload({ title: title.trim(), file, invoiceDate })
      setTitle("")
      setFile(null)
      setInvoiceDate(currentDate)
      await fetchInvoices()
    } catch (err) {
      setError(err.message || "Failed to upload invoice")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (invoiceId) => {
    const confirmed = window.confirm("Delete this invoice?")
    if (!confirmed) return
    
    setDeletingId(invoiceId)
    setError("")
    
    // Optimistically remove from UI
    const invoiceToRestore = invoices.find(inv => inv.id === invoiceId)
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId))
    
    try {
      await invoicesAPI.delete(invoiceId)
    } catch (err) {
      // Restore if delete fails
      if (invoiceToRestore) {
        setInvoices(prev => [invoiceToRestore, ...prev])
      }
      setError(err.message || "Failed to delete invoice")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "oklch(24.571% 0.12604 288.685)" }}
          >
            Invoice
          </h1>
          <p className="text-muted-foreground">
            Upload and manage invoice documents.
          </p>
        </div>
      </div>

      <form
        className="rounded-xl p-6 shadow-sm"
        style={{ border: "2px solid oklch(24.571% 0.12604 288.685)", backgroundColor: "var(--card)" }}
        onSubmit={handleUpload}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter invoice title"
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Invoice</label>
            <input
              type="file"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60"
          >
            <FileUp className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <p className="text-xs text-muted-foreground">
            Allowed: PDF, DOC, DOCX, PNG, JPG
          </p>
        </div>
      </form>

      <div className="rounded-xl bg-card shadow-sm" style={{ border: "2px solid oklch(24.571% 0.12604 288.685)" }}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "oklch(24.571% 0.12604 288.685)" }}>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Uploaded Invoices</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {filteredInvoices.length} items
          </span>
        </div>

        <div className="border-b px-6 py-4" style={{ borderColor: "oklch(24.571% 0.12604 288.685)" }}>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="search"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-sm text-muted-foreground">
            Loading invoices...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="px-6 py-8 text-sm text-muted-foreground">
            No invoices match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b last:border-0">
                    <td className="px-6 py-3 font-medium">
                      {invoice.title}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {formatDate(invoice.uploaded_at || invoice.created_at)}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {invoice.file_type || "-"}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {formatBytes(invoice.file_size)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {invoice.view_url || invoice.file_url ? (
                          <a
                            href={invoice.view_url || invoice.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </a>
                        ) : null}
                        {invoice.download_url || invoice.file_url ? (
                          <a
                            href={invoice.download_url || invoice.file_url}
                            className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleDelete(invoice.id)}
                          disabled={deletingId === invoice.id}
                          className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingId === invoice.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
