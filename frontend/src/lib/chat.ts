const API_URL = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export async function sendChatMessage(message: string, context: string = ''): Promise<string> {
    const response = await fetch(`${API_URL}/chat/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, context }),
    });

    if (!response.ok) {
        throw new Error('Failed to get chat response');
    }

    const data = await response.json();
    return data.response;
}
