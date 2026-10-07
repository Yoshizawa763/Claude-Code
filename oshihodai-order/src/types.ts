/** カテゴリID（メニューの大分類） */
export type CategoryId =
  | 'beer'
  | 'sake'
  | 'softdrink'
  | 'otoshi'
  | 'fried'
  | 'yakitori'
  | 'sashimi'
  | 'teppan'
  | 'nabe'
  | 'shime'
  | 'dessert'
  | 'luxury'

export interface Category {
  id: CategoryId
  name: string
  emoji: string
  /** サブカテゴリ一覧（表示順） */
  subCategories: string[]
}

/** 商品に付くバッジ */
export type ItemBadge = 'popular' | 'limited' | 'new'

/** オプション種別ID */
export type OptionGroupId =
  | 'size'
  | 'spicy'
  | 'ice'
  | 'topping'
  | 'doneness'
  | 'sauce'
  | 'temperature'
  | 'rice'
  | 'noodle'
  | 'tare'
  | 'wasabi'

export interface OptionChoice {
  id: string
  label: string
  /** 追加料金（円） */
  priceDelta: number
}

export interface OptionGroup {
  id: OptionGroupId
  label: string
  /** 複数選択可（トッピングなど） */
  multiple: boolean
  choices: OptionChoice[]
}

export interface MenuItem {
  id: string
  name: string
  /** 検索用のよみがな・キーワード */
  kana?: string
  category: CategoryId
  subCategory: string
  price: number
  description: string
  emoji: string
  /** 背景グラデーション（Tailwind クラス） */
  gradient: string
  badges?: ItemBadge[]
  /** おすすめランキング順位（1〜） */
  rank?: number
  /** 適用するオプショングループ */
  options?: OptionGroupId[]
}

/** カートに入っている1行 */
export interface CartLine {
  lineId: string
  itemId: string
  name: string
  emoji: string
  gradient: string
  unitPrice: number
  quantity: number
  /** 選択したオプション（表示用ラベルと差額） */
  selectedOptions: { groupLabel: string; label: string; priceDelta: number }[]
}

export interface Order {
  id: string
  /** 伝票番号 */
  ticketNo: number
  placedAt: number
  lines: CartLine[]
  total: number
  itemCount: number
}

export interface TableInfo {
  tableNo: string
  guests: number
}

export interface Badge {
  id: string
  name: string
  description: string
  emoji: string
  /** 累計点数の条件 */
  minItems?: number
  /** 累計金額の条件 */
  minYen?: number
}

export type Screen =
  | 'idle'
  | 'setup'
  | 'menu'
  | 'complete'
  | 'history'
  | 'bill'
