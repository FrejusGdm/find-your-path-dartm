import { useState, useEffect } from 'react'

interface LoadingMessageOptions {
  userMessage?: string
  isToolCall?: boolean
}

const DEFAULT_MESSAGES = [
  "Thinking about your request...",
  "Processing your question...",
  "Crafting a helpful response..."
]

const SEARCH_MESSAGES = [
  "Looking through our opportunity database...",
  "Finding relevant programs for you...",
  "Searching for matching opportunities...",
  "Checking available positions...",
  "Exploring suitable programs..."
]

const CONTEXTUAL_MESSAGES = {
  research: [
    "Searching for research opportunities...",
    "Finding faculty research positions...",
    "Looking for lab openings..."
  ],
  internship: [
    "Finding internship opportunities...",
    "Searching for summer positions...",
    "Looking for work experience programs..."
  ],
  grant: [
    "Searching for funding opportunities...",
    "Finding available grants...",
    "Looking for financial support options..."
  ],
  program: [
    "Finding relevant programs...",
    "Searching for academic opportunities...",
    "Looking for enrichment programs..."
  ],
  paid: [
    "Searching for paid opportunities...",
    "Finding compensated positions...",
    "Looking for earning opportunities..."
  ],
  'first-year': [
    "Finding first-year friendly opportunities...",
    "Searching for beginner programs...",
    "Looking for introductory experiences..."
  ],
  sophomore: [
    "Finding sophomore-level opportunities...",
    "Searching for intermediate programs...",
    "Looking for second-year options..."
  ],
  international: [
    "Finding international student opportunities...",
    "Searching for visa-friendly programs...",
    "Looking for globally accessible options..."
  ]
}

export function useLoadingMessages({ userMessage = '', isToolCall = false }: LoadingMessageOptions = {}) {
  const [currentMessage, setCurrentMessage] = useState('')
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    let messages = DEFAULT_MESSAGES

    if (isToolCall) {
      // Check for contextual keywords in user message
      const lowerMessage = userMessage.toLowerCase()

      // Check for specific categories
      for (const [key, contextMessages] of Object.entries(CONTEXTUAL_MESSAGES)) {
        if (lowerMessage.includes(key)) {
          messages = contextMessages
          break
        }
      }

      // If no specific context found, use general search messages
      if (messages === DEFAULT_MESSAGES) {
        messages = SEARCH_MESSAGES
      }
    }

    // Rotate through messages
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 2000) // Change message every 2 seconds

    setCurrentMessage(messages[messageIndex])

    return () => clearInterval(interval)
  }, [userMessage, isToolCall, messageIndex])

  useEffect(() => {
    let messages = DEFAULT_MESSAGES

    if (isToolCall) {
      const lowerMessage = userMessage.toLowerCase()

      for (const [key, contextMessages] of Object.entries(CONTEXTUAL_MESSAGES)) {
        if (lowerMessage.includes(key)) {
          messages = contextMessages
          break
        }
      }

      if (messages === DEFAULT_MESSAGES) {
        messages = SEARCH_MESSAGES
      }
    }

    setCurrentMessage(messages[messageIndex])
  }, [userMessage, isToolCall, messageIndex])

  return currentMessage
}