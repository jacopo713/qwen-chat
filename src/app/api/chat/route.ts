import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Support both old format (messages) and new format (message + attachedFiles)
    let messages
    if (body.messages) {
      // Old format: { messages: [...] }
      messages = body.messages
    } else if (body.message) {
      // New format: { message: "...", attachedFiles: [...] }
      messages = [{ role: 'user', content: body.message }]
    } else {
      return NextResponse.json(
        { error: 'Messages or message is required' },
        { status: 400 }
      )
    }
    
    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages must be an array' },
        { status: 400 }
      )
    }

    const apiKey = process.env.QWEN_API_KEY
    const apiUrl = process.env.QWEN_API_URL

    if (!apiKey || !apiUrl) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      )
    }

    // Add file context to the last message if attachedFiles exist
    if (body.attachedFiles && body.attachedFiles.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.role === 'user') {
        const fileContext = body.attachedFiles.map((file: any) => 
          `[File: ${file.name} - ${file.type} - ${(file.size / 1024 / 1024).toFixed(2)}MB]`
        ).join('\n')
        
        lastMessage.content = `${fileContext}\n\n${lastMessage.content}`
      }
    }

    // Call Qwen API with streaming
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-coder-plus',
        messages: messages,
        stream: true,
        max_tokens: 4000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Qwen API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to get response from Qwen API' },
        { status: response.status }
      )
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            
            if (done) {
              controller.close()
              break
            }

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.trim() === '') continue
              if (line.trim() === 'data: [DONE]') {
                controller.close()
                return
              }
              
              if (line.startsWith('data: ')) {
                try {
                  const data = line.slice(6)
                  const parsed = JSON.parse(data)
                  
                  if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                    const content = parsed.choices[0].delta.content
                    if (content) {
                      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`))
                    }
                  }
                } catch (e) {
                  // Skip invalid JSON
                  continue
                }
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
