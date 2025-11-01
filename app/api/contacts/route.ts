import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const relationshipType = searchParams.get('relationshipType');
    const tag = searchParams.get('tag');
    const company = searchParams.get('company');

    const where: any = {
      userId: user.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (relationshipType) {
      where.relationshipType = relationshipType;
    }

    if (tag) {
      where.tags = { contains: tag, mode: 'insensitive' };
    }

    if (company) {
      where.company = { contains: company, mode: 'insensitive' };
    }

    const contacts = await prisma.contact.findMany({
      where,
      include: {
        entries: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(contacts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      birthday,
      jobTitle,
      company,
      location,
      email,
      phone,
      howWeMet,
      relationshipType,
      notes,
      linkedInUrl,
      twitterUrl,
      personalWebsiteUrl,
      tags,
      reachOutIntervalDays,
      birthdayReminderDays,
      notificationEnabled,
    } = body;

    const contact = await prisma.contact.create({
      data: {
        userId: user.id,
        name,
        birthday,
        jobTitle,
        company,
        location,
        email,
        phone,
        howWeMet,
        relationshipType,
        notes,
        linkedInUrl,
        twitterUrl,
        personalWebsiteUrl,
        tags: tags ? (Array.isArray(tags) ? tags.join(', ') : tags) : '',
        reachOutIntervalDays,
        birthdayReminderDays: birthdayReminderDays ?? 0,
        notificationEnabled: notificationEnabled ?? true,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

