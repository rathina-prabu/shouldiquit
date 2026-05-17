import { ReactNode } from "react"
import Link from "next/link"

interface Props {
  children: ReactNode
  topBarLeft?: ReactNode
  topBarRight?: ReactNode
}

// Wraps the wordmark with a link to '/' so the user can always tap back to the
// landing page from any screen.
function renderLeft(node: ReactNode): ReactNode {
  if (typeof node === "string" && node.startsWith("shouldiquit.work")) {
    return (
      <Link
        href="/"
        className="inline-block text-ink font-semibold uppercase tracking-[0.15em] text-[12px] [text-shadow:2px_2px_0_#e8576b] hover:opacity-75 transition-opacity"
      >
        {node}
      </Link>
    )
  }
  return node
}

export function RisoLayout({ children, topBarLeft, topBarRight }: Props) {
  return (
    <div className="w-full max-w-mobile mx-auto min-h-screen flex flex-col px-6 py-6 pb-16">
      {(topBarLeft || topBarRight) && (
        <div className="flex justify-between text-[11px] tracking-[0.15em] uppercase text-ink/60 pb-3 border-b border-ink/20 mb-8">
          <span>{renderLeft(topBarLeft)}</span>
          <span className="text-accent font-medium">{topBarRight}</span>
        </div>
      )}
      {children}
    </div>
  )
}
