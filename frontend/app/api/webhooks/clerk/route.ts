import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error('Missing CLERK_WEBHOOK_SECRET environment variable')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    )
  }

  // Get the body
  const payload = await req.text()

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return NextResponse.json(
      { error: 'Error verifying webhook' },
      { status: 400 }
    )
  }

  const { type, data } = evt

  // Handle different webhook events
  switch (type) {
    case 'user.created':
      await handleUserCreated(data)
      break
    case 'user.updated':
      await handleUserUpdated(data)
      break
    case 'session.created':
      await handleSessionCreated(data)
      break
    default:
      console.log(`Unhandled webhook event type: ${type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleUserCreated(data: any) {
  const { id, email_addresses, first_name, last_name } = data
  
  // Validate @dartmouth.edu email
  const primaryEmail = email_addresses?.[0]?.email_address
  
  if (!primaryEmail || !primaryEmail.endsWith('@dartmouth.edu')) {
    console.error(`Non-Dartmouth email attempted signup: ${primaryEmail}`)
    
    // Note: In a production app, you might want to:
    // 1. Delete the user account immediately
    // 2. Send them a notification about the email requirement
    // 3. Log this for security monitoring
    
    // For now, we'll just log it - the frontend should prevent this
    return
  }

  console.log(`✅ Dartmouth student created account: ${primaryEmail}`)
  
  // Here you could:
  // 1. Create user profile in your database
  // 2. Send welcome email
  // 3. Set up initial preferences
  // 4. Add to analytics
}

async function handleUserUpdated(data: any) {
  const { id, email_addresses } = data
  
  // Check if email was changed to non-Dartmouth domain
  const primaryEmail = email_addresses?.[0]?.email_address
  
  if (primaryEmail && !primaryEmail.endsWith('@dartmouth.edu')) {
    console.error(`User ${id} changed to non-Dartmouth email: ${primaryEmail}`)
    // Handle this case - maybe suspend account or force re-verification
  }
}

async function handleSessionCreated(data: any) {
  const { user_id } = data
  console.log(`Session created for user: ${user_id}`)
  
  // Track user login analytics, update last seen, etc.
}