import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify contact belongs to user
    const contact = await db.getContact(id, user.id);

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Update lastContacted
    await db.updateContact(id, user.id, { lastContacted: new Date() });

    // Create entry if content provided
    if (body.content) {
      const entry = await db.createContactEntry(id, body.content);
      return NextResponse.json(entry, { status: 201 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

