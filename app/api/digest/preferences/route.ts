import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const prefs = await db.getUserPreferences(user.id);
    return NextResponse.json({
      ...prefs,
      userEmail: user.email,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const allowed = ['digestEnabled', 'digestFrequency', 'digestEmail', 'digestSendHour', 'digestDayOfWeek'];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const prefs = await db.upsertUserPreferences(user.id, updates);
    return NextResponse.json(prefs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
