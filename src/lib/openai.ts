import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

let openai: OpenAI | undefined;
try {
    if (apiKey) {
        openai = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true // Required for client-side usage in Vite
        });
    }
} catch (error) {
    console.error("Error initializing OpenAI client:", error);
}

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export async function getPurchaseObjectionResponse(
    product: string,
    objection: string,
    context_text: string,
    context: ChatMessage[] = []
): Promise<string> {
    if (!openai) throw new Error("OpenAI API Key not configured");

    const systemPrompt = `You are a professional Objection Coach and Sales Strategy Advisor.
Your goal is to guide the user (an admin) on how to handle specific sales barriers for their product/service.

Project Details:
Product/Service: ${product}
Objection to overcome: ${objection}
Knowledge Base: ${context_text || 'No specific document provided'}

Strategy Guidelines:
1. Analyze the objection and provide a professional, persuasive strategy.
2. Suggest at least 2 specific rebuttals or responses.
3. Provide a market comparison perspective (e.g., "Compared to industry benchmarks, your value here is...") or mention how other websites might handle this.
4. Keep the tone professional, encouraging, and authoritative.
5. If the user asks for a comparison, suggest key competitors or websites they should check to validate their market position.

Respond directly and helpfuly.
IMPORTANT: Keep your response concise and try not to exceed 200 words. Use clear, professional formatting.`;

    const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...context
    ];

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Use mini for cost effectiveness and speed
        messages: messages,
    });

    return completion.choices[0].message.content || 'I could not generate a response. Please try again.';
}

export async function getSellObjectionResponse(
    product: string,
    objection: string,
    context_text: string,
    context: ChatMessage[] = []
): Promise<string> {
    if (!openai) throw new Error("OpenAI API Key not configured");

    const systemPrompt = `You are a professional Negotiation Strategy Advisor.
The user is facing a negotiation challenge (inbound or buy-side).

Project Details:
Context: ${product}
Negotiation Point: ${objection}
Supporting Docs: ${context_text || 'None'}

Goal:
Suggest 3 high-impact qualifying questions or strategic responses to navigate this negotiation.
Include a comparative insight (e.g., "Other market leaders typically...") or suggest a website link for price/market validation.
Format clearly with numbered points.
IMPORTANT: Keep your response concise and try not to exceed 200 words. Use clear, professional formatting.`;

    const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...context
    ];

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
    });

    return completion.choices[0].message.content || 'I could not generate a response. Please try again.';
}

export async function getSimulationResponse(
    product: string,
    objection: string,
    context_text: string,
    type: 'purchase' | 'sell',
    chatContext: ChatMessage[] = []
): Promise<string> {
    if (!openai) throw new Error("OpenAI API Key not configured");

    const persona = type === 'purchase' ? 'Prospect (Buyer)' : 'Vendor (Seller)';
    const scenario = type === 'purchase'
        ? `I am a difficult Prospect who is considering your product "${product}" but has the following objection: "${objection}". I will push back, ask hard questions, and evaluate your responses as if I am actually buying.`
        : `I am a Vendor/Supplier selling you "${product}". You are trying to negotiate "${objection}". I will stand firm on my value, offer counter-proposals, and act professionally but strictly as a seller.`;

    const systemPrompt = `SCENARIO SIMULATION MODE:
You are acting as a: ${persona}
Context: ${product}
Project/Objection: ${objection}
Knowledge Base: ${context_text || 'No specific document provided'}

TASK:
${scenario}

GUIDELINES:
1. Stay IN CHARACTER at all times. Do not break persona.
2. If the user makes a good point, acknowledge it but don't give in too easily.
3. Be realistic. If the product info suggests a flaw, use it.
4. Keep responses punchy and conversational.
5. IMPORTANT: Keep your response concise (under 150 words).`;

    const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...chatContext
    ];

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
    });

    return completion.choices[0].message.content || 'Simulation error.';
}
