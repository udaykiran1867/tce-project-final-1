"use client"

import { useMemo, useState } from "react"
import { useInventory } from "@/lib/inventory-context"
import { Plus, Trash2, ClipboardList } from "lucide-react"

const getTodayDate = () => new Date().toISOString().split("T")[0]

const createRow = () => ({ productId: "", quantity: "1", type: "borrow" })

export function MultiRecordPage() {
  const { products, addBorrowRecord } = useInventory()

  const [studentName, setStudentName] = useState("")
  const [usn, setUsn] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [section, setSection] = useState("")
  const [takenDate, setTakenDate] = useState(getTodayDate())
  const [returnDate, setReturnDate] = useState("")
  const [rows, setRows] = useState([createRow()])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const productsById = useMemo(() => {
    const map = new Map()
    products.forEach((product) => map.set(product.id, product))
    return map
  }, [products])

  const addRow = () => setRows((prev) => [...prev, createRow()])

  const removeRow = (index) => {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index)))
  }

  const updateRow = (index, updates) => {
    setRows((prev) => prev.map((row, idx) => (idx === index ? { ...row, ...updates } : row)))
  }

  const resetForm = () => {
    setStudentName("")
    setUsn("")
    setPhoneNumber("")
    setSection("")
    setTakenDate(getTodayDate())
    setReturnDate("")
    setRows([createRow()])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!studentName.trim() || !usn.trim() || !phoneNumber.trim() || !section.trim() || !takenDate) {
      setError("Please fill in all required student fields")
      return
    }

    if (usn.trim().length !== 10) {
      setError("USN must be exactly 10 characters")
      return
    }

    if (phoneNumber.trim().length !== 10) {
      setError("Phone number must be exactly 10 digits")
      return
    }

    if (returnDate && returnDate < takenDate) {
      setError("Return date must be greater than or equal to taken date")
      return
    }

    const parsedRows = []
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i]
      if (!row.productId) {
        setError(`Select a component for row ${i + 1}`)
        return
      }

      const qty = Number.parseInt(row.quantity, 10)
      if (!Number.isFinite(qty) || qty <= 0) {
        setError(`Quantity must be at least 1 for row ${i + 1}`)
        return
      }

      const type = row.type === "purchase" ? "purchase" : "borrow"
      parsedRows.push({ productId: row.productId, quantity: qty, type })
    }

    const grouped = parsedRows.reduce((acc, row) => {
      acc.set(row.productId, (acc.get(row.productId) || 0) + row.quantity)
      return acc
    }, new Map())

    for (const [productId, totalQty] of grouped.entries()) {
      const product = productsById.get(productId)
      const available = product?.availability || 0
      if (totalQty > available) {
        setError(`Not enough stock for ${product?.name || "selected component"}. Available: ${available}, requested: ${totalQty}`)
        return
      }
    }

    setIsSubmitting(true)

    for (let i = 0; i < parsedRows.length; i += 1) {
      const row = parsedRows[i]
      const successResult = await addBorrowRecord({
        productId: row.productId,
        studentName: studentName.trim(),
        usn: usn.trim().toUpperCase(),
        phoneNumber: phoneNumber.trim(),
        section: section.trim().toUpperCase(),
        takenDate,
        returnDate: row.type === "borrow" ? (returnDate || "") : "",
        type: row.type,
        quantity: row.quantity,
      })

      if (!successResult) {
        setError(`Failed while saving row ${i + 1}. Please try again.`)
        setIsSubmitting(false)
        return
      }
    }

    setIsSubmitting(false)
    setSuccess(`Saved ${parsedRows.length} record${parsedRows.length > 1 ? "s" : ""} successfully.`)
    resetForm()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "oklch(24.571% 0.12604 288.685)" }}
          >
            Multi Record Entry
          </h1>
          <p className="text-muted-foreground">
            Enter student details once and add multiple borrow or purchase records in one submission.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {success && (
          <p className="text-sm text-emerald-600">{success}</p>
        )}

        <div className="rounded-xl p-6 shadow-sm" style={{ border: "2px solid oklch(24.571% 0.12604 288.685)", backgroundColor: "var(--card)" }}>
          <h2 className="text-base font-semibold">Student Information</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="studentName" className="text-sm font-medium">Student Name</label>
                <input
                  id="studentName"
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Enter student name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="usn" className="text-sm font-medium">USN</label>
                <input
                  id="usn"
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="e.g., 1MS21CS001"
                  maxLength={10}
                  value={usn}
                  onChange={(e) => setUsn(e.target.value.slice(0, 10))}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</label>
                <input
                  id="phoneNumber"
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="e.g., 9876543210"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="section" className="text-sm font-medium">Section</label>
                <input
                  id="section"
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="e.g., A"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="takenDate" className="text-sm font-medium">Taken Date</label>
                <input
                  id="takenDate"
                  type="date"
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={takenDate}
                  onChange={(e) => setTakenDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="returnDate" className="text-sm font-medium">Return Date</label>
                <input
                  id="returnDate"
                  type="date"
                  min={takenDate}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            </div>
        </div>

        <div className="rounded-xl p-6 shadow-sm" style={{ border: "2px solid oklch(24.571% 0.12604 288.685)", backgroundColor: "var(--card)" }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold">Components</h2>
              <span className="text-sm text-muted-foreground">
                {rows.length} {rows.length === 1 ? "item" : "items"}
              </span>
            </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                onClick={addRow}
              >
                <Plus className="h-4 w-4" />
                Add Component
              </button>
          </div>

          <div className="mt-4 space-y-3">
            {rows.map((row, index) => (
              <div
                key={`row-${index}`}
                className="grid grid-cols-1 gap-3 rounded-md border border-input bg-background p-3 sm:grid-cols-[180px_1fr_140px_auto]"
              >
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Type</label>
                    <select
                      className="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={row.type}
                      onChange={(e) => updateRow(index, { type: e.target.value })}
                    >
                      <option value="borrow">Borrow</option>
                      <option value="purchase">Purchase</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Component</label>
                    <select
                      className="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={row.productId}
                      onChange={(e) => updateRow(index, { productId: e.target.value })}
                    >
                      <option value="">Select component</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} (Avail: {product.availability})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={row.quantity}
                      onChange={(e) => updateRow(index, { quantity: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="select-none text-xs font-medium text-transparent">Action</label>
                    <button
                      type="button"
                      className="inline-flex h-10 items-center justify-center rounded-md border border-input px-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={() => removeRow(index)}
                      disabled={rows.length === 1}
                      aria-label={`Remove row ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60"
        >
          <ClipboardList className="h-4 w-4" />
          {isSubmitting ? "Saving Records..." : "Save All Records"}
        </button>
      </form>
    </div>
  )
}
