"use client"

import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface CommandPillOverlayProps {
  inputValue: string
  inputRef: React.RefObject<HTMLInputElement>
  className?: string
}

interface CommandMatch {
  command: string
  start: number
  end: number
}

export function CommandPillOverlay({
  inputValue,
  inputRef,
  className
}: CommandPillOverlayProps) {
  const [commandMatches, setCommandMatches] = useState<CommandMatch[]>([])
  const [pillPositions, setPillPositions] = useState<Array<{ left: number; width: number }>>([])
  const measuringRef = useRef<HTMLSpanElement>(null)

  // Find slash commands in the input text
  useEffect(() => {
    const commandRegex = /\/\w+/g
    const matches: CommandMatch[] = []
    let match

    while ((match = commandRegex.exec(inputValue)) !== null) {
      matches.push({
        command: match[0],
        start: match.index,
        end: match.index + match[0].length
      })
    }

    setCommandMatches(matches)
  }, [inputValue])

  // Calculate pill positions based on text metrics
  useEffect(() => {
    if (!inputRef.current || !measuringRef.current || commandMatches.length === 0) {
      setPillPositions([])
      return
    }

    const input = inputRef.current
    const measuring = measuringRef.current

    // Copy input styles to measuring element
    const computedStyle = window.getComputedStyle(input)
    measuring.style.font = computedStyle.font
    measuring.style.fontSize = computedStyle.fontSize
    measuring.style.fontFamily = computedStyle.fontFamily
    measuring.style.fontWeight = computedStyle.fontWeight
    measuring.style.letterSpacing = computedStyle.letterSpacing
    measuring.style.textTransform = computedStyle.textTransform

    const positions = commandMatches.map(({ start, end }) => {
      // Measure text before the command
      measuring.textContent = inputValue.substring(0, start)
      const leftOffset = measuring.getBoundingClientRect().width

      // Measure the command text width
      measuring.textContent = inputValue.substring(start, end)
      const commandWidth = measuring.getBoundingClientRect().width

      return {
        left: leftOffset,
        width: commandWidth
      }
    })

    setPillPositions(positions)
  }, [inputValue, commandMatches, inputRef])

  if (commandMatches.length === 0) {
    return null
  }

  return (
    <>
      {/* Hidden measuring element */}
      <span
        ref={measuringRef}
        className="absolute -left-9999px top-0 whitespace-pre pointer-events-none"
        aria-hidden="true"
      />

      {/* Command pill overlays */}
      <div className={cn("absolute inset-0 pointer-events-none", className)}>
        {commandMatches.map(({ command }, index) => {
          const position = pillPositions[index]
          if (!position) return null

          return (
            <span
              key={`${command}-${index}`}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 z-10",
                "bg-gradient-to-r from-green-100 to-emerald-100",
                "border border-green-300/50",
                "text-green-700 font-medium",
                "rounded-full px-2 py-0.5 text-sm",
                "shadow-sm",
                "animate-in fade-in duration-200"
              )}
              style={{
                left: `${position.left + 12}px`, // Account for input padding
                minWidth: `${position.width + 4}px` // Ensure pill covers the text
              }}
            >
              {command}
            </span>
          )
        })}
      </div>

      {/* Transparent text overlay to hide original command text */}
      <div className={cn("absolute inset-0 pointer-events-none text-transparent", className)}>
        {inputValue.split('').map((char, index) => {
          const isInsideCommand = commandMatches.some(
            ({ start, end }) => index >= start && index < end
          )

          return (
            <span
              key={index}
              className={isInsideCommand ? 'opacity-0' : 'opacity-100'}
            >
              {char}
            </span>
          )
        })}
      </div>
    </>
  )
}