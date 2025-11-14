/**
 * API Route: Current Blockchain Height
 *
 * Returns current BSV blockchain height from WhatsOnChain
 * Called once per page load, not per transaction
 * Uses singleton ChainTracker instance to share rate limiter
 */

import { NextResponse } from 'next/server';
import { getChainTracker } from '@/lib/chain-tracker-singleton';

export async function GET() {
  try {
    const chainTracker = await getChainTracker();

    const height = await chainTracker.currentHeight();

    return NextResponse.json({ height });
  } catch (error) {
    console.error('Current height API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
