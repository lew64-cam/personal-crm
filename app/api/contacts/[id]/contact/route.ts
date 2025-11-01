import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    const contact = await prisma.contact.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Update lastContacted
    await prisma.contact.update({
      where: { id },
      data: { lastContacted: new Date() },
    });

    // Create entry if content provided
    if (body.content) {
      const entry = await prisma.contactEntry.create({
        data: {
          contactId: id,
          content: body.content,
        },
      });
      return NextResponse.json(entry, { status: 201 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

