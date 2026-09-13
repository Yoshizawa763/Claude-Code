import type { OptionGroup, OptionGroupId } from '../types'

export const OPTION_GROUPS: Record<OptionGroupId, OptionGroup> = {
  size: {
    id: 'size',
    label: 'サイズ',
    multiple: false,
    choices: [
      { id: 'regular', label: 'レギュラー', priceDelta: 0 },
      { id: 'large', label: 'ラージ', priceDelta: 150 },
      { id: 'mega', label: 'メガ', priceDelta: 350 },
    ],
  },
  spicy: {
    id: 'spicy',
    label: '辛さ',
    multiple: false,
    choices: [
      { id: 'mild', label: '普通', priceDelta: 0 },
      { id: 'hot', label: '辛口', priceDelta: 0 },
      { id: 'veryhot', label: '激辛', priceDelta: 50 },
      { id: 'oni', label: '鬼辛', priceDelta: 100 },
    ],
  },
  ice: {
    id: 'ice',
    label: '氷',
    multiple: false,
    choices: [
      { id: 'normal', label: '氷あり', priceDelta: 0 },
      { id: 'less', label: '氷少なめ', priceDelta: 0 },
      { id: 'none', label: '氷抜き', priceDelta: 0 },
    ],
  },
  topping: {
    id: 'topping',
    label: 'トッピング',
    multiple: true,
    choices: [
      { id: 'cheese', label: 'チーズ', priceDelta: 120 },
      { id: 'egg', label: '温泉たまご', priceDelta: 100 },
      { id: 'mentai', label: '明太子', priceDelta: 180 },
      { id: 'negi', label: 'ねぎ増し', priceDelta: 80 },
      { id: 'butter', label: 'バター', priceDelta: 80 },
    ],
  },
  doneness: {
    id: 'doneness',
    label: '焼き加減',
    multiple: false,
    choices: [
      { id: 'rare', label: 'レア', priceDelta: 0 },
      { id: 'mr', label: 'ミディアムレア', priceDelta: 0 },
      { id: 'medium', label: 'ミディアム', priceDelta: 0 },
      { id: 'well', label: 'ウェルダン', priceDelta: 0 },
    ],
  },
  sauce: {
    id: 'sauce',
    label: '味付け',
    multiple: false,
    choices: [
      { id: 'sauce', label: 'ソース', priceDelta: 0 },
      { id: 'salt', label: '塩', priceDelta: 0 },
      { id: 'ponzu', label: 'ポン酢', priceDelta: 0 },
      { id: 'tartar', label: 'タルタル', priceDelta: 50 },
    ],
  },
  temperature: {
    id: 'temperature',
    label: '温度',
    multiple: false,
    choices: [
      { id: 'cold', label: '冷や', priceDelta: 0 },
      { id: 'room', label: '常温', priceDelta: 0 },
      { id: 'warm', label: 'ぬる燗', priceDelta: 0 },
      { id: 'hot', label: '熱燗', priceDelta: 0 },
    ],
  },
  rice: {
    id: 'rice',
    label: 'ご飯の量',
    multiple: false,
    choices: [
      { id: 'small', label: '少なめ', priceDelta: 0 },
      { id: 'normal', label: '普通', priceDelta: 0 },
      { id: 'large', label: '大盛', priceDelta: 100 },
      { id: 'tokumori', label: '特盛', priceDelta: 250 },
    ],
  },
  noodle: {
    id: 'noodle',
    label: '麺',
    multiple: false,
    choices: [
      { id: 'normal', label: '普通', priceDelta: 0 },
      { id: 'hard', label: '固め', priceDelta: 0 },
      { id: 'soft', label: '柔らかめ', priceDelta: 0 },
      { id: 'large', label: '大盛', priceDelta: 150 },
    ],
  },
  tare: {
    id: 'tare',
    label: '味',
    multiple: false,
    choices: [
      { id: 'tare', label: 'タレ', priceDelta: 0 },
      { id: 'shio', label: '塩', priceDelta: 0 },
      { id: 'miso', label: '味噌だれ', priceDelta: 30 },
    ],
  },
  wasabi: {
    id: 'wasabi',
    label: 'わさび',
    multiple: false,
    choices: [
      { id: 'yes', label: 'あり', priceDelta: 0 },
      { id: 'no', label: 'なし', priceDelta: 0 },
      { id: 'extra', label: '多め', priceDelta: 0 },
    ],
  },
}
