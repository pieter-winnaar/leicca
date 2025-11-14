/**
 * Shared ChainTracker singleton
 *
 * CRITICAL: Only ONE instance across entire app to share rate limiter
 */

let chainTrackerInstance: any = null;

export async function getChainTracker() {
  if (!chainTrackerInstance) {
    const { WhatsOnChainChainTracker } = await import('@design-system-demo/blockchain-infrastructure');
    chainTrackerInstance = new WhatsOnChainChainTracker('main');
  }
  return chainTrackerInstance;
}
