export interface FoodItem {
  id: string
  name: string
  nameEn: string
  category: string
  per100g: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
    sodium: number
    cholesterol: number
    saturatedFat: number
    vitaminA: number
    vitaminC: number
    vitaminD: number
    calcium: number
    iron: number
    potassium: number
  }
  allergens: string[]
  servingSizeG: number
  servingUnit: string
}

export const FOOD_DATABASE: FoodItem[] = [
  // 主食
  { id: 'rice_white', name: '白米（炊いたもの）', nameEn: 'White Rice (cooked)', category: '穀物・主食', per100g: { calories: 168, protein: 2.5, carbs: 37.1, fat: 0.3, fiber: 0.3, sugar: 0, sodium: 1, cholesterol: 0, saturatedFat: 0.1, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 3, iron: 0.1, potassium: 29 }, allergens: [], servingSizeG: 150, servingUnit: '膳' },
  { id: 'bread_white', name: '食パン（白）', nameEn: 'White Bread', category: '穀物・主食', per100g: { calories: 264, protein: 9.3, carbs: 46.4, fat: 4.4, fiber: 2.3, sugar: 4.2, sodium: 475, cholesterol: 0, saturatedFat: 1.1, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 29, iron: 0.5, potassium: 97 }, allergens: ['小麦', 'グルテン'], servingSizeG: 60, servingUnit: '枚' },
  { id: 'udon', name: 'うどん（茹で）', nameEn: 'Udon Noodles (cooked)', category: '穀物・主食', per100g: { calories: 105, protein: 2.6, carbs: 21.6, fat: 0.4, fiber: 0.8, sugar: 0, sodium: 170, cholesterol: 0, saturatedFat: 0.1, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 9, iron: 0.2, potassium: 15 }, allergens: ['小麦', 'グルテン'], servingSizeG: 200, servingUnit: '玉' },
  { id: 'soba', name: 'そば（茹で）', nameEn: 'Soba Noodles (cooked)', category: '穀物・主食', per100g: { calories: 132, protein: 4.8, carbs: 26.0, fat: 1.0, fiber: 2.0, sugar: 0, sodium: 60, cholesterol: 0, saturatedFat: 0.2, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 9, iron: 0.8, potassium: 34 }, allergens: ['そば', '小麦'], servingSizeG: 200, servingUnit: '玉' },
  { id: 'pasta', name: 'パスタ（茹で）', nameEn: 'Pasta (cooked)', category: '穀物・主食', per100g: { calories: 165, protein: 5.8, carbs: 32.2, fat: 0.9, fiber: 1.7, sugar: 0.6, sodium: 1, cholesterol: 0, saturatedFat: 0.2, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 7, iron: 0.5, potassium: 34 }, allergens: ['小麦', 'グルテン'], servingSizeG: 200, servingUnit: '人前' },
  { id: 'ramen_instant', name: 'インスタントラーメン', nameEn: 'Instant Ramen', category: '穀物・主食', per100g: { calories: 431, protein: 9.9, carbs: 61.9, fat: 16.7, fiber: 2.2, sugar: 2.0, sodium: 2349, cholesterol: 0, saturatedFat: 7.8, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 90, iron: 1.1, potassium: 180 }, allergens: ['小麦', '大豆'], servingSizeG: 100, servingUnit: '袋' },
  { id: 'oatmeal', name: 'オートミール', nameEn: 'Oatmeal', category: '穀物・主食', per100g: { calories: 380, protein: 13.7, carbs: 59.7, fat: 6.9, fiber: 9.4, sugar: 0, sodium: 3, cholesterol: 0, saturatedFat: 1.2, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 47, iron: 3.6, potassium: 362 }, allergens: ['小麦'], servingSizeG: 40, servingUnit: '杯' },
  { id: 'brown_rice', name: '玄米（炊いたもの）', nameEn: 'Brown Rice (cooked)', category: '穀物・主食', per100g: { calories: 165, protein: 2.8, carbs: 35.6, fat: 1.0, fiber: 1.4, sugar: 0, sodium: 1, cholesterol: 0, saturatedFat: 0.2, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 7, iron: 0.6, potassium: 95 }, allergens: [], servingSizeG: 150, servingUnit: '膳' },

  // 肉類
  { id: 'chicken_breast', name: '鶏胸肉（皮なし）', nameEn: 'Chicken Breast (skinless)', category: '肉類', per100g: { calories: 108, protein: 22.3, carbs: 0, fat: 1.5, fiber: 0, sugar: 0, sodium: 42, cholesterol: 73, saturatedFat: 0.4, vitaminA: 6, vitaminC: 3, vitaminD: 0.1, calcium: 4, iron: 0.3, potassium: 370 }, allergens: [], servingSizeG: 100, servingUnit: 'g' },
  { id: 'chicken_thigh', name: '鶏もも肉（皮なし）', nameEn: 'Chicken Thigh (skinless)', category: '肉類', per100g: { calories: 127, protein: 19.0, carbs: 0, fat: 5.0, fiber: 0, sugar: 0, sodium: 65, cholesterol: 89, saturatedFat: 1.5, vitaminA: 11, vitaminC: 3, vitaminD: 0.1, calcium: 5, iron: 0.6, potassium: 330 }, allergens: [], servingSizeG: 100, servingUnit: 'g' },
  { id: 'beef_sirloin', name: '牛サーロイン', nameEn: 'Beef Sirloin', category: '肉類', per100g: { calories: 240, protein: 16.5, carbs: 0.4, fat: 17.9, fiber: 0, sugar: 0, sodium: 50, cholesterol: 65, saturatedFat: 7.5, vitaminA: 3, vitaminC: 1, vitaminD: 0, calcium: 3, iron: 2.0, potassium: 300 }, allergens: [], servingSizeG: 150, servingUnit: 'g' },
  { id: 'pork_loin', name: '豚ロース', nameEn: 'Pork Loin', category: '肉類', per100g: { calories: 263, protein: 19.3, carbs: 0.2, fat: 19.2, fiber: 0, sugar: 0, sodium: 44, cholesterol: 69, saturatedFat: 7.0, vitaminA: 2, vitaminC: 1, vitaminD: 0.3, calcium: 4, iron: 0.9, potassium: 310 }, allergens: [], servingSizeG: 100, servingUnit: 'g' },
  { id: 'ground_beef', name: '合いびき肉', nameEn: 'Ground Beef', category: '肉類', per100g: { calories: 272, protein: 17.4, carbs: 0.1, fat: 21.8, fiber: 0, sugar: 0, sodium: 71, cholesterol: 73, saturatedFat: 9.0, vitaminA: 3, vitaminC: 1, vitaminD: 0, calcium: 6, iron: 1.9, potassium: 280 }, allergens: [], servingSizeG: 100, servingUnit: 'g' },
  { id: 'bacon', name: 'ベーコン', nameEn: 'Bacon', category: '肉類', per100g: { calories: 405, protein: 16.5, carbs: 0.3, fat: 36.4, fiber: 0, sugar: 0, sodium: 800, cholesterol: 50, saturatedFat: 12.9, vitaminA: 0, vitaminC: 20, vitaminD: 0.4, calcium: 6, iron: 0.9, potassium: 230 }, allergens: [], servingSizeG: 50, servingUnit: 'g' },
  { id: 'ham', name: 'ハム（ロース）', nameEn: 'Ham (loin)', category: '肉類', per100g: { calories: 196, protein: 16.5, carbs: 1.5, fat: 13.9, fiber: 0, sugar: 0.6, sodium: 780, cholesterol: 55, saturatedFat: 4.5, vitaminA: 0, vitaminC: 50, vitaminD: 0, calcium: 6, iron: 0.9, potassium: 280 }, allergens: [], servingSizeG: 50, servingUnit: 'g' },
  { id: 'sausage', name: 'ウインナーソーセージ', nameEn: 'Vienna Sausage', category: '肉類', per100g: { calories: 321, protein: 11.5, carbs: 3.3, fat: 28.5, fiber: 0, sugar: 0, sodium: 860, cholesterol: 63, saturatedFat: 10.7, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 6, iron: 0.7, potassium: 200 }, allergens: ['豚肉'], servingSizeG: 45, servingUnit: '本' },
  { id: 'tuna_can', name: 'ツナ缶（水煮）', nameEn: 'Canned Tuna (in water)', category: '肉類', per100g: { calories: 71, protein: 16.0, carbs: 0.1, fat: 0.7, fiber: 0, sugar: 0, sodium: 230, cholesterol: 43, saturatedFat: 0.2, vitaminA: 0, vitaminC: 0, vitaminD: 8, calcium: 6, iron: 1.3, potassium: 270 }, allergens: ['魚'], servingSizeG: 70, servingUnit: '缶' },

  // 魚介類
  { id: 'salmon', name: '鮭（生）', nameEn: 'Salmon (raw)', category: '魚介類', per100g: { calories: 133, protein: 22.3, carbs: 0.1, fat: 4.1, fiber: 0, sugar: 0, sodium: 66, cholesterol: 59, saturatedFat: 0.9, vitaminA: 28, vitaminC: 0, vitaminD: 32, calcium: 14, iron: 0.5, potassium: 350 }, allergens: ['魚'], servingSizeG: 100, servingUnit: 'g' },
  { id: 'tuna_fresh', name: 'マグロ（赤身）', nameEn: 'Tuna (red flesh)', category: '魚介類', per100g: { calories: 125, protein: 26.4, carbs: 0.1, fat: 1.4, fiber: 0, sugar: 0, sodium: 49, cholesterol: 50, saturatedFat: 0.4, vitaminA: 83, vitaminC: 2, vitaminD: 4, calcium: 5, iron: 1.1, potassium: 380 }, allergens: ['魚'], servingSizeG: 100, servingUnit: 'g' },
  { id: 'mackerel', name: 'さば（生）', nameEn: 'Mackerel (raw)', category: '魚介類', per100g: { calories: 211, protein: 20.6, carbs: 0.3, fat: 16.8, fiber: 0, sugar: 0, sodium: 110, cholesterol: 65, saturatedFat: 4.2, vitaminA: 37, vitaminC: 0, vitaminD: 11, calcium: 6, iron: 1.2, potassium: 320 }, allergens: ['魚'], servingSizeG: 100, servingUnit: 'g' },
  { id: 'shrimp', name: 'えび（生）', nameEn: 'Shrimp (raw)', category: '魚介類', per100g: { calories: 82, protein: 18.4, carbs: 0.1, fat: 0.6, fiber: 0, sugar: 0, sodium: 170, cholesterol: 170, saturatedFat: 0.1, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 50, iron: 0.5, potassium: 310 }, allergens: ['えび'], servingSizeG: 100, servingUnit: 'g' },

  // 卵・乳製品
  { id: 'egg', name: '鶏卵（全卵）', nameEn: 'Chicken Egg (whole)', category: '卵・乳製品', per100g: { calories: 151, protein: 12.3, carbs: 0.3, fat: 10.3, fiber: 0, sugar: 0.3, sodium: 140, cholesterol: 370, saturatedFat: 3.1, vitaminA: 150, vitaminC: 0, vitaminD: 3.8, calcium: 51, iron: 1.8, potassium: 130 }, allergens: ['卵'], servingSizeG: 60, servingUnit: '個' },
  { id: 'milk', name: '牛乳（普通）', nameEn: 'Whole Milk', category: '卵・乳製品', per100g: { calories: 61, protein: 3.3, carbs: 4.8, fat: 3.8, fiber: 0, sugar: 4.8, sodium: 41, cholesterol: 12, saturatedFat: 2.3, vitaminA: 38, vitaminC: 1, vitaminD: 0.3, calcium: 110, iron: 0, potassium: 150 }, allergens: ['乳'], servingSizeG: 200, servingUnit: 'mL' },
  { id: 'yogurt_plain', name: 'プレーンヨーグルト', nameEn: 'Plain Yogurt', category: '卵・乳製品', per100g: { calories: 62, protein: 3.6, carbs: 4.9, fat: 3.0, fiber: 0, sugar: 4.9, sodium: 48, cholesterol: 12, saturatedFat: 1.9, vitaminA: 33, vitaminC: 1, vitaminD: 0, calcium: 120, iron: 0, potassium: 170 }, allergens: ['乳'], servingSizeG: 150, servingUnit: 'g' },
  { id: 'cheese_processed', name: 'プロセスチーズ', nameEn: 'Processed Cheese', category: '卵・乳製品', per100g: { calories: 339, protein: 22.7, carbs: 1.3, fat: 26.0, fiber: 0, sugar: 0.2, sodium: 1100, cholesterol: 78, saturatedFat: 16.0, vitaminA: 260, vitaminC: 0, vitaminD: 0.3, calcium: 630, iron: 0.3, potassium: 90 }, allergens: ['乳'], servingSizeG: 20, servingUnit: '個' },
  { id: 'butter', name: 'バター（食塩）', nameEn: 'Salted Butter', category: '卵・乳製品', per100g: { calories: 745, protein: 0.6, carbs: 0.2, fat: 81.0, fiber: 0, sugar: 0.2, sodium: 750, cholesterol: 220, saturatedFat: 51.0, vitaminA: 520, vitaminC: 0, vitaminD: 0.7, calcium: 15, iron: 0, potassium: 27 }, allergens: ['乳'], servingSizeG: 10, servingUnit: 'g' },

  // 大豆・豆腐
  { id: 'tofu_firm', name: '木綿豆腐', nameEn: 'Firm Tofu', category: '大豆・豆製品', per100g: { calories: 72, protein: 6.6, carbs: 1.5, fat: 4.2, fiber: 0.4, sugar: 0, sodium: 8, cholesterol: 0, saturatedFat: 0.7, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 93, iron: 1.5, potassium: 110 }, allergens: ['大豆'], servingSizeG: 150, servingUnit: '丁' },
  { id: 'tofu_silk', name: '絹ごし豆腐', nameEn: 'Silken Tofu', category: '大豆・豆製品', per100g: { calories: 56, protein: 4.9, carbs: 2.0, fat: 3.0, fiber: 0.3, sugar: 0, sodium: 7, cholesterol: 0, saturatedFat: 0.5, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 75, iron: 1.2, potassium: 150 }, allergens: ['大豆'], servingSizeG: 150, servingUnit: '丁' },
  { id: 'natto', name: '納豆', nameEn: 'Natto', category: '大豆・豆製品', per100g: { calories: 200, protein: 16.5, carbs: 12.1, fat: 10.0, fiber: 6.7, sugar: 0, sodium: 2, cholesterol: 0, saturatedFat: 1.5, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 90, iron: 3.3, potassium: 660 }, allergens: ['大豆'], servingSizeG: 50, servingUnit: 'パック' },
  { id: 'miso', name: '米みそ（淡色）', nameEn: 'Miso (light)', category: '大豆・豆製品', per100g: { calories: 192, protein: 12.5, carbs: 21.9, fat: 6.0, fiber: 4.9, sugar: 7.0, sodium: 4900, cholesterol: 0, saturatedFat: 1.0, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 80, iron: 3.4, potassium: 380 }, allergens: ['大豆'], servingSizeG: 18, servingUnit: '大さじ1' },
  { id: 'soy_sauce', name: '醤油（濃口）', nameEn: 'Soy Sauce (dark)', category: '調味料', per100g: { calories: 71, protein: 7.7, carbs: 7.9, fat: 0, fiber: 0, sugar: 6.1, sodium: 5700, cholesterol: 0, saturatedFat: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 22, iron: 1.9, potassium: 390 }, allergens: ['大豆', '小麦'], servingSizeG: 15, servingUnit: '大さじ1' },

  // 野菜
  { id: 'spinach', name: 'ほうれん草（生）', nameEn: 'Spinach (raw)', category: '野菜', per100g: { calories: 20, protein: 2.2, carbs: 3.1, fat: 0.4, fiber: 2.8, sugar: 0.3, sodium: 16, cholesterol: 0, saturatedFat: 0.1, vitaminA: 350, vitaminC: 35, vitaminD: 0, calcium: 49, iron: 2.0, potassium: 690 }, allergens: [], servingSizeG: 80, servingUnit: '束' },
  { id: 'broccoli', name: 'ブロッコリー（生）', nameEn: 'Broccoli (raw)', category: '野菜', per100g: { calories: 33, protein: 4.3, carbs: 5.2, fat: 0.5, fiber: 4.4, sugar: 1.7, sodium: 18, cholesterol: 0, saturatedFat: 0.1, vitaminA: 67, vitaminC: 120, vitaminD: 0, calcium: 38, iron: 1.0, potassium: 360 }, allergens: [], servingSizeG: 80, servingUnit: '房' },
  { id: 'carrot', name: 'にんじん（生）', nameEn: 'Carrot (raw)', category: '野菜', per100g: { calories: 39, protein: 0.7, carbs: 9.3, fat: 0.1, fiber: 2.8, sugar: 6.4, sodium: 48, cholesterol: 0, saturatedFat: 0, vitaminA: 720, vitaminC: 6, vitaminD: 0, calcium: 28, iron: 0.2, potassium: 270 }, allergens: [], servingSizeG: 80, servingUnit: '本' },
  { id: 'tomato', name: 'トマト（生）', nameEn: 'Tomato (raw)', category: '野菜', per100g: { calories: 19, protein: 0.7, carbs: 4.7, fat: 0.1, fiber: 1.0, sugar: 3.7, sodium: 3, cholesterol: 0, saturatedFat: 0, vitaminA: 45, vitaminC: 15, vitaminD: 0, calcium: 7, iron: 0.2, potassium: 210 }, allergens: [], servingSizeG: 150, servingUnit: '個' },
  { id: 'onion', name: '玉ねぎ（生）', nameEn: 'Onion (raw)', category: '野菜', per100g: { calories: 37, protein: 1.0, carbs: 8.4, fat: 0.1, fiber: 1.6, sugar: 7.2, sodium: 2, cholesterol: 0, saturatedFat: 0, vitaminA: 1, vitaminC: 8, vitaminD: 0, calcium: 17, iron: 0.2, potassium: 150 }, allergens: [], servingSizeG: 150, servingUnit: '個' },
  { id: 'cabbage', name: 'キャベツ（生）', nameEn: 'Cabbage (raw)', category: '野菜', per100g: { calories: 23, protein: 1.3, carbs: 5.2, fat: 0.2, fiber: 1.8, sugar: 3.4, sodium: 5, cholesterol: 0, saturatedFat: 0, vitaminA: 4, vitaminC: 41, vitaminD: 0, calcium: 43, iron: 0.3, potassium: 200 }, allergens: [], servingSizeG: 100, servingUnit: 'g' },
  { id: 'cucumber', name: 'きゅうり（生）', nameEn: 'Cucumber (raw)', category: '野菜', per100g: { calories: 14, protein: 1.0, carbs: 3.0, fat: 0.1, fiber: 1.1, sugar: 1.9, sodium: 1, cholesterol: 0, saturatedFat: 0, vitaminA: 28, vitaminC: 14, vitaminD: 0, calcium: 26, iron: 0.3, potassium: 200 }, allergens: [], servingSizeG: 100, servingUnit: '本' },
  { id: 'potato', name: 'じゃがいも（生）', nameEn: 'Potato (raw)', category: '野菜', per100g: { calories: 76, protein: 1.8, carbs: 17.3, fat: 0.1, fiber: 8.9, sugar: 1.2, sodium: 1, cholesterol: 0, saturatedFat: 0, vitaminA: 0, vitaminC: 28, vitaminD: 0, calcium: 4, iron: 0.4, potassium: 410 }, allergens: [], servingSizeG: 150, servingUnit: '個' },
  { id: 'sweet_potato', name: 'さつまいも（生）', nameEn: 'Sweet Potato (raw)', category: '野菜', per100g: { calories: 132, protein: 1.2, carbs: 31.5, fat: 0.2, fiber: 2.2, sugar: 14.7, sodium: 11, cholesterol: 0, saturatedFat: 0, vitaminA: 67, vitaminC: 29, vitaminD: 0, calcium: 36, iron: 0.6, potassium: 480 }, allergens: [], servingSizeG: 150, servingUnit: '個' },
  { id: 'mushroom_shiitake', name: 'しいたけ（生）', nameEn: 'Shiitake Mushroom (raw)', category: '野菜', per100g: { calories: 18, protein: 3.0, carbs: 6.4, fat: 0.3, fiber: 4.2, sugar: 0, sodium: 3, cholesterol: 0, saturatedFat: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0.4, calcium: 4, iron: 0.3, potassium: 290 }, allergens: [], servingSizeG: 50, servingUnit: '枚' },

  // 果物
  { id: 'apple', name: 'りんご（皮なし）', nameEn: 'Apple (peeled)', category: '果物', per100g: { calories: 57, protein: 0.1, carbs: 15.5, fat: 0.1, fiber: 1.4, sugar: 13.8, sodium: 1, cholesterol: 0, saturatedFat: 0, vitaminA: 2, vitaminC: 4, vitaminD: 0, calcium: 3, iron: 0.1, potassium: 120 }, allergens: [], servingSizeG: 200, servingUnit: '個' },
  { id: 'banana', name: 'バナナ', nameEn: 'Banana', category: '果物', per100g: { calories: 86, protein: 1.1, carbs: 22.5, fat: 0.2, fiber: 1.1, sugar: 15.4, sodium: 0, cholesterol: 0, saturatedFat: 0, vitaminA: 6, vitaminC: 16, vitaminD: 0, calcium: 6, iron: 0.3, potassium: 360 }, allergens: [], servingSizeG: 100, servingUnit: '本' },
  { id: 'orange', name: 'オレンジ', nameEn: 'Orange', category: '果物', per100g: { calories: 46, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 1.0, sugar: 9.4, sodium: 1, cholesterol: 0, saturatedFat: 0, vitaminA: 16, vitaminC: 60, vitaminD: 0, calcium: 21, iron: 0.3, potassium: 190 }, allergens: [], servingSizeG: 200, servingUnit: '個' },
  { id: 'strawberry', name: 'いちご', nameEn: 'Strawberry', category: '果物', per100g: { calories: 34, protein: 0.9, carbs: 8.5, fat: 0.1, fiber: 1.4, sugar: 7.1, sodium: 1, cholesterol: 0, saturatedFat: 0, vitaminA: 1, vitaminC: 62, vitaminD: 0, calcium: 17, iron: 0.3, potassium: 170 }, allergens: [], servingSizeG: 150, servingUnit: 'g' },
  { id: 'avocado', name: 'アボカド', nameEn: 'Avocado', category: '果物', per100g: { calories: 187, protein: 2.5, carbs: 8.7, fat: 18.7, fiber: 5.6, sugar: 0.7, sodium: 7, cholesterol: 0, saturatedFat: 2.9, vitaminA: 7, vitaminC: 12, vitaminD: 0, calcium: 8, iron: 0.5, potassium: 720 }, allergens: [], servingSizeG: 150, servingUnit: '個' },
  { id: 'blueberry', name: 'ブルーベリー', nameEn: 'Blueberry', category: '果物', per100g: { calories: 49, protein: 0.4, carbs: 14.2, fat: 0.2, fiber: 2.8, sugar: 9.7, sodium: 1, cholesterol: 0, saturatedFat: 0, vitaminA: 3, vitaminC: 9, vitaminD: 0, calcium: 6, iron: 0.3, potassium: 70 }, allergens: [], servingSizeG: 100, servingUnit: 'g' },

  // 油脂・ナッツ
  { id: 'olive_oil', name: 'オリーブ油', nameEn: 'Olive Oil', category: '油脂', per100g: { calories: 921, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0, saturatedFat: 13.8, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 1, iron: 0.1, potassium: 1 }, allergens: [], servingSizeG: 13, servingUnit: '大さじ1' },
  { id: 'almonds', name: 'アーモンド（素焼き）', nameEn: 'Almonds (roasted, unsalted)', category: 'ナッツ・種子', per100g: { calories: 587, protein: 20.3, carbs: 19.7, fat: 51.8, fiber: 10.1, sugar: 4.3, sodium: 3, cholesterol: 0, saturatedFat: 3.9, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 264, iron: 3.7, potassium: 740 }, allergens: ['アーモンド'], servingSizeG: 28, servingUnit: '一掴み' },
  { id: 'peanuts', name: 'ピーナッツ（素焼き）', nameEn: 'Peanuts (dry roasted)', category: 'ナッツ・種子', per100g: { calories: 585, protein: 25.4, carbs: 18.6, fat: 47.0, fiber: 7.2, sugar: 4.4, sodium: 4, cholesterol: 0, saturatedFat: 6.5, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 50, iron: 1.6, potassium: 720 }, allergens: ['落花生'], servingSizeG: 28, servingUnit: '一掴み' },
  { id: 'walnuts', name: 'くるみ', nameEn: 'Walnuts', category: 'ナッツ・種子', per100g: { calories: 674, protein: 14.6, carbs: 11.7, fat: 68.8, fiber: 7.5, sugar: 2.6, sodium: 4, cholesterol: 0, saturatedFat: 6.1, vitaminA: 1, vitaminC: 0, vitaminD: 0, calcium: 85, iron: 2.6, potassium: 540 }, allergens: ['くるみ'], servingSizeG: 28, servingUnit: '一掴み' },

  // 飲み物
  { id: 'green_tea', name: '緑茶（玉露以外）', nameEn: 'Green Tea', category: '飲み物', per100g: { calories: 0, protein: 0, carbs: 0.2, fat: 0, fiber: 0, sugar: 0, sodium: 1, cholesterol: 0, saturatedFat: 0, vitaminA: 0, vitaminC: 6, vitaminD: 0, calcium: 3, iron: 0.2, potassium: 27 }, allergens: [], servingSizeG: 200, servingUnit: 'mL' },
  { id: 'coffee_black', name: 'コーヒー（ブラック）', nameEn: 'Coffee (black)', category: '飲み物', per100g: { calories: 4, protein: 0.2, carbs: 0.7, fat: 0, fiber: 0, sugar: 0, sodium: 1, cholesterol: 0, saturatedFat: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 2, iron: 0, potassium: 65 }, allergens: [], servingSizeG: 200, servingUnit: 'mL' },
  { id: 'orange_juice', name: 'オレンジジュース（果汁100%）', nameEn: 'Orange Juice (100%)', category: '飲み物', per100g: { calories: 42, protein: 0.7, carbs: 10.3, fat: 0.1, fiber: 0.2, sugar: 9.1, sodium: 1, cholesterol: 0, saturatedFat: 0, vitaminA: 8, vitaminC: 30, vitaminD: 0, calcium: 10, iron: 0.2, potassium: 200 }, allergens: [], servingSizeG: 200, servingUnit: 'mL' },
  { id: 'beer', name: 'ビール（淡色）', nameEn: 'Beer (lager)', category: '飲み物', per100g: { calories: 40, protein: 0.3, carbs: 3.1, fat: 0, fiber: 0, sugar: 0, sodium: 3, cholesterol: 0, saturatedFat: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 3, iron: 0, potassium: 34 }, allergens: ['小麦'], servingSizeG: 350, servingUnit: '缶' },

  // 加工食品・惣菜
  { id: 'hamburger_homemade', name: 'ハンバーグ（手作り）', nameEn: 'Hamburger Patty (homemade)', category: '惣菜', per100g: { calories: 197, protein: 15.8, carbs: 8.5, fat: 12.0, fiber: 0.4, sugar: 2.0, sodium: 380, cholesterol: 80, saturatedFat: 4.6, vitaminA: 20, vitaminC: 3, vitaminD: 0.2, calcium: 40, iron: 1.8, potassium: 310 }, allergens: ['卵', '小麦', '牛乳'], servingSizeG: 130, servingUnit: '個' },
  { id: 'gyoza', name: '餃子（焼き）', nameEn: 'Gyoza (pan-fried)', category: '惣菜', per100g: { calories: 236, protein: 8.8, carbs: 24.8, fat: 11.5, fiber: 1.7, sugar: 2.1, sodium: 460, cholesterol: 30, saturatedFat: 3.0, vitaminA: 15, vitaminC: 5, vitaminD: 0, calcium: 37, iron: 0.9, potassium: 200 }, allergens: ['小麦', '豚肉'], servingSizeG: 20, servingUnit: '個' },
  { id: 'curry_rice', name: 'カレーライス（市販ルー使用）', nameEn: 'Curry Rice', category: '惣菜', per100g: { calories: 168, protein: 4.2, carbs: 29.6, fat: 4.0, fiber: 1.2, sugar: 3.5, sodium: 340, cholesterol: 10, saturatedFat: 1.5, vitaminA: 20, vitaminC: 5, vitaminD: 0, calcium: 20, iron: 0.5, potassium: 200 }, allergens: ['小麦', '牛乳', '豚肉'], servingSizeG: 400, servingUnit: '皿' },
  { id: 'fried_chicken', name: 'フライドチキン', nameEn: 'Fried Chicken', category: '惣菜', per100g: { calories: 260, protein: 19.0, carbs: 11.0, fat: 15.0, fiber: 0.3, sugar: 0.2, sodium: 500, cholesterol: 73, saturatedFat: 3.5, vitaminA: 20, vitaminC: 0, vitaminD: 0.1, calcium: 15, iron: 0.7, potassium: 270 }, allergens: ['小麦', '卵'], servingSizeG: 100, servingUnit: '個' },
  { id: 'sushi_salmon', name: '鮭にぎり寿司', nameEn: 'Salmon Nigiri Sushi', category: '惣菜', per100g: { calories: 175, protein: 8.2, carbs: 27.1, fat: 3.9, fiber: 0.2, sugar: 1.5, sodium: 200, cholesterol: 30, saturatedFat: 0.8, vitaminA: 12, vitaminC: 1, vitaminD: 8, calcium: 7, iron: 0.3, potassium: 140 }, allergens: ['魚'], servingSizeG: 55, servingUnit: '個' },
  { id: 'miso_soup', name: 'みそ汁（豆腐・わかめ）', nameEn: 'Miso Soup (tofu & wakame)', category: '惣菜', per100g: { calories: 25, protein: 1.8, carbs: 2.8, fat: 0.9, fiber: 0.5, sugar: 0.8, sodium: 490, cholesterol: 0, saturatedFat: 0.2, vitaminA: 3, vitaminC: 0, vitaminD: 0, calcium: 40, iron: 0.6, potassium: 130 }, allergens: ['大豆'], servingSizeG: 200, servingUnit: '杯' },
  { id: 'french_fries', name: 'フライドポテト', nameEn: 'French Fries', category: '惣菜', per100g: { calories: 237, protein: 3.4, carbs: 32.7, fat: 11.2, fiber: 3.1, sugar: 0.5, sodium: 140, cholesterol: 0, saturatedFat: 2.2, vitaminA: 0, vitaminC: 15, vitaminD: 0, calcium: 11, iron: 0.9, potassium: 680 }, allergens: [], servingSizeG: 135, servingUnit: 'M' },

  // スナック・お菓子
  { id: 'potato_chips', name: 'ポテトチップス（うすしお）', nameEn: 'Potato Chips (lightly salted)', category: 'お菓子', per100g: { calories: 554, protein: 4.7, carbs: 54.7, fat: 35.2, fiber: 3.8, sugar: 0.4, sodium: 500, cholesterol: 0, saturatedFat: 10.1, vitaminA: 0, vitaminC: 20, vitaminD: 0, calcium: 17, iron: 1.3, potassium: 1200 }, allergens: [], servingSizeG: 55, servingUnit: '袋' },
  { id: 'chocolate', name: 'ミルクチョコレート', nameEn: 'Milk Chocolate', category: 'お菓子', per100g: { calories: 550, protein: 7.0, carbs: 56.9, fat: 32.6, fiber: 3.9, sugar: 52.4, sodium: 64, cholesterol: 18, saturatedFat: 19.7, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 240, iron: 2.4, potassium: 440 }, allergens: ['乳', '大豆'], servingSizeG: 40, servingUnit: '枚' },
  { id: 'ice_cream', name: 'アイスクリーム（バニラ）', nameEn: 'Ice Cream (vanilla)', category: 'お菓子', per100g: { calories: 212, protein: 3.5, carbs: 23.2, fat: 12.0, fiber: 0, sugar: 21.7, sodium: 70, cholesterol: 50, saturatedFat: 7.3, vitaminA: 84, vitaminC: 1, vitaminD: 0.1, calcium: 120, iron: 0.1, potassium: 190 }, allergens: ['乳', '卵'], servingSizeG: 100, servingUnit: 'g' },
  { id: 'donut', name: 'ドーナツ（プレーン）', nameEn: 'Donut (plain)', category: 'お菓子', per100g: { calories: 387, protein: 5.9, carbs: 48.8, fat: 18.6, fiber: 1.2, sugar: 16.0, sodium: 380, cholesterol: 55, saturatedFat: 4.8, vitaminA: 10, vitaminC: 0, vitaminD: 0.3, calcium: 50, iron: 1.3, potassium: 110 }, allergens: ['小麦', '卵', '乳'], servingSizeG: 75, servingUnit: '個' },
  { id: 'protein_bar', name: 'プロテインバー', nameEn: 'Protein Bar', category: 'お菓子', per100g: { calories: 370, protein: 30.0, carbs: 40.0, fat: 10.0, fiber: 5.0, sugar: 18.0, sodium: 200, cholesterol: 10, saturatedFat: 3.0, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 200, iron: 3.0, potassium: 300 }, allergens: ['乳', '大豆'], servingSizeG: 60, servingUnit: '本' },
]

