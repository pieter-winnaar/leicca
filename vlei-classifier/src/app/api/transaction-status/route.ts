/**
 * API Route: Transaction Status
 *
 * Fetches live confirmation status using WhatsOnChain SPV proofs
 * CRITICAL: Uses WhatsOnChain directly - no BlockchainServices initialization needed
 * Uses singleton ChainTracker instance to share rate limiter across requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { getChainTracker } from '@/lib/chain-tracker-singleton';

export async function POST(request: NextRequest) {
  try {
    const { txid } = await request.json();

    if (!txid || typeof txid !== 'string') {
      return NextResponse.json(
        { error: 'Invalid txid' },
        { status: 400 }
      );
    }

    // Get singleton ChainTracker (shares rate limiter)
    const chainTracker = await getChainTracker();

    // Get Merkle proof (SPV proof that transaction is in a block)
    const proof = await chainTracker.getMerkleProof(txid);

    if (!proof) {
      // Transaction not confirmed yet
      return NextResponse.json({
        confirmed: false,
        confirmations: 0
      });
    }

    // Get current height to calculate confirmations
    const currentHeight = await chainTracker.currentHeight();
    const confirmations = currentHeight - proof.blockHeight + 1;

    return NextResponse.json({
      confirmed: confirmations >= 6,
      confirmations: Math.max(0, confirmations),
      blockHeight: proof.blockHeight
    });

  } catch (error) {
    console.error('Transaction status API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
