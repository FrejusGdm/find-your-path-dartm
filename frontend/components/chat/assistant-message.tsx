"use client"

import { Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface AssistantMessageProps {
  content: string
}

export function AssistantMessage({ content }: AssistantMessageProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      </div>
      
      <div className="flex-1 max-w-[80%] sm:max-w-[85%]">
        <div className="bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                // Custom components for better styling
                p: ({ children }) => (
                  <p className="text-sm leading-relaxed text-foreground mb-2 last:mb-0">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-muted-foreground">
                    {children}
                  </em>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 text-sm text-foreground my-2">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 text-sm text-foreground my-2">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm text-foreground">
                    {children}
                  </li>
                ),
                code: ({ children, className }) => {
                  const isInline = !className?.includes('language-')
                  if (isInline) {
                    return (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">
                        {children}
                      </code>
                    )
                  }
                  return (
                    <pre className="bg-muted rounded-lg p-3 overflow-x-auto my-2">
                      <code className="text-xs font-mono text-foreground">
                        {children}
                      </code>
                    </pre>
                  )
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-2">
                    {children}
                  </blockquote>
                ),
                a: ({ children, href, ...props }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors duration-200 cursor-pointer"
                    {...props}
                  >
                    {children}
                  </a>
                )
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
        
        {/* Message footer with timestamp */}
        <div className="mt-1 px-1">
          <span className="text-xs text-muted-foreground">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  )
}