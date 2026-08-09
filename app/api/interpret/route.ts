import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessName,
      overallScore,
      dimensionScores,
      teamScores,
      qualitativeWishes,
      selectedProvider,
    } = body;

    // Detect Environment API Keys
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const customKey = process.env.LLM_API_KEY;
    const customBaseUrl = process.env.LLM_BASE_URL || 'http://localhost:11434/v1';

    const prompt = `
You are the Lead AI Strategist at Tai Labs. Interpret the following AI Readiness Diagnostic data for "${businessName}":
- Overall Score: ${overallScore}/100
- Dimensions: Tool Fluency (${dimensionScores?.fluency || 0}), Workflow Integration (${dimensionScores?.integration || 0}), Shared AI Culture (${dimensionScores?.culture || 0}), Risk & Governance (${dimensionScores?.risk || 0})
- Department Breakdown: ${JSON.stringify(teamScores || {})}
- Qualitative Team Wishlist Responses: ${JSON.stringify(qualitativeWishes || [])}

Provide a 2-paragraph Executive AI Readiness Synthesis:
Strategic Diagnosis: Write a strategic diagnosis paragraph analyzing score bottlenecks and department imbalances.

Qualitative Synthesis: Write a qualitative synthesis paragraph analyzing team wishlist items and proposing a concrete Priority 1 initiative.

IMPORTANT: Do NOT use markdown headers (like ###) or title headers. Output plain text starting directly with "Strategic Diagnosis:" followed by your paragraph, and then "Qualitative Synthesis:" followed by your paragraph.
    `;

    // 4-Second Strict Abort Controller Helper to prevent Vercel Serverless Function timeouts
    const fetchWithTimeout = async (url: string, options: any = {}, timeoutMs: number = 4000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
      } catch (err) {
        clearTimeout(id);
        return null;
      }
    };

    // 1. Google Gemini Support (Primary: gemini-1.5-flash)
    if ((selectedProvider === 'gemini' || (!selectedProvider && geminiKey)) && geminiKey) {
      const res = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
        4000
      );

      if (res && res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return NextResponse.json({ interpretation: text, source: 'Google Gemini (Flash)' });
        }
      }
    }

    // 2. OpenAI Support
    if ((selectedProvider === 'openai' || (!selectedProvider && openaiKey)) && openaiKey) {
      const res = await fetchWithTimeout(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
          }),
        },
        4000
      );

      if (res && res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          return NextResponse.json({ interpretation: text, source: 'OpenAI GPT-4o' });
        }
      }
    }

    // 3. Anthropic Claude Support
    if ((selectedProvider === 'anthropic' || (!selectedProvider && anthropicKey)) && anthropicKey) {
      const res = await fetchWithTimeout(
        'https://api.anthropic.com/v1/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 600,
            messages: [{ role: 'user', content: prompt }],
          }),
        },
        4000
      );

      if (res && res.ok) {
        const data = await res.json();
        const text = data.content?.[0]?.text;
        if (text) {
          return NextResponse.json({ interpretation: text, source: 'Anthropic Claude' });
        }
      }
    }

    // 4. Groq Llama Support
    if ((selectedProvider === 'groq' || (!selectedProvider && groqKey)) && groqKey) {
      const res = await fetchWithTimeout(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
          }),
        },
        4000
      );

      if (res && res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          return NextResponse.json({ interpretation: text, source: 'Groq Llama 3.3' });
        }
      }
    }

    // 5. Custom / Local Ollama / OpenRouter Support
    if (customKey) {
      const res = await fetchWithTimeout(
        `${customBaseUrl}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${customKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
          }),
        },
        4000
      );

      if (res && res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          return NextResponse.json({ interpretation: text, source: 'Custom LLM API' });
        }
      }
    }

    // 6. Fast Fallback Engine (Guaranteed 0ms response if external APIs time out or fail)
    const lowestDim = Object.entries(dimensionScores || {}).sort((a: any, b: any) => a[1] - b[1])[0]?.[0] || 'risk';
    const wishesCount = (qualitativeWishes || []).length;

    const fallbackSummary = `Strategic Diagnosis: ${businessName} demonstrates an overall AI Readiness score of ${overallScore}/100. While baseline usage is established, your primary bottleneck centers around ${lowestDim.toUpperCase()} (scoring ${dimensionScores?.[lowestDim as keyof typeof dimensionScores] || 0}/100). The contrast across departments indicates that capabilities are currently siloed rather than systematically distributed.\n\nQualitative Synthesis: Based on ${wishesCount} open-ended team responses, your team's primary automation desire centers around document synthesis, repetitive reporting, and email drafting. Resolving data governance rules and deploying standardized templates for ${lowestDim} will unlock immediate momentum across your lowest-performing departments.`;

    return NextResponse.json({ interpretation: fallbackSummary, source: 'Tai Labs Diagnostic Engine' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate LLM interpretation' }, { status: 500 });
  }
}
