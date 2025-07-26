export interface StreamingResponse {
  content: string
  isComplete: boolean
  error?: string
}

export async function* streamChatResponse(messages: any[]): AsyncGenerator<StreamingResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // Keep the last potentially incomplete line in buffer
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            
            if (data === '[DONE]') {
              yield { content: '', isComplete: true }
              return
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                yield { content: parsed.content, isComplete: false }
              }
            } catch (e) {
              // Skip invalid JSON
              continue
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    yield { content: '', isComplete: true }

  } catch (error) {
    console.error('Streaming error:', error)
    yield { 
      content: '', 
      isComplete: true, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
