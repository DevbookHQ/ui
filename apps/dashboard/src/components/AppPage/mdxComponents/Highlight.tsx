import clsx from 'clsx'
import { CurlyBraces } from 'lucide-react'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import debounce from 'lodash.debounce'

import { parseNumericRange } from 'utils/parseNumericRange'
import Text from 'components/typography/Text'

import { useAppContext } from '../AppContext'

export interface Props {
  children?: ReactNode
  // Expression like 1-10,20-30
  lines?: string
  // This helps identifying the actual editor
  file?: string
}

function useMouseIndicator() {
  const [isActive, setIsActive] = useState(false)

  useEffect(function attach() {
    if (!isActive) return

    const el = document.createElement('div')

    // DELETE: FOR TESTING
    el.style.background = 'blue'
    el.innerHTML = 'LOADING'

    el.style.position = 'fixed'
    el.style.pointerEvents = 'none'
    document.body.appendChild(el)

    const handleWindowMouseMove = (event: MouseEvent) => {
      const x = event.clientX
      const y = event.clientY
      el.style.top = `${y}px`
      el.style.left = `${x}px`
    }
    window.addEventListener('mousemove', handleWindowMouseMove)
    return () => {
      window.removeEventListener(
        'mousemove',
        handleWindowMouseMove,
      )
      document.body.removeChild(el)
    }
  }, [isActive])

  return setIsActive
}

let idCounter = 0

const hoverTimeout = 550

function Highlight({ children, lines }: Props) {
  const parsedLines = useMemo(() => lines ? parseNumericRange(lines) : undefined, [lines])
  const [appCtx, setAppCtx] = useAppContext()
  const [isActive, setIsActive] = useState(false)
  const [wasClicked, setWasClicked] = useState(false)

  const [id, setID] = useState<number>()
  useEffect(function getComponentID() {
    setID(idCounter++)
  }, [])

  const setIndicatorState = useMouseIndicator()

  const debouncedHover = useMemo(() => debounce((active: boolean) => {
    setIsActive(active)
    setIndicatorState(false)
  }, hoverTimeout, {
    leading: false,
    trailing: true,
    maxWait: hoverTimeout,
  }), [setIsActive, setIndicatorState])

  useEffect(function handleEditorHover() {
    if (!parsedLines) return
    if (parsedLines.length === 0) return

    if (!appCtx.Code.hoveredLine || !parsedLines) {
      setIsActive(false)
      debouncedHover(false)
      debouncedHover.flush()
      setIndicatorState(false)
    } else {
      const hasOverlap = parsedLines.includes(appCtx.Code.hoveredLine)
      setIndicatorState(hasOverlap)
      debouncedHover(hasOverlap)
    }
  }, [
    appCtx.Code.hoveredLine,
    parsedLines,
    debouncedHover,
    setIndicatorState,
  ])

  useEffect(function propagateToAppState() {
    if (id === undefined) return
    if (!parsedLines) return
    if (parsedLines.length === 0) return

    setAppCtx(d => {
      if (!d.Explanation[id]) {
        d.Explanation[id] = {
          highlightLines: parsedLines,
          enabled: false
        }
      } else {
        d.Explanation[id]!.highlightLines = parsedLines
      }
    })

    return () => {
      setAppCtx(d => {
        if (d.Explanation[id]) {
          d.Explanation[id] = undefined
        }
      })
    }
  }, [
    parsedLines,
    setAppCtx,
    id,
  ])

  useEffect(function propagateToAppState() {
    if (id === undefined) return
    if (!parsedLines) return
    if (parsedLines.length === 0) return

    const state = wasClicked || isActive
    if (!state) return

    setAppCtx(d => {
      if (!d.Explanation[id]) {
        d.Explanation[id] = {
          highlightLines: parsedLines,
          enabled: true
        }
      } else {
        d.Explanation[id]!.enabled = state
      }
    })

    return () => {
      setAppCtx(d => {
        if (d.Explanation[id]) {
          d.Explanation[id]!.enabled = false
        }
      })
    }
  }, [
    isActive,
    parsedLines,
    wasClicked,
    setAppCtx,
    id,
  ])

  return (
    <div
      className="
      flex
      items-center
      flex-1
      relative
      my-0.5
      py-1
    "
    >
      <div
        className={clsx(`
          flex
          transition-all
          border-transparent
          border
          z-10
          flex-col
          flex-1
          rounded-md
          items-stretch`,
        )}
      >
        {children}
      </div>
      <div className={clsx(
        `absolute
        transition-all
        inset-y-0
        -inset-x-2
        rounded`,
        {
          'bg-slate-200': wasClicked || isActive,
        },
      )} />
      <div
        className={clsx(`
          right-0
          -mr-5
          top-1/2
          -translate-y-1/2
          translate-x-full
          flex
          space-x-2
          absolute
          not-prose
          group
          items-center
          transition-all
          cursor-pointer
          `,
          {
            'text-slate-600': wasClicked,
            'text-slate-400': !wasClicked,
          })
        }
        onMouseOver={() => setIsActive(true)}
        onMouseLeave={() => setIsActive(false)}
        onClick={() => setWasClicked(e => !e)}
      >
        <div
          className={clsx(`
          bg-white
          p-1
          transition-all
          rounded
          border
          flex
          hover:bg-slate-50
          items-center
          space-x-1
          group-hover:text-cyan-200
          group-hover:border-cyan-200
          `,
            {
              'border-cyan-200 text-cyan-200': wasClicked,
              'border-slate-300': !wasClicked,
            }
          )}
        >
          <CurlyBraces size="16px" />
        </div>
        <Text
          className="group-hover:text-cyan-200 transition-all"
          size={Text.size.S3}
          text="Show code"
        />
      </div>
    </div>
  )
}

export default Highlight
