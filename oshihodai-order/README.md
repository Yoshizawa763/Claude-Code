# 押し放題酒場 — 偽・飲食店注文アプリ

タッチパネル型の「注文アプリ風」ジョークアプリです。
本物そっくりの操作感・演出はそのままに、**注文は一切どこにも送信されません**。
「ボタンを押す気持ちよさ」だけを最大化しています。

- React + TypeScript + Vite + Tailwind CSS v4
- バックエンドなし・通信なし（状態は React state と localStorage のみ）
- 効果音は Web Audio API で合成（外部音源ファイルなし）
- 画像は絵文字＋グラデーション背景（外部画像の取得なし）
- タブレット横向き（1024x768）を第一ターゲットに、スマホ縦横・タブレット縦にも対応

## 起動方法

```bash
cd oshihodai-order
npm install
npm run dev
```

ブラウザで表示された URL（既定は http://localhost:5173 ）を開きます。
タブレットやスマホで試す場合は `npm run dev -- --host` で同一 LAN から開けます。

本番ビルドと確認:

```bash
npm run build     # dist/ に出力（型チェック込み）
npm run preview   # ビルド結果をローカル配信
npm run lint      # oxlint
```

## スマホのホーム画面から使う（PWA）

このアプリはホーム画面に追加でき、追加後はアイコンからアプリのように全画面で起動します。
一度開いたあとは、電波がなくても起動できます（アプリ本体を端末内にキャッシュするだけで、外部への通信はしません）。

### 1. ネット上に公開する（初回のみ）

ホーム画面に追加するには、スマホから開ける URL が必要です。
GitHub Pages で無料公開する仕組みを `.github/workflows/oshihodai-pages.yml` に用意しています。

1. このブランチを GitHub にプッシュすると、GitHub Actions がビルドして `gh-pages` ブランチを作ります。
2. GitHub のリポジトリ画面で **Settings → Pages** を開きます。
3. **Build and deployment** の **Source** を「Deploy from a branch」にし、ブランチに `gh-pages`、フォルダに `/ (root)` を選んで **Save** します。
4. 1〜2分後、次の URL で開けるようになります。

```
https://yoshizawa763.github.io/Claude-Code/
```

以後は `oshihodai-order/` を変更してプッシュするたびに自動で更新されます。
Actions タブの「押し放題酒場を GitHub Pages に公開」から手動実行もできます。

### 2. ホーム画面に追加する

待機画面の「📲 ホーム画面に追加してアプリにする」ボタンを押すと、端末に合わせた手順が出ます。

- **iPhone / iPad**：Safari で開き、共有ボタン ⬆️ →「ホーム画面に追加」→「追加」
- **Android**：Chrome で開き、ボタンからそのままインストール（または ︙ メニュー →「ホーム画面に追加」）

ホーム画面から起動しているときは、このボタンは表示されません。

### 仕組み

| ファイル | 役割 |
| --- | --- |
| `public/manifest.webmanifest` | アプリ名・アイコン・全画面表示の設定 |
| `public/icons/` | ホーム画面用アイコン（ローカルで描画した PNG） |
| `sw-template.js` | Service Worker の雛形。ビルド時に `vite.config.ts` がキャッシュ対象一覧を埋め込み `sw.js` を出力 |
| `src/lib/pwa.ts` | Service Worker の登録、インストール可否の判定 |
| `src/components/InstallButton.tsx` | 待機画面の「ホーム画面に追加」ボタンと手順案内 |

Service Worker は本番ビルド（`npm run build` / `npm run preview` / GitHub Pages）でのみ動きます。`npm run dev` では登録されません。

## 画面の流れ

```
待機画面「ご注文はこちら」
  → 卓番号・人数入力（形式だけ。何を入れても進める）
  → メニュー（カテゴリ／サブカテゴリ／検索／おすすめランキング）
      ├ 商品詳細モーダル（数量＋−、オプション選択）
      ├ カート（点数・小計のリアルタイム表示）
      └ 注文確定 → 確認ダイアログ → 「ご注文を承りました」→ メニューに戻る
  ├ 注文履歴（「もう一度同じものを注文」）
  └ 伝票確認（累計金額・解放済み称号）
```

起動時に一度「これは練習用アプリです」の注意が出ます。
画面左下には常に「デモモード／注文は送信されません」が表示されます。

## 「押した感」の演出

| 演出 | 実装場所 |
| --- | --- |
| 全ボタンの押下アニメーション（縮小＋色変化）＋クリック音＋振動 | `src/components/PressButton.tsx`, `src/index.css` (`.pressable`) |
| 数量＋ボタンの長押し加速（間隔が短くなり、ステップ幅も増える） | `src/hooks/useLongPress.ts` |
| カート投入時に商品が飛ぶ／「+N」が浮く／紙吹雪 | `src/components/FxLayer.tsx`, `src/lib/fx.ts` |
| 注文確定時の紙吹雪・拡大テキスト・ファンファーレ | `src/screens/OrderCompleteScreen.tsx`, `src/lib/audio.ts` |
| ヘッダーの「本日の注文点数」「累計金額」が転がって増える | `src/components/RollingCounter.tsx`, `src/hooks/useRollingNumber.ts` |
| 連続タップ中のコンボ表示 | `src/hooks/useCombo.tsx`, `src/components/ComboIndicator.tsx` |
| 称号（バッジ）解放のトースト | `src/data/badges.ts`, `src/components/BadgeWatcher.tsx` |
| 振動（Vibration API、非対応端末では無視） | `src/lib/haptics.ts` |

効果音はヘッダー右上の 🔊 で消音できます。

