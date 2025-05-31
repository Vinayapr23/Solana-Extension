import { PublicKey } from '@solana/web3.js';

export interface AccountInfo {
  lamports: number;
  owner: PublicKey;
  data: Buffer;
  executable: boolean;
}

export interface TransactionInfo {
  signature: string;
  slot: number;
  blockTime: number | null;
  instructions: {
    programId: string;
    instruction?: string;
    data: any;
    accounts: { pubkey: string; isSigner: boolean; isWritable: boolean }[];
  }[];
  meta: any;
}
