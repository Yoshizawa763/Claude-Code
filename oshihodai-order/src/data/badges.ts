import type { Badge } from '../types'

/** 累計点数・累計金額に応じて解放される称号 */
export const BADGES: Badge[] = [
  { id: 'items-10', name: '注文見習い', description: '累計10点を注文', emoji: '🔰', minItems: 10 },
  { id: 'items-30', name: '常連の卵', description: '累計30点を注文', emoji: '🥚', minItems: 30 },
  { id: 'items-50', name: '宴会奉行', description: '累計50点を注文', emoji: '🍻', minItems: 50 },
  { id: 'items-100', name: '百点満点', description: '累計100点を注文', emoji: '💯', minItems: 100 },
  { id: 'items-300', name: '注文マシーン', description: '累計300点を注文', emoji: '🤖', minItems: 300 },
  { id: 'items-1000', name: '千手観音', description: '累計1000点を注文', emoji: '🙏', minItems: 1000 },
  { id: 'yen-10k', name: '万札の人', description: '累計1万円', emoji: '💴', minYen: 10_000 },
  { id: 'yen-100k', name: '太っ腹', description: '累計10万円', emoji: '💰', minYen: 100_000 },
  { id: 'yen-500k', name: '夜の帝王', description: '累計50万円', emoji: '👑', minYen: 500_000 },
  { id: 'yen-1m', name: '伝説の大盤振る舞い', description: '累計100万円', emoji: '🏆', minYen: 1_000_000 },
  { id: 'yen-10m', name: '店ごと買収', description: '累計1000万円', emoji: '🏢', minYen: 10_000_000 },
  { id: 'yen-100m', name: '億の男/女', description: '累計1億円', emoji: '🚀', minYen: 100_000_000 },
]
