import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'framer-motion'

export function useCountUp(target: number, duration = 1.5) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setValue(Math.round(latest)),
    })
    return () => controls.stop()
  }, [inView, target, duration])

  return { value, ref }
}