## ディレクトリ構成

```
oshihodai-order/
├── index.html
├── sw-template.js                # Service Worker の雛形（ビルド時に sw.js を生成）
├── public/                       # マニフェスト・アイコン
├── src/
│   ├── main.tsx / App.tsx        # エントリ・画面遷移・PWA 初期化
│   ├── index.css                 # Tailwind テーマ・アニメーション定義
│   ├── types.ts                  # 型定義（MenuItem, CartLine, Order, Badge ...）
│   ├── data/
│   │   ├── menu.ts               # メニューデータ（カテゴリ・商品）
│   │   ├── options.ts            # オプション定義（サイズ・辛さ・焼き加減 ...）
│   │   ├── photos.ts             # メニュー写真の割り当てとクレジット
│   │   └── badges.ts             # 称号の解放条件
│   ├── lib/                      # 効果音・振動・localStorage・演出バス・整形
│   ├── hooks/                    # 長押し・転がる数字・コンボ・トースト・カート投入
│   ├── store/AppStore.tsx        # アプリ状態（useReducer + localStorage 永続化）
│   ├── components/               # 共通UI（ボタン・カード・モーダル・カート ...）
│   └── screens/                  # 各画面
└── README.md
```

## メニューの追加方法

`src/data/menu.ts` の該当カテゴリの配列に `def(...)` を1行足すだけです。

```ts
// 例：揚げ物 > 鶏 に「ザンギ」を追加
sub('鶏', [
  def('鶏の唐揚げ', 620, 'ジューシーな定番唐揚げ。', '🍗', { badges: ['popular'], rank: 2, options: ['sauce'], kana: 'からあげ' }),
  def('ザンギ', 680, '北海道風の濃いめ下味。', '🍗', { badges: ['new'], options: ['sauce'], kana: 'ざんぎ' }),
  // ...
]),
```

`def(商品名, 価格, 説明, 絵文字, 追加情報)` の追加情報（省略可）:

| キー | 内容 |
| --- | --- |
| `badges` | `'popular'`（人気）`'limited'`（期間限定）`'new'`（NEW）の配列 |
| `rank` | おすすめランキングの順位（1〜）。付けた商品が「おすすめ」タブに並ぶ |
| `options` | 適用するオプショングループ。`size` `spicy` `ice` `topping` `doneness` `sauce` `temperature` `rice` `noodle` `tare` `wasabi` |
| `kana` | 検索用のよみがな・キーワード（商品名・説明・サブカテゴリも検索対象） |

- 商品IDは `カテゴリID-連番` で自動採番されます（履歴の互換のため、既存商品の順序を入れ替えると ID が変わる点に注意）。
- 背景グラデーションはカテゴリごとの候補（`GRADIENTS`）から自動で割り当てられます。
- サブカテゴリを増やすには `CATEGORIES` の `subCategories` に名前を追加し、`sub('名前', [...])` でまとめます。
- カテゴリ自体を増やすには `src/types.ts` の `CategoryId` に ID を追加し、`CATEGORIES` と `GRADIENTS` に定義を足します。
- オプションの選択肢を変えるには `src/data/options.ts` を編集します。
- 称号の条件を変えるには `src/data/badges.ts` を編集します（`minItems`：累計点数、`minYen`：累計金額）。

## メニュー写真の追加方法

写真がない商品は、絵文字とグラデーションのイラストで表示されます。
写真を割り当てると、メニューカード・商品詳細・カートで写真に切り替わり、カートへ飛ぶ演出も写真になります。

1. 写真ファイルを `public/photos/` に置きます（例：`public/photos/karaage.webp`）。横 480px 前後の JPEG / WebP がおすすめです。
2. `src/data/photos.ts` の `PHOTOS` に、商品名をキーにして追記します。

```ts
export const PHOTOS: Record<string, MenuPhoto> = {
  '鶏の唐揚げ': {
    src: 'photos/karaage.webp',
    author: '作者名',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:...',
  },
}
```

- キーは `src/data/menu.ts` の商品名と完全に一致させてください。
- 写真の読み込みに失敗した場合は、自動でイラスト表示に戻ります。
- 登録した写真の作者・ライセンス・出典は、「伝票」画面の「📷 写真クレジット」に一覧表示されます。
- このアプリは GitHub Pages で誰でも見られる状態で公開されます。自分で撮った写真か、自由ライセンス（CC0・CC BY・CC BY-SA など）の写真を使ってください。
- 写真は表示した時点で端末に保存され、以後はオフラインでも表示されます。
- 既存の写真を差し替えたときは、`sw-template.js` の `PHOTO_CACHE` の末尾の番号を上げてください。上げないと、一度開いた端末に古い写真が残ります。
- 登録済みの写真には、色・明るさ・コントラストを整える補正をかけています（料理が暖色寄りで明るく、艶が出るように調整）。

## 保存されるデータ

localStorage に以下を保存します（キー接頭辞 `oshihodai:v1:`）。

- 卓番号・人数、カートの中身、注文履歴、解放済み称号

「伝票」画面の「履歴と称号をリセット」で全て消せます。
売り切れ商品は起動ごとにランダムに数品選ばれます（豪華メニューは対象外）。

## 安全装置

- 起動時に「これは練習用アプリです。注文は送信されません」を表示
- 全画面の隅に常時「デモモード／注文は送信されません」を表示
- 配色は実在チェーンを模倣しないオリジナル（紫＋ライム）
- 外部へのネットワーク通信を行うコードは存在しません（Service Worker が扱うのは同じサイト内のアプリ本体ファイルだけです）
