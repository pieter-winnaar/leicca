/**
 * API Route: Merkle Proof
 *
 * Fetches SPV Merkle proof for a confirmed transaction using WhatsOnChain
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { txid } = await request.json();

    if (!txid || typeof txid !== 'string') {
      return NextResponse.json(
        { error: 'Invalid txid' },
        { status: 400 }
      );
    }

    // DYNAMIC IMPORT for WhatsOnChain ChainTracker
    const { WhatsOnChainChainTracker } = await import('@design-system-demo/blockchain-infrastructure');
    const chainTracker = new WhatsOnChainChainTracker('main');

    // Get Merkle proof (SPV proof that transaction is in a block)
    const proof = await chainTracker.getMerkleProof(txid);

    if (!proof) {
      // Transaction not confirmed yet
      return NextResponse.json({
        error: 'Transaction not confirmed yet or not found'
      }, { status: 404 });
    }

    // Return full Merkle proof data
    return NextResponse.json({
      txid: proof.txid,
      blockHeight: proof.blockHeight,
      merkleRoot: proof.merkleRoot,
      path: proof.path, // Array of { offset, hash }
      index: proof.index
    });

  } catch (error) {
    console.error('Merkle proof API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
