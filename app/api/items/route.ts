import { NextResponse } from 'next/server'
import { applyStockMovement, applyTransfer, products } from '@/lib/seed-data'

export async function GET() {
  return NextResponse.json({ products })
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const action = body.action

  try {
    if (action === 'stock') {
      const { productId, quantity, direction } = body as {
        productId: string
        quantity: number
        direction: 'IN' | 'OUT'
      }
      if (direction !== 'IN' && direction !== 'OUT') {
        return NextResponse.json(
          { error: 'direction must be IN or OUT' },
          { status: 400 },
        )
      }
      const product = applyStockMovement(productId, Number(quantity), direction)
      return NextResponse.json({ product, products })
    }

    if (action === 'transfer') {
      const { productId, destWarehouseId, quantity } = body as {
        productId: string
        destWarehouseId: string
        quantity: number
      }
      const { source, destination } = applyTransfer(
        productId,
        destWarehouseId,
        Number(quantity),
      )
      return NextResponse.json({ source, destination, products })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
