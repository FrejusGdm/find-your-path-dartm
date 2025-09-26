import { useState, useCallback, useMemo } from 'react'

export interface Command {
  id: string
  name: string
  description: string
  iconName: 'search' | 'help' | 'bookmark'
  handler: (input: string, originalInput: string) => void
}

interface UseCommandSuggestionsProps {
  onSendMessage: (message: { text: string }) => void
  onSetInput: (value: string) => void
  onSetSearching: (searching: boolean) => void
  onSetSearchQuery: (query: string) => void
}

export function useCommandSuggestions({
  onSendMessage,
  onSetInput,
  onSetSearching,
  onSetSearchQuery
}: UseCommandSuggestionsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [commandFilter, setCommandFilter] = useState('')

  // Command registry
  const allCommands: Command[] = useMemo(() => [
    {
      id: 'search',
      name: '/search',
      description: 'Search current Dartmouth information',
      iconName: 'search' as const,
      handler: (input: string, originalInput: string) => {
        const query = originalInput.substring(8).trim() // Remove "/search "
        if (query) {
          onSetSearching(true)
          onSetSearchQuery(query)
          onSendMessage({ text: `I need current information about: ${query}. Please search official Dartmouth sources.` })
        }
      }
    },
    {
      id: 'help',
      name: '/help',
      description: 'Show available commands and tips',
      iconName: 'help' as const,
      handler: () => {
        onSendMessage({
          text: 'Show me all available commands and how to use them effectively.'
        })
      }
    },
    {
      id: 'save',
      name: '/save',
      description: 'Save the last opportunity mentioned',
      iconName: 'bookmark' as const,
      handler: () => {
        onSendMessage({
          text: 'Please help me save the last opportunity we discussed to my bookmarks.'
        })
      }
    }
  ], [onSendMessage, onSetSearching, onSetSearchQuery])

  // Filter commands based on current input
  const filteredCommands = useMemo(() => {
    if (!commandFilter) return allCommands
    return allCommands.filter(cmd =>
      cmd.name.toLowerCase().includes(commandFilter.toLowerCase()) ||
      cmd.description.toLowerCase().includes(commandFilter.toLowerCase())
    )
  }, [allCommands, commandFilter])

  // Handle input changes to detect command mode
  const handleInputChange = useCallback((value: string) => {
    const commandMatch = value.match(/^\/(\w*)$/)

    if (commandMatch) {
      setCommandFilter(commandMatch[1])
      setIsVisible(true)
      setSelectedIndex(0)
    } else {
      setIsVisible(false)
      setCommandFilter('')
    }
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent): boolean => {
    if (!isVisible) return false

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        )
        return true

      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        )
        return true

      case 'Enter':
        if (filteredCommands[selectedIndex]) {
          e.preventDefault()
          selectCommand(selectedIndex)
          return true
        }
        break

      case 'Escape':
        e.preventDefault()
        setIsVisible(false)
        return true

      default:
        return false
    }

    return false
  }, [isVisible, filteredCommands, selectedIndex])

  // Select and execute a command
  const selectCommand = useCallback((index: number) => {
    const command = filteredCommands[index]
    if (!command) return

    // Auto-complete the command in input
    onSetInput(command.name + ' ')
    setIsVisible(false)
    setCommandFilter('')

    // Focus stays on input for user to add parameters
    setTimeout(() => {
      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement
      if (inputElement) {
        inputElement.focus()
        inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length)
      }
    }, 50)
  }, [filteredCommands, onSetInput])

  // Execute command with current input
  const executeCommand = useCallback((input: string) => {
    const commandMatch = input.match(/^\/(\w+)(.*)$/)
    if (!commandMatch) return false

    const commandName = commandMatch[1]
    const command = allCommands.find(cmd => cmd.name === `/${commandName}`)

    if (command) {
      command.handler(commandMatch[2].trim(), input)
      onSetInput('')
      setIsVisible(false)
      return true
    }

    return false
  }, [allCommands, onSetInput])

  return {
    isVisible,
    commands: filteredCommands,
    selectedIndex,
    handleInputChange,
    handleKeyDown,
    selectCommand,
    executeCommand,
    closeCommands: () => setIsVisible(false)
  }
}