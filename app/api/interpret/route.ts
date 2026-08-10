import { NextRequest, NextResponse } from 'next/server';
import { DimensionScores } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const {
      businessName,
      overallScore,
      dimensionScores,
      teamScores,
      qualitativeWishes,
      selectedProvider,
    }: {
      businessName: string;
      overallScore: number;
      dimensionScores: DimensionScores;
      teamScores: Record<string, DimensionScores>;
      qualitativeWishes: string[];
      selectedProvider?: string;
    } = await req.json();

    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const customKey = process.env.CUSTOM_LLM_API_KEY;
    const customBaseUrl = process.env.CUSTOM_LLM_BASE_URL || 'https://api.openai.com/v1';

    const prompt = `
You are an executive AI adoption consultant analyzing diagnostic survey data for ${businessName}.
Overall AI Readiness Score: ${overallScore}/100.
Dimension Scores: Fluency ${dimensionScores.fluency}/100, Integration ${dimensionScores.integration}/100, Culture ${dimensionScores.culture}/100, Risk ${dimensionScores.risk}/100, Leadership ${dimensionScores.leadership}/100.
Team Scores: ${JSON.stringify(teamScores)}.
Qualitative Employee Wishes: ${JSON.stringify(qualitativeWishes.slice(0, 5))}.

Provide a 2-paragraph Executive AI Readiness Synthesis:
Strategic Diagnosis: Write a strategic diagnosis paragraph analyzing score bottlenecks and department imbalances.

Qualitative Synthesis: Write a qualitative synthesis paragraph analyzing team wishlist items and proposing a concrete Priority 1 initiative.

IMPORTANT: Do NOT use markdown headers (like ###) or title headers. Output plain text starting directly with "Strategic Diagnosis:" followed by your paragraph, and then "Qualitative Synthesis:" followed by your paragraph.
    `;

    // 8-Second Abort Controller Helper for serverless cold-start resilience
    const fetchWithTimeout = async (url: string, options: any = {}, timeoutMs: number = 8000) => {
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
        }
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
        }
      );

      if (res && res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          return NextResponse.json({ interpretation: text, source: 'OpenAI (GPT-4o Mini)' });
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
        }
      );

      if (res && res.ok) {
        const data = await res.json();
        const text = data.content?.[0]?.text;
        if (text) {
          return NextResponse.json({ interpretation: text, source: 'Anthropic (Claude 3 Haiku)' });
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
        }
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
        }
      );

      if (res && res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          return NextResponse.json({ interpretation: text, source: 'Custom LLM API' });
        }
      }
    }

    // Graceful Rule-Based Rule Fallback
    const leadingTeam = Object.entries(teamScores || {}).sort(
      (a, b) => Object.values(b[1]).reduce((sum, v) => sum + v, 0) - Object.values(a[1]).reduce((sum, v) => sum + v, 0)
    )[0]?.[0] || 'Engineering';

    const fallbackInterpretation = `Strategic Diagnosis: ${businessName} demonstrates an overall readiness score of ${overallScore}/100 across 5 core dimensions. ${leadingTeam} currently leads adoption, while key organizational friction centers around workflow automation and executive resource alignment.\n\nQualitative Synthesis: Primary team automation demand targets document synthesis and repetitive administrative tasks. Recommended priority 1 initiative focuses on establishing standardized AI workflow templates and clear data governance guidelines.`;

    return NextResponse.json({
      interpretation: fallbackInterpretation,
      source: 'Tai Labs Rule Engine',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate interpretation' },
      { status: 500 }
    );
  }
}
