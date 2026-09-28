'use client'

import { useMemo, useState } from 'react'
import { Product, Warehouse } from '@/lib/types'

export default function TransferForm({
  products: initialProducts,
  warehouses,
}: {
  products: Product[]
  warehouses: Warehouse[]
}) {
  const [products, setProducts] = useState(initialProducts)
  const [sourceWarehouseId, setSourceWarehouseId] = useState(
    warehouses[0]?.id ?? '',
  )
  const [destWarehouseId, setDestWarehouseId] = useState(
    warehouses[1]?.id ?? '',
  )

  const sourceProducts = useMemo(
    () => products.filter((p) => p.warehouseId === sourceWarehouseId),
    [products, sourceWarehouseId],
  )
  const [productId, setProductId] = useState(sourceProducts[0]?.id ?? '')
  const [quantity, setQuantity] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleSourceChange(id: string) {
    setSourceWarehouseId(id)
    const firstAtSource = products.find((p) => p.warehouseId === id)
    setProductId(firstAtSource?.id ?? '')
    if (id === destWarehouseId) {
      const alt = warehouses.find((w) => w.id !== id)
      if (alt) setDestWarehouseId(alt.id)
    }
  }

  const selectedProduct = products.find((p) => p.id === productId)

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (sourceWarehouseId === destWarehouseId) {
      setError('Source and destination warehouses must be different.')
      return
    }
    if (!productId || !selectedProduct) {
      setError('Select a product to transfer.')
      return
    }

    const parsedQuantity = Number(quantity)
    if (
      !quantity ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      setError('Enter a whole number greater than 0 (no decimals).')
      return
    }
    if (parsedQuantity > selectedProduct.currentStock) {
      setError(
        `Only ${selectedProduct.currentStock} in stock at the source warehouse — cannot transfer more than that.`,
      )
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'transfer',
          productId,
          destWarehouseId,
          quantity: parsedQuantity,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        return
      }

      // Update local state with the authoritative rows the server sent back:
      // patch the source row, and either patch or append the destination row
      // (it may be a brand-new row if this product didn't exist there yet).
      setProducts((prev) => {
        const withSource = prev.map((p) =>
          p.id === data.source.id ? data.source : p,
        )
        const destExists = withSource.some((p) => p.id === data.destination.id)
        return destExists
          ? withSource.map((p) =>
              p.id === data.destination.id ? data.destination : p,
            )
          : [...withSource, data.destination]
      })

      setSuccess(
        `Transferred ${parsedQuantity} unit${parsedQuantity === 1 ? '' : 's'} of ${data.source.name} to the destination warehouse.`,
      )
      setQuantity('')
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="panel form-panel">
      <form onSubmit={handleTransfer}>
        <div className="form-field">
          <label htmlFor="source">Source warehouse</label>
          <select
            id="source"
            value={sourceWarehouseId}
            onChange={(e) => handleSourceChange(e.target.value)}
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="t-product">Product</label>
          <select
            id="t-product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            disabled={sourceProducts.length === 0}
          >
            {sourceProducts.length === 0 ? (
              <option value="">No products at this warehouse</option>
            ) : (
              sourceProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.currentStock} on hand)
                </option>
              ))
            )}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="dest">Destination warehouse</label>
          <select
            id="dest"
            value={destWarehouseId}
            onChange={(e) => setDestWarehouseId(e.target.value)}
          >
            {warehouses
              .filter((w) => w.id !== sourceWarehouseId)
              .map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="t-quantity">Quantity</label>
          <input
            id="t-quantity"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onKeyDown={(e) => {
              if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) {
                e.preventDefault()
              }
            }}
          />
        </div>

        <div className="form-error">{error}</div>
        {!error && success && (
          <p
            style={{
              fontSize: 12.5,
              color: 'var(--moss-dark)',
              margin: '-10px 0 12px',
            }}
          >
            {success}
          </p>
        )}

        <div className="form-actions">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={submitting}
          >
            Transfer stock
          </button>
        </div>
      </form>
    </div>
  )
}
