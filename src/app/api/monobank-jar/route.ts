import { NextResponse } from 'next/server';

import { env } from '@/shared/config/env';

// Відповідь monobank кешується на сервері, щоб не впиратися в їхній rate limit.
export const revalidate = 300;

type MonobankJarResponse = {
  amount: number;
  goal: number;
  title: string;
  closed: boolean;
};

export async function GET() {
  if (!env.isMonobankJarEnabled) {
    return NextResponse.json({ error: 'Jar is not configured' }, { status: 404 });
  }

  try {
    const res = await fetch(`https://api.monobank.ua/bank/jar/${env.monobankJar.id}`, {
      next: { revalidate },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch jar' }, { status: 502 });
    }

    const data = (await res.json()) as MonobankJarResponse;

    // monobank віддає суми в копійках.
    return NextResponse.json({
      amount: data.amount / 100,
      goal: data.goal / 100,
      title: data.title,
      closed: data.closed,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch jar' }, { status: 502 });
  }
}
