import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import type { Badge, CartLine, Order, TableInfo } from '../types'
import { BADGES } from '../data/badges'
import { MENU_ITEMS } from '../data/menu'
import { loadJSON, saveJSON } from '../lib/storage'
import { uid } from '../lib/format'

export interface AppState {
  table: TableInfo | null
  cart: CartLine[]
  orders: Order[]
  unlockedBadgeIds: string[]
  soldOutIds: string[]
  /** 直近で解放されたバッジ（トースト表示用のキュー） */
  pendingBadges: Badge[]
}

export type Action =
  | { type: 'SET_TABLE'; table: TableInfo }
  | { type: 'ADD_LINE'; line: Omit<CartLine, 'lineId'> }
  | { type: 'SET_QTY'; lineId: string; quantity: number }
  | { type: 'REMOVE_LINE'; lineId: string }
  | { type: 'CLEAR_CART' }
  | { type: 'PLACE_ORDER' }
  | { type: 'REORDER'; order: Order }
  | { type: 'SHIFT_BADGE' }
  | { type: 'RESET_SESSION' }
  | { type: 'RESET_ALL' }

function lineTotal(l: CartLine): number {
  const opt = l.selectedOptions.reduce((s, o) => s + o.priceDelta, 0)
  return (l.unitPrice + opt) * l.quantity
}

export function cartTotals(cart: CartLine[]) {
  return {
    count: cart.reduce((s, l) => s + l.quantity, 0),
    subtotal: cart.reduce((s, l) => s + lineTotal(l), 0),
  }
}

export function lineUnitPrice(l: CartLine): number {
  return l.unitPrice + l.selectedOptions.reduce((s, o) => s + o.priceDelta, 0)
}

export function orderTotals(orders: Order[]) {
  return {
    totalItems: orders.reduce((s, o) => s + o.itemCount, 0),
    totalYen: orders.reduce((s, o) => s + o.total, 0),
  }
}

/** 同一商品・同一オプションなら同じ行にまとめる */
function optionsKey(opts: CartLine['selectedOptions']): string {
  return opts.map((o) => `${o.groupLabel}:${o.label}`).sort().join('|')
}

function pickSoldOut(): string[] {
  // 豪華メニューは売り切れにしない（押しごたえを損なわないため）
  const pool = MENU_ITEMS.filter((m) => m.category !== 'luxury')
  const n = 6 + Math.floor(Math.random() * 5)
  const picked = new Set<string>()
  while (picked.size < n && picked.size < pool.length) {
    picked.add(pool[Math.floor(Math.random() * pool.length)].id)
  }
  return [...picked]
}

function computeNewBadges(orders: Order[], unlocked: string[]): Badge[] {
  const { totalItems, totalYen } = orderTotals(orders)
  return BADGES.filter((b) => {
    if (unlocked.includes(b.id)) return false
    if (b.minItems !== undefined && totalItems >= b.minItems) return true
    if (b.minYen !== undefined && totalYen >= b.minYen) return true
    return false
  })
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TABLE':
      return { ...state, table: action.table }
    case 'ADD_LINE': {
      const key = optionsKey(action.line.selectedOptions)
      const idx = state.cart.findIndex((l) => l.itemId === action.line.itemId && optionsKey(l.selectedOptions) === key)
      if (idx >= 0) {
        const cart = state.cart.slice()
        cart[idx] = { ...cart[idx], quantity: cart[idx].quantity + action.line.quantity }
        return { ...state, cart }
      }
      return { ...state, cart: [...state.cart, { ...action.line, lineId: uid('line') }] }
    }
    case 'SET_QTY': {
      if (action.quantity <= 0) {
        return { ...state, cart: state.cart.filter((l) => l.lineId !== action.lineId) }
      }
      return {
        ...state,
        cart: state.cart.map((l) => (l.lineId === action.lineId ? { ...l, quantity: Math.min(action.quantity, 999) } : l)),
      }
    }
    case 'REMOVE_LINE':
      return { ...state, cart: state.cart.filter((l) => l.lineId !== action.lineId) }
    case 'CLEAR_CART':
      return { ...state, cart: [] }
    case 'PLACE_ORDER': {
      if (state.cart.length === 0) return state
      const { count, subtotal } = cartTotals(state.cart)
      const order: Order = {
        id: uid('order'),
        ticketNo: state.orders.length + 1,
        placedAt: Date.now(),
        lines: state.cart,
        total: subtotal,
        itemCount: count,
      }
      const orders = [...state.orders, order]
      const newBadges = computeNewBadges(orders, state.unlockedBadgeIds)
      return {
        ...state,
        cart: [],
        orders,
        unlockedBadgeIds: [...state.unlockedBadgeIds, ...newBadges.map((b) => b.id)],
        pendingBadges: [...state.pendingBadges, ...newBadges],
      }
    }
    case 'REORDER': {
      let cart = state.cart
      for (const line of action.order.lines) {
        const key = optionsKey(line.selectedOptions)
        const idx = cart.findIndex((l) => l.itemId === line.itemId && optionsKey(l.selectedOptions) === key)
        if (idx >= 0) {
          cart = cart.slice()
          cart[idx] = { ...cart[idx], quantity: cart[idx].quantity + line.quantity }
        } else {
          cart = [...cart, { ...line, lineId: uid('line') }]
        }
      }
      return { ...state, cart }
    }
    case 'SHIFT_BADGE':
      return { ...state, pendingBadges: state.pendingBadges.slice(1) }
    case 'RESET_SESSION':
      return { ...state, table: null, cart: [] }
    case 'RESET_ALL':
      return { ...state, table: null, cart: [], orders: [], unlockedBadgeIds: [], pendingBadges: [] }
    default:
      return state
  }
}

function initState(): AppState {
  return {
    table: loadJSON<TableInfo | null>('table', null),
    cart: loadJSON<CartLine[]>('cart', []),
    orders: loadJSON<Order[]>('orders', []),
    unlockedBadgeIds: loadJSON<string[]>('badges', []),
    soldOutIds: pickSoldOut(),
    pendingBadges: [],
  }
}

interface Ctx {
  state: AppState
  dispatch: (a: Action) => void
  totals: { totalItems: number; totalYen: number }
  cart: { count: number; subtotal: number }
  isSoldOut: (id: string) => boolean
}

const AppContext = createContext<Ctx | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    saveJSON('table', state.table)
    saveJSON('cart', state.cart)
    saveJSON('orders', state.orders)
    saveJSON('badges', state.unlockedBadgeIds)
  }, [state.table, state.cart, state.orders, state.unlockedBadgeIds])

  const totals = useMemo(() => orderTotals(state.orders), [state.orders])
  const cart = useMemo(() => cartTotals(state.cart), [state.cart])
  const soldOut = useMemo(() => new Set(state.soldOutIds), [state.soldOutIds])

  const value = useMemo<Ctx>(
    () => ({ state, dispatch, totals, cart, isSoldOut: (id) => soldOut.has(id) }),
    [state, totals, cart, soldOut],
  )
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): Ctx {
  const c = useContext(AppContext)
  if (!c) throw new Error('useApp must be used inside AppStoreProvider')
  return c
}
