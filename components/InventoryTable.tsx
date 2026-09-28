'use client'

import { useMemo, useState } from 'react'
import {
  Product,
  Warehouse,
  getStockStatus,
  getStockStatusLabel,
} from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'

export default function InventoryTable({
  products,
  warehouses,
}: {
  products: Product[]
  warehouses: Warehouse[]
}) {
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products],
  )
  const warehouseName = (id: string) =>
    warehouses.find((w) => w.id === id)?.name ?? id

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [lowStockOnly, setLowStockOnly] = useState(false)

  // Total units per warehouse, side by side. Computed off the full product
  // list (not the filtered one) so it always reflects the whole warehouse.
  const unitsByWarehouse = useMemo(() => {
    return warehouses.map((w) => ({
      warehouse: w,
      total: products
        .filter((p) => p.warehouseId === w.id)
        .reduce((sum, p) => sum + p.currentStock, 0),
    }))
  }, [products, warehouses])

  // Stretch — low stock summary per warehouse. Same "off the full list"
  // reasoning as above.
  const lowStockByWarehouse = useMemo(() => {
    return warehouses.map((w) => ({
      warehouse: w,
      count: products.filter(
        (p) => p.warehouseId === w.id && p.currentStock <= p.reorderThreshold,
      ).length,
    }))
  }, [products, warehouses])

  const visibleProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory)
        return false
      if (lowStockOnly && p.currentStock > p.reorderThreshold) return false
      return true
    })
  }, [products, selectedCategory, lowStockOnly])

  return (
    <>
      <div className="summary-strip">
        <div className="summary-tile">
          <div className="value">{products.length}</div>
          <div className="label">Total SKUs tracked</div>
        </div>
        <div className="summary-tile">
          <div className="value">{warehouses.length}</div>
          <div className="label">Warehouses</div>
        </div>
        <div className="summary-tile">
          <div className="value">{categories.length}</div>
          <div className="label">Categories</div>
        </div>
        <div className="summary-tile">
          <div className="value">
            {products.reduce((sum, p) => sum + p.currentStock, 0)}
          </div>
          <div className="label">Units on hand</div>
        </div>
      </div>

      <h3 className="section-label">Units per warehouse</h3>
      <div className="warehouse-totals">
        {unitsByWarehouse.map(({ warehouse, total }) => (
          <div className="warehouse-total-card" key={warehouse.id}>
            <div className="warehouse-total-name">{warehouse.name}</div>
            <div className="warehouse-total-value">
              {total.toLocaleString()} units
            </div>
          </div>
        ))}
      </div>

      <h3 className="section-label">Needs replenishment</h3>
      <div className="summary-strip" style={{ marginTop: 4 }}>
        {lowStockByWarehouse.map(({ warehouse, count }) => (
          <div className="summary-tile" key={warehouse.id}>
            <div className="value">{count}</div>
            <div className="label">{warehouse.name}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label className="checkbox-filter">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
          />
          Low stock only
        </label>
      </div>

      <div className="panel table-panel">
        {visibleProducts.length === 0 ? (
          <div className="empty-state">
            <h3>No products match these filters</h3>
            <p>Try a different category or clear the low stock filter.</p>
          </div>
        ) : (
          <div className="table-scroll" tabIndex={0} aria-label="Inventory table">
            <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Warehouse</th>
                <th>Current stock</th>
                <th>Reorder threshold</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => {
                const status = getStockStatus(product)
                return (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{warehouseName(product.warehouseId)}</td>
                    <td>{product.currentStock}</td>
                    <td>{product.reorderThreshold}</td>
                    <td>
                      <StatusBadge
                        status={status}
                        label={getStockStatusLabel(status)}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
