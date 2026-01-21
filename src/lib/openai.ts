import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

let openai: OpenAI | undefined;
try {
    if (apiKey) {
        openai = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true
        });
    }
} catch (error) {
    console.error("Error initializing OpenAI client:", error);
}

export async function extractTextFromPDFWithAI(pdfDoc: any): Promise<string> {
    if (!openai) throw new Error("OpenAI API Key not configured");

    console.log('Using AI Vision to extract text from PDF pages...')
    let fullText = ''

    for (let pageNum = 1; pageNum <= Math.min(pdfDoc.numPages, 10); pageNum++) {
        try {
            const page = await pdfDoc.getPage(pageNum)
            const viewport = page.getViewport({ scale: 2.0 })

            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')
            canvas.height = viewport.height
            canvas.width = viewport.width

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise

            const imageData = canvas.toDataURL('image/png')

            console.log(`Analyzing page ${pageNum} with AI Vision...`)

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Extract all text from this image. Return ONLY the text content, no explanations or formatting. If there's no text, return 'No text found'."
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: imageData
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 1000
            })

            const pageText = response.choices[0].message.content || ''
            if (pageText && !pageText.includes('No text found')) {
                fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`
            }

        } catch (err) {
            console.error(`Error processing page ${pageNum}:`, err)
        }
    }

    return fullText.trim()
}

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export async function getPurchaseObjectionResponse(
    product: string,
    objection: string,
    context_text: string,
    price: string,
    context: ChatMessage[] = []
): Promise<string> {
    if (!openai) throw new Error("OpenAI API Key not configured");

    const systemPrompt = `You are a Sales Coach helping sellers in the MALAYSIA MARKET.

Context (READ CAREFULLY - USE THIS INFO):
- Objection: ${objection}
- Product/Service: ${product || 'Not specified'}
- Price: ${price || 'Not specified'}
- Document Details: ${context_text || 'No document'}

CRITICAL RULES:
1. Base ALL advice on the uploaded document context and product details above
2. Focus on MALAYSIAN market, buyers, culture, and expectations
3. Keep responses SHORT and conversational - use bullet points, NOT paragraphs
4. Reference specific details from the document when giving advice
5. Provide 2-3 actionable rebuttals specific to Malaysia market

Response Format:
- Short intro (1 line)
- 2-3 bullet points with specific tactics
- Quick closing tip

Max 150 words. Be direct, practical, Malaysia-focused.`;

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

export async function getSellObjectionResponse(
    product: string,
    objection: string,
    context_text: string,
    price: string,
    context: ChatMessage[] = []
): Promise<string> {
    if (!openai) throw new Error("OpenAI API Key not configured");

    const systemPrompt = `You are a Negotiation Coach for MALAYSIA MARKET buyers/negotiators.

Context (READ CAREFULLY - USE THIS INFO):
- Negotiation Issue: ${objection}
- Product/Service: ${product || 'Not specified'}
- Budget: ${price || 'Not specified'}
- Document Details: ${context_text || 'No document'}

CRITICAL RULES:
1. Base ALL advice on the uploaded document and context above
2. Focus on MALAYSIAN market, vendors, and negotiation culture
3. Keep responses SHORT - bullet points, NOT paragraphs
4. Give 2-3 powerful questions or tactics based on the document details
5. Reference specific info from the uploaded context

Response Format:
- Quick situation summary (1 line)
- 2-3 bullet points with questions/tactics
- Brief closing insight

Max 150 words. Malaysia-focused, practical, direct.`;

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
    price: string,
    type: 'purchase' | 'sell',
    chatContext: ChatMessage[] = []
): Promise<string> {
    if (!openai) throw new Error("OpenAI API Key not configured");

    const persona = type === 'purchase' ? 'Malaysian Prospect/Buyer' : 'Malaysian Vendor/Seller';
    const scenario = type === 'purchase'
        ? `I'm a skeptical MALAYSIAN BUYER considering your product. My concern: "${objection}". I'll push back with tough questions typical of Malaysian customers.`
        : `I'm a MALAYSIAN VENDOR/SUPPLIER. You're negotiating with me about "${objection}". I'll defend my value and counter-propose like a real Malaysian seller.`;

    const systemPrompt = `ROLE-PLAY: You are a ${persona}

Context (USE THIS INFO IN YOUR RESPONSES):
- Issue: ${objection}
- Product: ${product || 'Not specified'}
- Price: ${price || 'Not specified'}
- Details: ${context_text || 'No document'}

CHARACTER RULES:
1. Act like a MALAYSIAN ${persona} - use local market expectations and culture
2. Reference the uploaded document details and product specs in your objections/responses
3. ${scenario}
4. Stay in character - be realistic, challenging but professional
5. Keep responses SHORT and conversational (3-5 sentences max)
6. If they make good points, acknowledge but don't give in easily

IMPORTANT: Under 100 words. Talk like a real Malaysian in business conversation.`;

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
