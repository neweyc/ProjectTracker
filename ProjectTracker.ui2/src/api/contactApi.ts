export interface ContactInput {
  name: string
  email: string
  category: string
  message: string
}

export async function sendContactMessage(input: ContactInput): Promise<void> {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to send message. Please try again.')
}
