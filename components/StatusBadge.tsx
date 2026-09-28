import { StockStatus } from '@/lib/types'

export default function StatusBadge({
  status,
  label,
}: {
  status: StockStatus
  label: string
}) {
  return (
    <span className={`status-badge status-${status}`}>
      <span className="status-dot" />
      {label}
    </span>
  )
}
