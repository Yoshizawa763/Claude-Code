import { useRollingNumber } from '../hooks/useRollingNumber'

interface Props {
  value: number
  format: (n: number) => string
  label: string
  shortLabel?: string
  className?: string
}

/** 数字が転がって増えるカウンター */
export function RollingCounter({ value, format, label, shortLabel, className = '' }: Props) {
  const { value: shown, rolling } = useRollingNumber(value)
  return (
    <div className={`flex flex-col items-end leading-none ${className}`}>
      <div className="whitespace-nowrap text-[9px] font-bold tracking-wider text-d-sub sm:text-[10px]">
        <span className="sm:hidden">{shortLabel ?? label}</span>
        <span className="hidden sm:inline">{label}</span>
      </div>
      <div
        key={rolling ? 'r' : 's'}
        className={`mt-0.5 whitespace-nowrap text-base font-bold tabular-nums text-d-text sm:text-xl ${rolling ? 'animate-bump text-d-yellow' : ''}`}
      >
        {format(shown)}
      </div>
    </div>
  )
}
