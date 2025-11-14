import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    // Ollama API endpoint (adjust to your local Ollama server)
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
    
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2', // or 'mistral', 'codellama', etc.
        prompt: `${context}\n\nCustomer: ${message}\n\nAssistant:`,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 500,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Ollama API request failed');
    }

    const data = await response.json();
    
    return NextResponse.json({
      response: data.response
    });

  } catch (error) {
    console.error('Ollama chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}