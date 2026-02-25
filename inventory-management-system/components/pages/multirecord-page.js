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
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 p-6 shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300/10 rounded-full blur-3xl -z-0" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 p-2.5 shadow-lg">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <h1 
              className="text-3xl font-bold tracking-tight"
              style={{ color: "oklch(24.571% 0.12604 288.685)" }}
            >
              Multi Record Entry
            </h1>
          </div>
          <p className="text-sm text-gray-600 ml-12">
            Enter student details once and add multiple borrow or purchase records in a single submission.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Alert Messages */}
        {error && (
          <div className="rounded-lg border-2 border-red-300 bg-gradient-to-r from-red-50 to-red-100 p-4 shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-red-200 p-1.5">
                <svg className="h-4 w-4 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="rounded-lg border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-100 p-4 shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-emerald-200 p-1.5">
                <svg className="h-4 w-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-emerald-800">{success}</p>
            </div>
          </div>
        )}

        {/* Student Details Section */}
        <div className="relative overflow-hidden rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-purple-100/50 p-6 shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="mb-4 flex items-center gap-2 pb-3 border-b-2 border-purple-200">
              <div className="rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 p-2 shadow-md">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Student Information</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="studentName" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="studentName"
                  className="h-11 w-full rounded-lg border-2 border-purple-200 bg-white px-4 py-2 text-sm shadow-sm transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 hover:border-purple-300"
                  placeholder="Enter student name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="usn" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  USN <span className="text-red-500">*</span>
                </label>
                <input
                  id="usn"
                  className="h-11 w-full rounded-lg border-2 border-purple-200 bg-white px-4 py-2 text-sm shadow-sm transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 hover:border-purple-300 uppercase"
                  placeholder="e.g., 1MS21CS001"
                  maxLength={10}
                  value={usn}
                  onChange={(e) => setUsn(e.target.value.slice(0, 10))}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phoneNumber"
                  className="h-11 w-full rounded-lg border-2 border-purple-200 bg-white px-4 py-2 text-sm shadow-sm transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 hover:border-purple-300"
                  placeholder="e.g., 9876543210"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="section" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  Section <span className="text-red-500">*</span>
                </label>
                <input
                  id="section"
                  className="h-11 w-full rounded-lg border-2 border-purple-200 bg-white px-4 py-2 text-sm shadow-sm transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 hover:border-purple-300 uppercase"
                  placeholder="e.g., A"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="takenDate" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  Taken Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="takenDate"
                  type="date"
                  className="h-11 w-full rounded-lg border-2 border-purple-200 bg-white px-4 py-2 text-sm shadow-sm transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 hover:border-purple-300"
                  value={takenDate}
                  onChange={(e) => setTakenDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="returnDate" className="text-sm font-semibold text-gray-700">
                  Return Date <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="returnDate"
                  type="date"
                  min={takenDate}
                  className="h-11 w-full rounded-lg border-2 border-purple-200 bg-white px-4 py-2 text-sm shadow-sm transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 hover:border-purple-300"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Components Section */}
        <div className="relative overflow-hidden rounded-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50/50 to-purple-100/50 p-6 shadow-lg">
          <div className="absolute top-0 left-0 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-purple-200">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 p-2 shadow-md">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Components</h2>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700 border border-purple-300">
                  {rows.length} {rows.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-purple-400 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: "oklch(24.571% 0.12604 288.685)" }}
                onClick={addRow}
              >
                <Plus className="h-4 w-4" />
                Add Component
              </button>
            </div>

            <div className="space-y-3">
              {rows.map((row, index) => (
                <div
                  key={`row-${index}`}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-[180px_1fr_140px_auto] p-3 rounded-lg border-2 border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-purple-300 transition-all"
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Type</label>
                    <select
                      className="h-10 rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 hover:border-purple-300"
                      value={row.type}
                      onChange={(e) => updateRow(index, { type: e.target.value })}
                    >
                      <option value="borrow">Borrow</option>
                      <option value="purchase">Purchase</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Component</label>
                    <select
                      className="h-10 rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 hover:border-purple-300"
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
                    <label className="text-xs font-semibold text-gray-600">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className="h-10 rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 hover:border-purple-300"
                      value={row.quantity}
                      onChange={(e) => updateRow(index, { quantity: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600 opacity-0 select-none">Action</label>
                    <button
                      type="button"
                      className="inline-flex h-10 items-center justify-center rounded-lg border-2 border-purple-300 bg-white px-3 text-sm shadow-sm transition-all hover:bg-purple-50 hover:border-purple-400 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                      style={{ color: "oklch(24.571% 0.12604 288.685)" }}
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
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ backgroundColor: "oklch(24.571% 0.12604 288.685)" }}
          className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-purple-400 px-6 py-4 text-base font-bold text-white shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity" />
          <ClipboardList className="h-5 w-5 relative z-10" />
          <span className="relative z-10">{isSubmitting ? "Saving Records..." : "Save All Records"}</span>
        </button>
      </form>
    </div>
  )
}
