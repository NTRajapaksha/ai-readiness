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

    const attemptedProviders: string[] = [];

    // 1. Google Gemini Support (Primary: gemini-flash-latest)
    if ((selectedProvider === 'gemini' || (!selectedProvider && geminiKey)) && geminiKey) {
      attemptedProviders.push('Google Gemini');
      const models = ['gemini-flash-latest', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
      for (const model of models) {
        try {
          const res = await fetchWithTimeout(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
              }),
            }
          );

          if (!res) {
            console.error(`[api/interpret] Gemini model ${model} request timed out or returned no response.`);
            continue;
          }

          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              return NextResponse.json({ interpretation: text, source: 'Google Gemini (Flash)' });
            }
            console.error(`[api/interpret] Gemini model ${model} returned OK status but empty text payload.`);
          } else {
            const errorText = await res.text();
            console.error(`[api/interpret] Gemini model ${model} failed with HTTP ${res.status}: ${errorText}`);
          }
        } catch (e) {
          console.error(`[api/interpret] Gemini model ${model} encountered error:`, e);
        }
      }
    }

    // 2. OpenAI Support
    if ((selectedProvider === 'openai' || (!selectedProvider && openaiKey)) && openaiKey) {
      attemptedProviders.push('OpenAI');
      try {
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

        if (!res) {
          console.error('[api/interpret] OpenAI request timed out or returned no response.');
        } else if (res.ok) {
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            return NextResponse.json({ interpretation: text, source: 'OpenAI (GPT-4o Mini)' });
          }
          console.error('[api/interpret] OpenAI returned OK status but empty text payload.');
        } else {
          const errorText = await res.text();
          console.error(`[api/interpret] OpenAI failed with HTTP ${res.status}: ${errorText}`);
        }
      } catch (e) {
        console.error('[api/interpret] OpenAI encountered error:', e);
      }
    }

    // 3. Anthropic Claude Support
    if ((selectedProvider === 'anthropic' || (!selectedProvider && anthropicKey)) && anthropicKey) {
      attemptedProviders.push('Anthropic Claude');
      try {
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

        if (!res) {
          console.error('[api/interpret] Anthropic request timed out or returned no response.');
        } else if (res.ok) {
          const data = await res.json();
          const text = data.content?.[0]?.text;
          if (text) {
            return NextResponse.json({ interpretation: text, source: 'Anthropic (Claude 3 Haiku)' });
          }
          console.error('[api/interpret] Anthropic returned OK status but empty text payload.');
        } else {
          const errorText = await res.text();
          console.error(`[api/interpret] Anthropic failed with HTTP ${res.status}: ${errorText}`);
        }
      } catch (e) {
        console.error('[api/interpret] Anthropic encountered error:', e);
      }
    }

    // 4. Groq Llama Support
    if ((selectedProvider === 'groq' || (!selectedProvider && groqKey)) && groqKey) {
      attemptedProviders.push('Groq');
      try {
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

        if (!res) {
          console.error('[api/interpret] Groq request timed out or returned no response.');
        } else if (res.ok) {
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            return NextResponse.json({ interpretation: text, source: 'Groq Llama 3.3' });
          }
          console.error('[api/interpret] Groq returned OK status but empty text payload.');
        } else {
          const errorText = await res.text();
          console.error(`[api/interpret] Groq failed with HTTP ${res.status}: ${errorText}`);
        }
      } catch (e) {
        console.error('[api/interpret] Groq encountered error:', e);
      }
    }

    // 5. Custom / Local Ollama / OpenRouter Support
    if (customKey) {
      attemptedProviders.push('Custom LLM');
      try {
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

        if (!res) {
          console.error('[api/interpret] Custom LLM request timed out or returned no response.');
        } else if (res.ok) {
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            return NextResponse.json({ interpretation: text, source: 'Custom LLM API' });
          }
          console.error('[api/interpret] Custom LLM returned OK status but empty text payload.');
        } else {
          const errorText = await res.text();
          console.error(`[api/interpret] Custom LLM failed with HTTP ${res.status}: ${errorText}`);
        }
      } catch (e) {
        console.error('[api/interpret] Custom LLM encountered error:', e);
      }
    }

    // Log fallback summary line
    const summaryMsg = attemptedProviders.length > 0
      ? `Attempted providers: [${attemptedProviders.join(', ')}]. All attempts failed. Falling back to Tai Labs Rule Engine.`
      : `No LLM API keys configured or matching selected provider. Falling back to Tai Labs Rule Engine.`;

    console.error(`[api/interpret] ${summaryMsg}`);

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
