import { ReactNode } from "react"

interface Props {
  children: ReactNode
  topBarLeft?: ReactNode
  topBarRight?: ReactNode
}

export function RisoLayout({ children, topBarLeft, topBarRight }: Props) {
  return (
    <div className="w-full max-w-mobile mx-auto min-h-screen flex flex-col px-6 py-6 pb-16">
      {(topBarLeft || topBarRight) && (
        <div className="flex justify-between text-[11px] tracking-[0.15em] uppercase text-ink/60 pb-3 border-b border-ink/20 mb-8">
          <span>{topBarLeft}</span>
          <span className="text-accent font-medium">{topBarRight}</span>
        </div>
      )}
      {children}
    </div>
  )
}
