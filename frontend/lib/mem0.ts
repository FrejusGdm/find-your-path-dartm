import { MemoryClient } from 'mem0ai'

// Initialize Mem0 client with timeout configuration
const mem0 = new MemoryClient({
  apiKey: process.env.MEM0_API_KEY!,
})

// Timeout wrapper for API calls
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('API call timeout')), timeoutMs)
    )
  ])
}

export interface MemoryEntry {
  content: string
  category: 'profile' | 'interests' | 'goals' | 'preferences' | 'interactions' | 'progress'
  userId: string
  metadata?: Record<string, any>
}

export interface MemorySearchOptions {
  userId: string
  query?: string
  category?: string
  limit?: number
}

export class PersonalizedMemoryManager {
  // Add memory entry
  async addMemory(entry: MemoryEntry): Promise<any> {
    try {
      const messages = [{ role: 'user' as const, content: entry.content }]
      const result = await withTimeout(
        mem0.add(messages, {
          user_id: entry.userId,
          metadata: {
            category: entry.category,
            timestamp: Date.now(),
            ...entry.metadata
          }
        }),
        3000 // 3 second timeout
      )

      return result
    } catch (error) {
      console.error('Error adding memory:', error)
      // Don't throw - memory operations shouldn't break main flow
      return null
    }
  }

  // Get user memories
  async getUserMemories(userId: string): Promise<any[]> {
    try {
      const memories = await withTimeout(mem0.getAll({ user_id: userId }), 3000)
      return Array.isArray(memories) ? memories : []
    } catch (error) {
      console.error('Error getting user memories:', error)
      return []
    }
  }

  // Search memories
  async searchMemories(options: MemorySearchOptions): Promise<any[]> {
    try {
      if (options.query) {
        const results = await withTimeout(
          mem0.search(options.query, {
            user_id: options.userId,
            limit: options.limit || 10
          }),
          3000
        )
        return Array.isArray(results) ? results : []
      } else {
        // Get all memories for user if no query
        return await this.getUserMemories(options.userId)
      }
    } catch (error) {
      console.error('Error searching memories:', error)
      return []
    }
  }

  // Update memory
  async updateMemory(memoryId: string, content: string): Promise<any> {
    try {
      const result = await withTimeout(
        mem0.update(memoryId, { text: content }),
        3000
      )
      return result
    } catch (error) {
      console.error('Error updating memory:', error)
      // Don't throw - memory operations shouldn't break main flow
      return null
    }
  }

  // Delete memory
  async deleteMemory(memoryId: string): Promise<boolean> {
    try {
      await withTimeout(mem0.delete(memoryId), 3000)
      return true
    } catch (error) {
      console.error('Error deleting memory:', error)
      return false
    }
  }

  // Build personalized context for AI
  async buildPersonalizedContext(userId: string): Promise<{
    profile: any[]
    recentInterests: any[]
    goals: any[]
    preferences: any[]
    recentInteractions: any[]
  }> {
    try {
      const memories = await this.getUserMemories(userId)
      
      return {
        profile: memories.filter(m => m.metadata?.category === 'profile'),
        recentInterests: memories
          .filter(m => m.metadata?.category === 'interests')
          .slice(0, 5), // Most recent 5
        goals: memories.filter(m => m.metadata?.category === 'goals'),
        preferences: memories.filter(m => m.metadata?.category === 'preferences'),
        recentInteractions: memories
          .filter(m => m.metadata?.category === 'interactions')
          .slice(0, 3) // Most recent 3 interactions
      }
    } catch (error) {
      console.error('Error building personalized context:', error)
      return {
        profile: [],
        recentInterests: [],
        goals: [],
        preferences: [],
        recentInteractions: []
      }
    }
  }

  // Extract insights from conversation
  async extractConversationInsights(
    userId: string,
    userMessage: string
  ): Promise<void> {
    try {
      // Profile information extraction
      const profilePatterns = [
        { pattern: /(first.year|sophomore|junior|senior|grad)/i, category: 'profile' as const },
        { pattern: /(major|studying|interested in) ([^.!?]+)/i, category: 'interests' as const },
        { pattern: /(international|first.gen|first generation)/i, category: 'profile' as const }
      ]

      for (const { pattern, category } of profilePatterns) {
        const match = userMessage.match(pattern)
        if (match) {
          await this.addMemory({
            content: match[0],
            category,
            userId,
            metadata: {
              source: 'conversation_extraction',
              confidence: 0.8
            }
          })
        }
      }

      // Goal extraction
      const goalPatterns = [
        /i want to|i hope to|i plan to|my goal is|looking for/i
      ]

      for (const pattern of goalPatterns) {
        if (pattern.test(userMessage)) {
          await this.addMemory({
            content: userMessage,
            category: 'goals',
            userId,
            metadata: {
              source: 'conversation_extraction',
              confidence: 0.7
            }
          })
          break // Only add once per message
        }
      }

      // Interaction preferences
      if (userMessage.includes('thank') || userMessage.includes('helpful')) {
        await this.addMemory({
          content: 'User appreciates helpful responses',
          category: 'preferences',
          userId,
          metadata: {
            source: 'interaction_analysis',
            confidence: 0.6
          }
        })
      }

      // Humor detection
      if (userMessage.includes('lol') || userMessage.includes('haha') || /😄|😂|😊/.test(userMessage)) {
        await this.addMemory({
          content: 'User appreciates humor and casual tone',
          category: 'preferences',
          userId,
          metadata: {
            source: 'interaction_analysis',
            confidence: 0.7
          }
        })
      }

    } catch (error) {
      console.error('Error extracting conversation insights:', error)
      // Don't throw - memory extraction shouldn't break the main flow
    }
  }

  // Generate personalized greeting
  async generatePersonalizedGreeting(userId: string): Promise<string> {
    try {
      const context = await this.buildPersonalizedContext(userId)
      
      if (context.profile.length === 0) {
        return "Hey! Ready to discover some opportunities at Dartmouth?"
      }

      const profileInfo = context.profile[0]?.content || ''
      const recentInterest = context.recentInterests[0]?.content || ''
      
      if (profileInfo.includes('first-year')) {
        return `Hey! I remember you're a first-year${recentInterest ? ` interested in ${recentInterest}` : ''}. What would you like to explore today?`
      } else if (recentInterest) {
        return `Welcome back! Ready to dive deeper into ${recentInterest}, or explore something new?`
      } else {
        return "Good to see you again! What opportunities should we discover today?"
      }
    } catch (error) {
      console.error('Error generating personalized greeting:', error)
      return "Hey! Ready to find your path at Dartmouth?"
    }
  }
}

// Export singleton instance
export const memoryManager = new PersonalizedMemoryManager()