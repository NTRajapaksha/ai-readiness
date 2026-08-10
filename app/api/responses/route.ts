import { NextRequest, NextResponse } from 'next/server';
import { getResponsesForBusiness, saveResponse } from '@/lib/fileStore';
import { generateSampleResponses } from '@/lib/demoData';
import { AssessmentResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if demo responses injection requested
    if (body.action === 'inject_demo' && body.businessId) {
      const demoData = generateSampleResponses(body.businessId, body.teams);
      demoData.forEach((res) => saveResponse(res));
      return NextResponse.json({
        success: true,
        count: demoData.length,
        responses: demoData,
      });
    }

    if (!body.businessId || !body.team || !Array.isArray(body.answers)) {
      return NextResponse.json({ error: 'Invalid response submission payload' }, { status: 400 });
    }

    const newResponse: AssessmentResponse = {
      id: `resp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      businessId: body.businessId,
      team: body.team,
      createdAt: new Date().toISOString(),
      answers: body.answers,
      qualitativeWish: body.qualitativeWish || undefined,
    };

    saveResponse(newResponse);

    return NextResponse.json(newResponse);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record response' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get('businessId');

  if (!businessId) {
    return NextResponse.json({ error: 'Missing businessId parameter' }, { status: 400 });
  }

  const responses = getResponsesForBusiness(businessId);
  return NextResponse.json(responses, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    },
  });
}
