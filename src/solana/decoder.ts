import { Idl, BorshCoder } from '@coral-xyz/anchor';
import { sha256 } from 'js-sha256';
import { AccountInfo } from '@solana/web3.js';

function instructionDiscriminator(name: string): number[] {
  return Array.from(Buffer.from(sha256.digest(`global:${name}`)).slice(0, 8));
}

import { PublicKey, ParsedAccountData, ConfirmedTransactionMeta } from '@solana/web3.js';
import { getIdl } from './idlLoader';
import { getConnection } from './connection';




export async function decodeAccount(pubkey: string, accountInfo: any): Promise<any | null> {
  try {
    const programId = accountInfo.owner.toBase58();
    const idl: Idl | undefined = await getIdl(programId);
    if (!idl) {
      return null;
    }

    const coder = new BorshCoder(idl);
    const discriminator = Buffer.from(accountInfo.data?.slice(0, 8));
    const matchedAccountDef = idl.accounts?.find(acc =>
      discriminator.equals(
        Buffer.from(
          // account discriminator: 8 bytes of sha256("account:<name>")
          Buffer.from(sha256.digest(`account:${acc.name}`)).slice(0, 8)
        )
      )
    );

    if (!matchedAccountDef) return null;

    const decodedData = coder.accounts.decode(matchedAccountDef.name, accountInfo.data);
    return {
      accountType: matchedAccountDef.name,
      data: decodedData,
    };
  } catch (error) {
    console.error(`Failed to decode account ${pubkey}:`, error);
    return null;
  }
}

/**
 * Decodes all instructions in a transaction using available IDLs.
 */
export async function getTransaction(signature: string): Promise<{
  signature: string;
  slot: number;
  blockTime: number | null;
  instructions: any[];
  meta: ConfirmedTransactionMeta | null;
} | null> {
  const conn = getConnection();
  try {
    const tx = await conn.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    });

    if (!tx) return null;

    const { transaction, meta, slot, blockTime } = tx;
    const decodedInstructions: any[] = [];

    const compiledInstructions = transaction.message.compiledInstructions;
    for (const ix of compiledInstructions) {
      const programId = transaction.message.staticAccountKeys[ix.programIdIndex].toBase58();
      const idl: Idl | undefined = await getIdl(programId);

      if (idl) {
        try {
          const coder = new BorshCoder(idl);
          const discriminator = Buffer.from(ix.data).slice(0, 8);
          const instructionDef = idl.instructions?.find(instr =>
            discriminator.equals(Buffer.from(instructionDiscriminator(instr.name)))
          );

          if (instructionDef) {
            const decoded = coder.instruction.decode(
              typeof ix.data === 'string' ? Buffer.from(ix.data, 'base64') : Buffer.from(ix.data)
            );
            decodedInstructions.push({
              programId,
              instruction: instructionDef.name,
              data: decoded,
              accounts: ix.accountKeyIndexes.map((accountIdx, idx) => {
                const pubkey = transaction.message.staticAccountKeys[accountIdx];
                return {
                  pubkey: pubkey.toBase58(),
                  isSigner: false,
                  isWritable: false,
                };
              }),
            });
            continue;
          }
        } catch (e) {
          console.warn(`Could not decode instruction for ${programId}`, e);
        }
      }

      decodedInstructions.push({
        programId,
        data: Buffer.from(ix.data).toString('base64'),
        accounts: ix.accountKeyIndexes.map(accountIdx =>
          transaction.message.staticAccountKeys[accountIdx].toBase58()
        ),
      });

      decodedInstructions.push({
        programId,
        data: Buffer.from(ix.data).toString('base64'),
        accounts: ix.accountKeyIndexes.map((accountIdx, idx) => {
                const pubkey = transaction.message.staticAccountKeys[accountIdx];
                return {
                  pubkey: pubkey.toBase58(),
                  isSigner: false,
                  isWritable: false,
                };
              }),
      });
    }

    return {
      signature,
      slot,
      blockTime: blockTime ?? null,
      instructions: decodedInstructions,
      meta: meta ?? null,
    };
  } catch (error: any) {
    console.error(`Error decoding transaction ${signature}:`, error);
    return null;
  }
}
