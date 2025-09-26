"use client"

import { useEffect } from 'react'
import { Command } from '@/hooks/use-command-suggestions'
import { cn } from '@/lib/utils'
import { Search, HelpCircle, Bookmark } from 'lucide-react'

interface CommandSuggestionsProps {
  isVisible: boolean
  commands: Command[]
  selectedIndex: number
  onSelect: (index: number) => void
  onClose: () => void
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'search':
      return <Search className="w-4 h-4" />
    case 'help':
      return <HelpCircle className="w-4 h-4" />
    case 'bookmark':
      return <Bookmark className="w-4 h-4" />
    default:
      return <Search className="w-4 h-4" />
  }
}

export function CommandSuggestions({
  isVisible,
  commands,
  selectedIndex,
  onSelect,
  onClose
}: CommandSuggestionsProps) {
  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isVisible) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest('[data-command-dropdown]') && !target.closest('input')) {
        onClose()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isVisible, onClose])

  if (!isVisible || commands.length === 0) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Command dropdown */}
      <div
        data-command-dropdown
        className="absolute bottom-full left-0 right-0 mb-16 z-50 bg-background border border-border rounded-xl shadow-lg animate-in fade-in duration-200"
      >
        <div className="p-2 border-b border-border">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1">
            Available Commands
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto">
          {commands.map((command, index) => (
            <button
              key={command.id}
              onClick={() => onSelect(index)}
              className={cn(
                "w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-muted/50 transition-colors",
                "focus:outline-none focus:bg-muted/50",
                selectedIndex === index && "bg-primary/10 text-primary"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                selectedIndex === index
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              )}>
                {getIcon(command.iconName)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">
                  {command.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {command.description}
                </div>
              </div>

              {selectedIndex === index && (
                <div className="text-xs text-primary font-medium">
                  Press Enter
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer tip */}
        <div className="p-2 border-t border-border bg-muted/30">
          <div className="text-xs text-muted-foreground text-center">
            Use ↑↓ to navigate • Enter to select • Esc to close
          </div>
        </div>
      </div>
    </>
  )
}