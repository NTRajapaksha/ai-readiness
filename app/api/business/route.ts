import { NextRequest, NextResponse } from 'next/server';
import { getBusiness, saveBusiness } from '@/lib/fileStore';
import { TEAMS } from '@/lib/questions';
import { Business } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body.name ? body.name.trim() : 'Organization';
    const teams = Array.isArray(body.teams) && body.teams.length > 0 ? body.teams : Array.from(TEAMS);

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);

    const newBusiness: Business = {
      id,
      name,
      teams,
      createdAt: new Date().toISOString(),
    };

    await saveBusiness(newBusiness);

    return NextResponse.json(newBusiness);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create assessment link' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing business ID' }, { status: 400 });
  }

  const business = await getBusiness(id);
  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  return NextResponse.json(business);
}
