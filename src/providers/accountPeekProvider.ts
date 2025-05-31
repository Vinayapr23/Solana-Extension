import * as vscode from 'vscode';
import { decodeAccount } from '../solana/decoder';
import { getAccountInfo } from '../solana/connection';
import { PublicKey } from '@solana/web3.js';

export class AccountPeekProvider implements vscode.TextDocumentContentProvider {
  async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
    const pubkey = uri.path;
    try {
      new PublicKey(pubkey);
      const accountInfo = await getAccountInfo(pubkey);
      if (!accountInfo) {
        return JSON.stringify({ error: `Account ${pubkey} not found.` }, null, 2);
      }
      const decoded = await decodeAccount(pubkey, accountInfo);

      return JSON.stringify(
        {
          pubkey,
          lamports: accountInfo.lamports,
          owner: accountInfo.owner.toBase58(),
          executable: accountInfo.executable,
          data: decoded || accountInfo.data.toString('base64'),
        },
        null,
        2
      );
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return JSON.stringify({ error: `Failed to fetch account ${pubkey}: ${errorMessage}` }, null, 2);
    }
  }
}
