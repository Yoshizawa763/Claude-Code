import { forwardRef, useState } from 'react'
import { getPhoto, photoUrl } from '../data/photos'

interface Props {
  name: string
  emoji: string
  gradient: string
  /** 絵文字の大きさなど、サイズごとのクラス */
  emojiClassName?: string
  /** 位置指定（relative / absolute）と大きさを含めて渡す */
  className?: string
}

/**
 * 商品の画像枠。
 * 写真があれば写真を、なければ（または読み込みに失敗したら）絵文字＋グラデーションを表示する。
 * ref は「カートへ飛ぶ」演出の起点として使う。
 */
export const ItemImage = forwardRef<HTMLDivElement, Props>(function ItemImage(
  { name, emoji, gradient, emojiClassName = 'text-5xl', className = '' },
  ref,
) {
  const photo = getPhoto(name)
  const [failed, setFailed] = useState(false)
  const showPhoto = photo !== undefined && !failed

  return (
    <div ref={ref} className={`flex items-center justify-center overflow-hidden ${gradient} ${className}`}>
      {!showPhoto && <span className={`drop-shadow-md ${emojiClassName}`}>{emoji}</span>}
      {showPhoto && (
        <img
          src={photoUrl(photo)}
          alt={name}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  )
})
