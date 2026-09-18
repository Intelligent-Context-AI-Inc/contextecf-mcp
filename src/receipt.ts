import { createHash } from 'node:crypto';

import type { PublicMcpContextPackage } from './schemas.js';
import { hashCanonicalPackageContent } from './demo-catalog.js';

export function verifyContextPackageReceipt(packageData: PublicMcpContextPackage): void {
  if (packageData.synthetic) {
    const computedSyntheticHash = hashCanonicalPackageContent(packageData);
    if (computedSyntheticHash !== packageData.package_hash) {
      throw new Error('Context package hash verification failed');
    }
    for (const receipt of packageData.receipt_refs) {
      if (!/^[a-f0-9]{64}$/u.test(receipt.receipt_hash)) {
        throw new Error('Receipt hash is not a SHA-256 hex digest');
      }
    }
    return;
  }

  const { package_hash: packageHash, ...withoutHash } = packageData;
  const computedHash = createHash('sha256').update(JSON.stringify(withoutHash)).digest('hex');
  if (computedHash !== packageHash) {
    throw new Error('Context package hash verification failed');
  }

  if (packageData.receipt_refs.length === 0) {
    throw new Error('Context package did not include a receipt reference');
  }

  for (const receipt of packageData.receipt_refs) {
    if (!/^[a-f0-9]{64}$/u.test(receipt.receipt_hash)) {
      throw new Error('Receipt hash is not a SHA-256 hex digest');
    }
    if (!receipt.signature_algorithm || !receipt.signature_value) {
      throw new Error('Receipt signature metadata is required for live responses');
    }
  }
}
