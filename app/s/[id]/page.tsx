"use client"
import { useEffect } from "react"

export default function SharePreviewRedirect() {
  useEffect(() => {
    window.location.replace("/")
  }, [])
  return (
    <div className="min-h-screen flex items-center justify-center text-[13px] text-ink/60">
      Opening shouldiquit.work…
    </div>
  )
}
