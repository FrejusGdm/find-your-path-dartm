// Simple test to see what useChat is sending
const testMessage = {
  role: 'user',
  parts: [{ type: 'text', text: 'Hello world' }]
}

console.log('Test message:', JSON.stringify(testMessage, null, 2))