export function searchFoods(query: string): FoodItem[] {
  const q = query.toLowerCase()
  return FOOD_DATABASE.filter(f =>
    f.name.includes(q) || f.nameEn.toLowerCase().includes(q) || f.category.includes(q)
  ).slice(0, 20)
}

export function getFoodById(id: string): FoodItem | undefined {
  return FOOD_DATABASE.find(f => f.id === id)
}

export function calculateNutrition(food: FoodItem, amountG: number) {
  const ratio = amountG / 100
  return {
    calories: food.per100g.calories * ratio,
    protein: food.per100g.protein * ratio,
    carbs: food.per100g.carbs * ratio,
    fat: food.per100g.fat * ratio,
    fiber: food.per100g.fiber * ratio,
    sugar: food.per100g.sugar * ratio,
    sodium: food.per100g.sodium * ratio,
    cholesterol: food.per100g.cholesterol * ratio,
    saturatedFat: food.per100g.saturatedFat * ratio,
    vitaminA: food.per100g.vitaminA * ratio,
    vitaminC: food.per100g.vitaminC * ratio,
    vitaminD: food.per100g.vitaminD * ratio,
    calcium: food.per100g.calcium * ratio,
    iron: food.per100g.iron * ratio,
    potassium: food.per100g.potassium * ratio,
  }
}
