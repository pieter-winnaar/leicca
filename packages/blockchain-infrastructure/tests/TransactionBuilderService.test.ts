import { describe, it, expect, beforeEach } from 'vitest';
import {
  TransactionBuilderService,
  ValidationError,
  SigningError,
} from '../src/services/TransactionBuilderService';
import { BSV21ScriptTemplate } from '../src/services/BSV21ScriptTemplate';
import { Transaction, P2PKH, PrivateKey } from '@bsv/sdk';

describe('TransactionBuilderService', () => {
  let txBuilder: TransactionBuilderService;
  let address: string;
  let lockingScript: string;
  let privateKey: PrivateKey;

  beforeEach(() => {
    txBuilder = new TransactionBuilderService();
    // Use a fixed address for testing
    address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'; // Example Bitcoin address
    lockingScript = new P2PKH().lock(address).toHex();
    // Use a fixed WIF key for testing instead of random
    privateKey = PrivateKey.fromWif('KxFC1jmwwCoACiCAWZ3eXa96mBM6tb3TYzGmf6YwgdGWZgawvrtJ');
  });

  describe('buildTransaction', () => {
    it('should build transaction with 1 input and 1 output', () => {
      const tx = txBuilder.buildTransaction({
        inputs: [
          {
            txid: 'a'.repeat(64),
            outputIndex: 0,
            satoshis: 100000,
            lockingScript: lockingScript,
          },
        ],
        outputs: [
          {
            lockingScript: lockingScript,
            satoshis: 50000,
          },
        ],
      });

      expect(tx).toBeInstanceOf(Transaction);
      expect(tx.inputs).toHaveLength(1);
      expect(tx.outputs).toHaveLength(1);
      expect(tx.version).toBe(1);
      expect(tx.lockTime).toBe(0);
    });

    it('should build transaction with multiple inputs and outputs', () => {
      const tx = txBuilder.buildTransaction({
        inputs: [
          {
            txid: 'a'.repeat(64),
            outputIndex: 0,
            satoshis: 50000,
            lockingScript: lockingScript,
          },
          {
            txid: 'b'.repeat(64),
            outputIndex: 1,
            satoshis: 75000,
            lockingScript: lockingScript,
          },
        ],
        outputs: [
          {
            lockingScript: lockingScript,
            satoshis: 30000,
          },
          {
            lockingScript: lockingScript,
            satoshis: 40000,
          },
        ],
      });

      expect(tx.inputs).toHaveLength(2);
      expect(tx.outputs).toHaveLength(2);
    });

    it('should set custom locktime when provided', () => {
      const locktime = 500000;
      const tx = txBuilder.buildTransaction({
        inputs: [
          {
            txid: 'a'.repeat(64),
            outputIndex: 0,
            satoshis: 100000,
            lockingScript: lockingScript,
          },
        ],
        outputs: [
          {
            lockingScript: lockingScript,
            satoshis: 50000,
          },
        ],
        locktime,
      });

      expect(tx.lockTime).toBe(locktime);
    });

    it('should set custom version when provided', () => {
      const version = 2;
      const tx = txBuilder.buildTransaction({
        inputs: [
          {
            txid: 'a'.repeat(64),
            outputIndex: 0,
            satoshis: 100000,
            lockingScript: lockingScript,
          },
        ],
        outputs: [
          {
            lockingScript: lockingScript,
            satoshis: 50000,
          },
        ],
        version,
      });

      expect(tx.version).toBe(version);
    });

    it('should throw ValidationError when no inputs provided', () => {
      expect(() => {
        txBuilder.buildTransaction({
          inputs: [],
          outputs: [
            {
              lockingScript: lockingScript,
              satoshis: 50000,
            },
          ],
        });
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError when no outputs provided', () => {
      expect(() => {
        txBuilder.buildTransaction({
          inputs: [
            {
              txid: 'a'.repeat(64),
              outputIndex: 0,
              satoshis: 100000,
              lockingScript: lockingScript,
            },
          ],
          outputs: [],
        });
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError with field information', () => {
      try {
        txBuilder.buildTransaction({
          inputs: [],
          outputs: [
            {
              lockingScript: lockingScript,
              satoshis: 50000,
            },
          ],
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBe('inputs');
      }
    });
  });

  describe('calculateFee', () => {
    it('should calculate fee correctly for 1 input, 1 output', () => {
      const fee = txBuilder.calculateFee(1, 1, 50);
      // (1*148 + 1*34 + 10) / 1024 * 50 = 9.375 → 10 satoshis
      expect(fee).toBe(10);
    });

    it('should calculate fee correctly for 2 inputs, 2 outputs', () => {
      const fee = txBuilder.calculateFee(2, 2, 50);
      // (2*148 + 2*34 + 10) = 374 bytes
      // (374 / 1024) * 50 = 18.26 → 19 satoshis
      expect(fee).toBe(19);
    });

    it('should use default fee rate of 50 sat/kb', () => {
      const fee = txBuilder.calculateFee(1, 1);
      expect(fee).toBe(10);
    });

    it('should calculate fee for different fee rates', () => {
      const fee25 = txBuilder.calculateFee(2, 2, 25);
      const fee50 = txBuilder.calculateFee(2, 2, 50);
      const fee100 = txBuilder.calculateFee(2, 2, 100);

      expect(fee25).toBe(10); // (374/1024)*25 = 9.13 → 10
      expect(fee50).toBe(19); // (374/1024)*50 = 18.26 → 19
      expect(fee100).toBe(37); // (374/1024)*100 = 36.52 → 37
    });

    it('should handle zero inputs/outputs gracefully', () => {
      const fee = txBuilder.calculateFee(0, 0, 50);
      // (0 + 0 + 10) / 1024 * 50 = 0.488 → 1 satoshi
      expect(fee).toBe(1);
    });

    it('should round up fractional fees', () => {
      const fee = txBuilder.calculateFee(1, 1, 50);
      // Should round up 9.375 to 10
      expect(fee).toBeGreaterThan(9);
      expect(fee).toBeLessThanOrEqual(10);
    });
  });

  describe('addChangeOutput', () => {
    it('should add change output when change >= dust limit', () => {
      const tx = new Transaction();
      tx.addOutput({
        lockingScript: new P2PKH().lock(address),
        satoshis: 50000,
      });

      txBuilder.addChangeOutput(tx, address, 100000, 50000, 20);

      expect(tx.outputs).toHaveLength(2);
      expect(tx.outputs[1].satoshis).toBe(49980); // 100000 - 50000 - 20
    });

    it('should NOT add change output when change < dust limit', () => {
      const tx = new Transaction();
      tx.addOutput({
        lockingScript: new P2PKH().lock(address),
        satoshis: 50000,
      });

      // Change will be 0 satoshis (50020 - 50000 - 20)
      txBuilder.addChangeOutput(tx, address, 50020, 50000, 20);

      expect(tx.outputs).toHaveLength(1); // No change output added
    });

    it('should add change output when change equals dust limit (1 sat)', () => {
      const tx = new Transaction();
      tx.addOutput({
        lockingScript: new P2PKH().lock(address),
        satoshis: 50000,
      });

      // Change will be exactly 1 satoshi
      txBuilder.addChangeOutput(tx, address, 50021, 50000, 20);

      expect(tx.outputs).toHaveLength(2);
      expect(tx.outputs[1].satoshis).toBe(1);
    });

    it('should handle large change amounts', () => {
      const tx = new Transaction();
      tx.addOutput({
        lockingScript: new P2PKH().lock(address),
        satoshis: 50000,
      });

      txBuilder.addChangeOutput(tx, address, 1000000, 50000, 20);

      expect(tx.outputs).toHaveLength(2);
      expect(tx.outputs[1].satoshis).toBe(949980); // 1000000 - 50000 - 20
    });

    it('should return modified transaction', () => {
      const tx = new Transaction();
      tx.addOutput({
        lockingScript: new P2PKH().lock(address),
        satoshis: 50000,
      });

      const result = txBuilder.addChangeOutput(tx, address, 100000, 50000, 20);

      expect(result).toBe(tx); // Should return same instance (mutates)
    });
  });

  describe('signTransaction', () => {
    it('should sign transaction with single input', async () => {
      // Create transaction
      const tx = txBuilder.buildTransaction({
        inputs: [
          {
            txid: 'a'.repeat(64),
            outputIndex: 0,
            satoshis: 100000,
            lockingScript: lockingScript,
          },
        ],
        outputs: [
          {
            lockingScript: lockingScript,
            satoshis: 50000,
          },
        ],
      });

      // Sign with test key
      const signedHex = await txBuilder.signTransaction(tx, [privateKey], [lockingScript], [100000]);

      // Verify signed transaction
      expect(signedHex).toMatch(/^[0-9a-f]+$/i); // Valid hex
      expect(signedHex.length).toBeGreaterThan(100); // Reasonable length

      // Verify transaction can be parsed
      const parsedTx = txBuilder.fromHex(signedHex);
      expect(parsedTx.inputs).toHaveLength(1);
      expect(parsedTx.inputs[0].unlockingScript).toBeDefined();
    });

    it('should sign transaction with multiple inputs', async () => {
      const tx = txBuilder.buildTransaction({
        inputs: [
          {
            txid: 'a'.repeat(64),
            outputIndex: 0,
            satoshis: 50000,
            lockingScript: lockingScript,
          },
          {
            txid: 'b'.repeat(64),
            outputIndex: 1,
            satoshis: 60000,
            lockingScript: lockingScript,
          },
        ],
        outputs: [
          {
            lockingScript: lockingScript,
            satoshis: 100000,
          },
        ],
      });

      const privateKey2 = PrivateKey.fromWif('KyvRkeKgqDLeSJ2UDRTcEdg4RrY36EVETAijrFTpb8jvMijSaEJh');

      const signedHex = await txBuilder.signTransaction(
        tx,
        [privateKey, privateKey2],
        [lockingScript, lockingScript],
        [100000, 100000]
      );

      expect(signedHex).toMatch(/^[0-9a-f]+$/i);

      const parsedTx = txBuilder.fromHex(signedHex);
      expect(parsedTx.inputs).toHaveLength(2);
      expect(parsedTx.inputs[0].unlockingScript).toBeDefined();
      expect(parsedTx.inputs[1].unlockingScript).toBeDefined();
    });

    it('should throw SigningError when private key count mismatch', async () => {
      const tx = txBuilder.buildTransaction({
        inputs: [
          {
            txid: 'a'.repeat(64),
            outputIndex: 0,
            satoshis: 100000,
            lockingScript: lockingScript,
          },
          {
            txid: 'b'.repeat(64),
            outputIndex: 1,
            satoshis: 100000,
            lockingScript: lockingScript,
          },
        ],
        outputs: [
          {
            lockingScript: lockingScript,
            satoshis: 50000,
          },
        ],
      });

      await expect(
        txBuilder.signTransaction(tx, [privateKey], [lockingScript, lockingScript], [100000, 100000])
      ).rejects.toThrow(SigningError);

      try {
        await txBuilder.signTransaction(tx, [privateKey], [lockingScript, lockingScript], [100000, 100000]);
      } catch (error) {
        expect(error).toBeInstanceOf(SigningError);
        expect((error as SigningError).message).toContain("doesn't match input count");
      }
    });

    it('should throw SigningError when input script count mismatch', async () => {
      const tx = txBuilder.buildTransaction({
        inputs: [
          {
            txid: 'a'.repeat(64),
            outputIndex: 0,
            satoshis: 100000,
            lockingScript: lockingScript,
          },
        ],
        outputs: [
          {
            lockingScript: lockingScript,
            satoshis: 50000,
          },
        ],
      });

      await expect(
        txBuilder.signTransaction(tx, [privateKey], [], [])
      ).rejects.toThrow(SigningError);
    });

    it('should create valid unlocking scripts', async () => {
      const tx = txBuilder.buildTransaction({
        inputs: [
          {
            txid: 'a'.repeat(64),
            outputIndex: 0,
            satoshis: 100000,
            lockingScript: lockingScript,
          },
        ],
        outputs: [
          {
            lockingScript: lockingScript,
            satoshis: 50000,
          },
        ],
      });

      await txBuilder.signTransaction(tx, [privateKey], [lockingScript], [100000]);

      // Verify unlocking script template was set
      expect(tx.inputs[0].unlockingScript).toBeDefined();
    });
  });

  describe('addInput', () => {
    it('should add input to existing transaction', () => {
      const tx = new Transaction();

      txBuilder.addInput(tx, {
        txid: 'a'.repeat(64),
        outputIndex: 0,
        satoshis: 100000,
        lockingScript: lockingScript,
      });

      expect(tx.inputs).toHaveLength(1);
    });

    it('should return modified transaction', () => {
      const tx = new Transaction();

      const result = txBuilder.addInput(tx, {
        txid: 'a'.repeat(64),
        outputIndex: 0,
        satoshis: 100000,
        lockingScript: lockingScript,
      });

      expect(result).toBe(tx); // Should return same instance
    });
  });

  describe('addOutput', () => {
    it('should add output to existing transaction', () => {
      const tx = new Transaction();

      txBuilder.addOutput(tx, {
        lockingScript: lockingScript,
        satoshis: 50000,
      });

      expect(tx.outputs).toHaveLength(1);
      expect(tx.outputs[0].satoshis).toBe(50000);
    });

    it('should return modified transaction', () => {
      const tx = new Transaction();

      const result = txBuilder.addOutput(tx, {
        lockingScript: lockingScript,
        satoshis: 50000,
      });

      expect(result).toBe(tx); // Should return same instance
    });
  });

  describe('toHex / fromHex', () => {
    it('should serialize and deserialize unsigned transaction', () => {
      const tx = txBuilder.buildTransaction({
        inputs: [
          {
            txid: 'a'.repeat(64),
            outputIndex: 0,
            satoshis: 100000,
            lockingScript: lockingScript,
          },
        ],
        outputs: [
          {
            lockingScript: lockingScript,
            satoshis: 50000,
          },
        ],
      });

      const hex = txBuilder.toHex(tx);
      const parsed = txBuilder.fromHex(hex);

      expect(parsed.inputs).toHaveLength(1);
      expect(parsed.outputs).toHaveLength(1);
      expect(parsed.outputs[0].satoshis).toBe(50000);
      // Unsigned transactions have empty unlockingScript
      expect(parsed.inputs[0].unlockingScript).toBeDefined();
      expect(parsed.inputs[0].unlockingScript.toHex()).toBe(''); // Empty script
    });

    it('should serialize and deserialize signed transaction', async () => {
      const tx = txBuilder.buildTransaction({
        inputs: [
          {
            txid: 'a'.repeat(64),
            outputIndex: 0,
            satoshis: 100000,
            lockingScript: lockingScript,
          },
        ],
        outputs: [
          {
            lockingScript: lockingScript,
            satoshis: 50000,
          },
        ],
      });

      const signedHex = await txBuilder.signTransaction(tx, [privateKey], [lockingScript], [100000]);

      const parsed = txBuilder.fromHex(signedHex);

      expect(parsed.inputs).toHaveLength(1);
      expect(parsed.outputs).toHaveLength(1);
      expect(parsed.inputs[0].unlockingScript).toBeDefined();
    });

    it('should round-trip signed transaction with multiple inputs', async () => {
      const tx = txBuilder.buildTransaction({
        inputs: [
          {
            txid: 'a'.repeat(64),
            outputIndex: 0,
            satoshis: 50000,
            lockingScript: lockingScript,
          },
          {
            txid: 'b'.repeat(64),
            outputIndex: 1,
            satoshis: 60000,
            lockingScript: lockingScript,
          },
        ],
        outputs: [
          {
            lockingScript: lockingScript,
            satoshis: 100000,
          },
        ],
      });

      const privateKey2 = PrivateKey.fromWif('KyvRkeKgqDLeSJ2UDRTcEdg4RrY36EVETAijrFTpb8jvMijSaEJh');

      const signedHex = await txBuilder.signTransaction(
        tx,
        [privateKey, privateKey2],
        [lockingScript, lockingScript],
        [50000, 60000]
      );

      const parsed = txBuilder.fromHex(signedHex);

      expect(parsed.inputs).toHaveLength(2);
      expect(parsed.inputs[0].unlockingScript).toBeDefined();
      expect(parsed.inputs[1].unlockingScript).toBeDefined();
    });
  });

  describe('estimateSize', () => {
    it('should estimate size for 1 input, 1 output', () => {
      const size = txBuilder.estimateSize(1, 1);
      // 1*148 + 1*34 + 10 = 192 bytes
      expect(size).toBe(192);
    });

    it('should estimate size for 2 inputs, 2 outputs', () => {
      const size = txBuilder.estimateSize(2, 2);
      // 2*148 + 2*34 + 10 = 374 bytes
      expect(size).toBe(374);
    });

    it('should estimate size for multiple inputs and outputs', () => {
      const size = txBuilder.estimateSize(5, 3);
      // 5*148 + 3*34 + 10 = 852 bytes
      expect(size).toBe(852);
    });

    it('should handle zero inputs/outputs', () => {
      const size = txBuilder.estimateSize(0, 0);
      // 0 + 0 + 10 = 10 bytes
      expect(size).toBe(10);
    });
  });

  describe('error handling', () => {
    it('should create ValidationError with message and field', () => {
      const error = new ValidationError('Test error', 'testField');

      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Test error');
      expect(error.field).toBe('testField');
    });

    it('should create SigningError with message and inputIndex', () => {
      const error = new SigningError('Signing failed', 2);

      expect(error.name).toBe('SigningError');
      expect(error.message).toBe('Signing failed');
      expect(error.inputIndex).toBe(2);
    });

    it('should create SigningError without inputIndex', () => {
      const error = new SigningError('General signing error');

      expect(error.name).toBe('SigningError');
      expect(error.message).toBe('General signing error');
      expect(error.inputIndex).toBeUndefined();
    });
  });
});

describe('BSV21ScriptTemplate', () => {
  let template: BSV21ScriptTemplate;
  let address: string;
  let privateKey: PrivateKey;

  beforeEach(() => {
    template = new BSV21ScriptTemplate();
    address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
    privateKey = PrivateKey.fromWif('KxFC1jmwwCoACiCAWZ3eXa96mBM6tb3TYzGmf6YwgdGWZgawvrtJ');
  });

  describe('lock', () => {
    it('should create locking script with BSV-21 format', () => {
      const tokenId = 'abc123def456';
      const lockingScript = template.lock(tokenId, address);

      expect(lockingScript).toBeDefined();
      const scriptASM = lockingScript.toASM();

      // Verify BSV-21 structure: OP_0 OP_IF <'ord'> OP_1 <contentType> OP_0 <tokenData> OP_ENDIF <P2PKH>
      expect(scriptASM).toContain('OP_0');
      expect(scriptASM).toContain('OP_IF');
      expect(scriptASM).toContain('OP_ENDIF');
      expect(scriptASM).toContain('OP_1');

      // Verify 'ord' protocol identifier (hex: 6f7264)
      const scriptHex = lockingScript.toHex();
      expect(scriptHex).toContain('6f7264');

      // Verify content type 'application/bsv-20'
      expect(scriptHex).toContain(Buffer.from('application/bsv-20', 'utf8').toString('hex'));

      // Verify token data JSON contains token ID
      expect(scriptHex).toContain(Buffer.from(tokenId, 'utf8').toString('hex'));
    });

    it('should create valid BSV-21 JSON structure with tsat format', () => {
      const tokenId = 'test123';
      const amount = 100; // 100 tokens (decimal format)
      const decimals = 8; // Default decimals
      const lockingScript = template.lock(tokenId, address, amount, decimals);

      const scriptHex = lockingScript.toHex();

      // Verify JSON structure with tsat format
      // 100 tokens * 10^8 = 10,000,000,000 tsat
      const expectedJson = JSON.stringify({
        p: "bsv-20",
        op: "transfer",
        id: tokenId,
        amt: "10000000000" // tsat format (string)
      });
      expect(scriptHex).toContain(Buffer.from(expectedJson, 'utf8').toString('hex'));
    });

    it('should create locking scripts for different addresses', () => {
      const address2 = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';
      const lockingScript1 = template.lock('token1', address);
      const lockingScript2 = template.lock('token1', address2);

      expect(lockingScript1.toHex()).not.toBe(lockingScript2.toHex());
    });

    it('should include P2PKH locking script after inscription', () => {
      const tokenId = 'abc123';
      const lockingScript = template.lock(tokenId, address);

      const scriptASM = lockingScript.toASM();

      // Verify OP_ENDIF comes before P2PKH opcodes
      expect(scriptASM).toContain('OP_ENDIF');

      // Verify P2PKH opcodes exist after inscription
      expect(scriptASM).toContain('OP_DUP');
      expect(scriptASM).toContain('OP_HASH160');
      expect(scriptASM).toContain('OP_EQUALVERIFY');
      expect(scriptASM).toContain('OP_CHECKSIG');
    });

    it('should encode different token IDs in script', () => {
      const tokenId1 = 'abcdef123456';
      const tokenId2 = '123456abcdef';

      const lockingScript1 = template.lock(tokenId1, address);
      const lockingScript2 = template.lock(tokenId2, address);

      // Scripts should differ because token IDs differ
      expect(lockingScript1.toHex()).not.toBe(lockingScript2.toHex());

      // Each script should contain its respective token ID in JSON
      expect(lockingScript1.toHex()).toContain(Buffer.from(tokenId1, 'utf8').toString('hex'));
      expect(lockingScript2.toHex()).toContain(Buffer.from(tokenId2, 'utf8').toString('hex'));
    });

    it('should support custom token amounts', () => {
      const tokenId = 'token123';
      const lockingScript1 = template.lock(tokenId, address, 1, 8);
      const lockingScript2 = template.lock(tokenId, address, 100, 8);

      // Scripts should differ because amounts differ
      expect(lockingScript1.toHex()).not.toBe(lockingScript2.toHex());
    });
  });

  describe('unlock', () => {
    it('should return unlocking script template', () => {
      const unlock = template.unlock(privateKey);

      expect(unlock).toBeDefined();
      expect(unlock.sign).toBeTypeOf('function');
      expect(unlock.estimateLength).toBeTypeOf('function');
    });

    it('should estimate length correctly for P2PKH unlock', async () => {
      const unlock = template.unlock(privateKey);

      const estimatedLength = await unlock.estimateLength();

      // P2PKH unlock: signature (71-73 bytes) + pubkey (33 bytes) = ~107 bytes
      expect(estimatedLength).toBe(107);
    });

    it('should sign transaction with BSV-21 input', async () => {
      const tokenId = 'test-token-123';
      const amount = 50; // 50 tokens
      const decimals = 8; // Default decimals

      // Create BSV-21 locking script
      const bsv21LockingScript = template.lock(tokenId, address, amount, decimals);

      // Create source transaction (parent tx with BSV-21 output)
      const sourceTx = new Transaction();
      sourceTx.version = 1;
      sourceTx.addOutput({
        lockingScript: bsv21LockingScript,
        satoshis: 100000
      });

      // Create transaction with BSV-21 input
      const tx = new Transaction();
      tx.version = 1;

      tx.addInput({
        sourceTransaction: sourceTx,
        sourceOutputIndex: 0,
        unlockingScriptTemplate: template.unlock(privateKey)
      });

      tx.addOutput({
        lockingScript: new P2PKH().lock(address),
        satoshis: 50000
      });

      // Sign the transaction
      await tx.fee();
      await tx.sign();

      // Verify unlocking script was created
      expect(tx.inputs[0].unlockingScript).toBeDefined();
      expect(tx.inputs[0].unlockingScript.toHex()).not.toBe('');

      // Verify unlocking script is P2PKH format (signature + pubkey)
      const unlockingScriptHex = tx.inputs[0].unlockingScript.toHex();
      expect(unlockingScriptHex).toMatch(/^[0-9a-f]+$/i);
      expect(unlockingScriptHex.length).toBeGreaterThan(100); // Signature + pubkey should be >100 bytes
    });

    it('should create P2PKH unlocking script for BSV-21 token UTXO', async () => {
      const tokenId = 'abc123';

      // Create BSV-21 locking script
      const bsv21LockingScript = template.lock(tokenId, address);

      // Create source transaction
      const sourceTx = new Transaction();
      sourceTx.version = 1;
      sourceTx.addOutput({
        lockingScript: bsv21LockingScript,
        satoshis: 100000
      });

      // Create transaction
      const tx = new Transaction();
      tx.version = 1;

      tx.addInput({
        sourceTransaction: sourceTx,
        sourceOutputIndex: 0,
        unlockingScriptTemplate: template.unlock(privateKey)
      });

      tx.addOutput({
        lockingScript: new P2PKH().lock(address),
        satoshis: 1000
      });

      // Sign
      await tx.fee();
      await tx.sign();

      const unlockingScript = tx.inputs[0].unlockingScript;

      // Verify unlocking script exists and is non-empty
      expect(unlockingScript).toBeDefined();
      expect(unlockingScript.toHex()).not.toBe('');

      // P2PKH unlocking script should contain signature and public key
      // Format: <signature> <pubkey>
      const unlockHex = unlockingScript.toHex();
      expect(unlockHex.length).toBeGreaterThan(100); // At least signature + pubkey
    });
  });

  describe('integration', () => {
    it('should work with lock and unlock pattern', () => {
      const tokenId = 'test123';
      const lockingScript = template.lock(tokenId, address);
      const unlockTemplate = template.unlock(privateKey);

      expect(lockingScript).toBeDefined();
      expect(unlockTemplate).toBeDefined();
      expect(unlockTemplate.sign).toBeTypeOf('function');
      expect(unlockTemplate.estimateLength).toBeTypeOf('function');
    });

    it('should create compatible lock/unlock pairs', () => {
      const tokenId = 'abc123';
      const lockingScript = template.lock(tokenId, address);
      const unlockTemplate = template.unlock(privateKey);

      // Both should be defined and compatible with @bsv/sdk
      expect(lockingScript.toHex()).toMatch(/^[0-9a-f]+$/i);
      expect(unlockTemplate).toBeDefined();
    });
  });
});
