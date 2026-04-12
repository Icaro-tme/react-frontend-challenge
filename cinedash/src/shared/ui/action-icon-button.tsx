import type { ReactNode } from 'react'

type ActionIconButtonSize = 'sm' | 'md'

interface ActionIconButtonProps {
  tooltip: string
  colorClassName: string
  onClick: () => void
  children: ReactNode
  size?: ActionIconButtonSize
}

const BUTTON_SIZE_CLASS_MAP: Record<ActionIconButtonSize, string> = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
}

export function ActionIconButton({
  tooltip,
  colorClassName,
  onClick,
  children,
  size = 'md',
}: ActionIconButtonProps) {
  const tamanhoClasse = BUTTON_SIZE_CLASS_MAP[size]

  return (
    <div className="group/action relative">
      <button
        type="button"
        className={`flex ${tamanhoClasse} items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:scale-105 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 ${colorClassName}`}
        onClick={onClick}
      >
        {children}
      </button>

      <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-100 opacity-0 transition duration-200 group-hover/action:opacity-100">
        {tooltip}
      </span>
    </div>
  )
}
