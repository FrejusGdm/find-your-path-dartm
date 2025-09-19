export enum MessageType {
  SIMPLE_GREETING = 'simple_greeting',
  ACKNOWLEDGMENT = 'acknowledgment',
  PROFILE_SHARING = 'profile_sharing',
  GOAL_SETTING = 'goal_setting',
  OPPORTUNITY_REQUEST = 'opportunity_request',
  SUBSTANTIVE_QUESTION = 'substantive_question',
  FOLLOW_UP = 'follow_up'
}

export interface MessageClassification {
  type: MessageType
  confidence: number
  shouldProcessMemory: boolean
  reasoning: string
}

/**
 * Classifies a user message to determine if it should trigger memory processing
 */
export function classifyMessage(message: string): MessageClassification {
  const trimmed = message.trim().toLowerCase()

  // Simple greetings and acknowledgments (no memory processing needed)
  const simpleGreetings = ['hi', 'hello', 'hey', 'yo', 'sup', 'what\'s up', 'whats up']
  const acknowledgments = ['ok', 'okay', 'thanks', 'thank you', 'got it', 'cool', 'nice', 'great', 'awesome', 'alright']

  if (simpleGreetings.some(greeting => trimmed === greeting || trimmed.startsWith(greeting + ' '))) {
    return {
      type: MessageType.SIMPLE_GREETING,
      confidence: 0.95,
      shouldProcessMemory: false,
      reasoning: 'Simple greeting detected - no personal information to extract'
    }
  }

  if (acknowledgments.some(ack => trimmed === ack || trimmed.endsWith(' ' + ack))) {
    return {
      type: MessageType.ACKNOWLEDGMENT,
      confidence: 0.9,
      shouldProcessMemory: false,
      reasoning: 'Simple acknowledgment - no new information to process'
    }
  }

  // Profile sharing indicators (high priority for memory processing)
  const profileKeywords = [
    'i am', 'i\'m', 'my major', 'my year', 'first year', 'sophomore', 'junior', 'senior',
    'international student', 'from', 'studying', 'majoring in', 'interested in'
  ]

  if (profileKeywords.some(keyword => trimmed.includes(keyword))) {
    return {
      type: MessageType.PROFILE_SHARING,
      confidence: 0.85,
      shouldProcessMemory: true,
      reasoning: 'Contains profile information that should be remembered'
    }
  }

  // Goal setting indicators
  const goalKeywords = [
    'want to', 'hoping to', 'goal', 'plan to', 'looking for', 'trying to',
    'interested in finding', 'need help with', 'career', 'future'
  ]

  if (goalKeywords.some(keyword => trimmed.includes(keyword))) {
    return {
      type: MessageType.GOAL_SETTING,
      confidence: 0.8,
      shouldProcessMemory: true,
      reasoning: 'Contains goal or aspiration information'
    }
  }

  // Opportunity requests (medium priority - might contain preferences)
  const opportunityKeywords = [
    'research', 'internship', 'job', 'position', 'program', 'grant', 'funding',
    'opportunity', 'application', 'deadline', 'requirement'
  ]

  if (opportunityKeywords.some(keyword => trimmed.includes(keyword))) {
    return {
      type: MessageType.OPPORTUNITY_REQUEST,
      confidence: 0.75,
      shouldProcessMemory: true,
      reasoning: 'Opportunity request may contain preferences or context to remember'
    }
  }

  // Check message length and complexity for substantive content
  const words = trimmed.split(/\s+/).length
  const hasComplexSentence = trimmed.includes('because') || trimmed.includes('however') ||
                              trimmed.includes('although') || trimmed.includes('specifically')

  if (words >= 10 || hasComplexSentence) {
    return {
      type: MessageType.SUBSTANTIVE_QUESTION,
      confidence: 0.7,
      shouldProcessMemory: true,
      reasoning: 'Longer or complex message likely contains contextual information'
    }
  }

  // Default for short, unclear messages
  if (words <= 3) {
    return {
      type: MessageType.ACKNOWLEDGMENT,
      confidence: 0.6,
      shouldProcessMemory: false,
      reasoning: 'Very short message unlikely to contain meaningful context'
    }
  }

  // Medium-length follow-up questions
  return {
    type: MessageType.FOLLOW_UP,
    confidence: 0.65,
    shouldProcessMemory: true,
    reasoning: 'Medium-length message may contain context worth preserving'
  }
}

/**
 * Determines if memory processing should be skipped based on classification
 */
export function shouldSkipMemoryProcessing(classification: MessageClassification): boolean {
  return !classification.shouldProcessMemory || classification.confidence < 0.6
}