/**
 * メニュー写真の割り当て
 *
 * キーは src/data/menu.ts の商品名。写真ファイルは public/photos/ に置く。
 * 写真がない商品は、従来どおり絵文字＋グラデーションで表示される。
 *
 * 自由ライセンス（CC BY / CC BY-SA など）の写真は、作者名・ライセンス・出典の表示が必要。
 * ここに書いた内容は「伝票」画面の「写真クレジット」に一覧表示される。
 */

export interface MenuPhoto {
  /** public/ からの相対パス（例：'photos/karaage.webp'） */
  src: string
  /** 作者名 */
  author: string
  /** ライセンス表記（例：'CC BY-SA 4.0'） */
  license: string
  /** 出典ページの URL */
  sourceUrl: string
}

export const PHOTOS: Record<string, MenuPhoto> = {
  // 例：
  // '鶏の唐揚げ': {
  //   src: 'photos/karaage.webp',
  //   author: 'Taro Yamada',
  //   license: 'CC BY-SA 4.0',
  //   sourceUrl: 'https://commons.wikimedia.org/wiki/File:Karaage.jpg',
  // },
}

export function getPhoto(name: string): MenuPhoto | undefined {
  return PHOTOS[name]
}

/** <img src> に使う URL（GitHub Pages のサブパスでも動くよう相対パスで返す） */
export function photoUrl(photo: MenuPhoto): string {
  return import.meta.env.BASE_URL + photo.src
}
