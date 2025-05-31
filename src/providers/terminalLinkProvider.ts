import * as vscode from 'vscode';
import { getTransaction } from '../solana/decoder';
import { BASE58_REGEX } from '../utils/regex';

/**
 * Custom TerminalLink subclass to store the transaction signature.
 */
class SolanaTerminalLink extends vscode.TerminalLink {
  constructor(
    public readonly signature: string,
    startIndex: number,
    length: number,
    tooltip?: string
  ) {
    super(startIndex, length, tooltip);
  }
}

/**
 * Provides clickable Solana transaction links in the terminal.
 */
export class TerminalLinkProvider implements vscode.TerminalLinkProvider<SolanaTerminalLink> {
  provideTerminalLinks(context: vscode.TerminalLinkContext): vscode.ProviderResult<SolanaTerminalLink[]> {
    const links: SolanaTerminalLink[] = [];
    const matches = context.line.matchAll(BASE58_REGEX);
    for (const match of matches) {
      const signature = match[0];
     if (signature.length >= 86 && signature.length <= 88) {
  links.push(new SolanaTerminalLink(signature, match.index!, signature.length, 'View Solana Transaction'));
}
    }
    return links;
  }

  async handleTerminalLink(link: SolanaTerminalLink): Promise<void> {
    const signature = link.signature;
    try {
      const tx = await getTransaction(signature);
      if (!tx) {
        vscode.window.showErrorMessage(`Transaction ${signature} not found.`);
        return;
      }

      const content = JSON.stringify(tx, null, 2);
      const doc = await vscode.workspace.openTextDocument({ content, language: 'json' });
      await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      vscode.window.showErrorMessage(`Failed to fetch transaction ${signature}: ${errorMessage}`);
    }
  }
}
