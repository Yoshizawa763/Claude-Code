/** Vibration API。非対応端末では黙って無視する。 */
export function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern)
    }
  } catch {
    /* ignore */
  }
}

export const haptic = {
  light: () => vibrate(8),
  medium: () => vibrate(18),
  heavy: () => vibrate([30, 20, 30]),
  success: () => vibrate([40, 30, 40, 30, 120]),
  badge: () => vibrate([20, 20, 20, 20, 20, 20, 80]),
}
