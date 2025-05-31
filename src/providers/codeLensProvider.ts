import * as vscode from 'vscode';
import { BASE58_REGEX } from '../utils/regex';

export class CodeLensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(document: vscode.TextDocument): vscode.ProviderResult<vscode.CodeLens[]> {
    const lenses: vscode.CodeLens[] = [];
    const text = document.getText();
    const matches = text.matchAll(BASE58_REGEX);

    for (const match of matches) {
      const value = match[0];
      const range = new vscode.Range(
        document.positionAt(match.index!),
        document.positionAt(match.index! + value.length)
      );

      if (value.length >= 32 && value.length <= 44) {
        lenses.push(
          new vscode.CodeLens(range, {
            title: 'View Account',
            command: 'solana.peekAccount',
            arguments: [value],
          })
        );
      }  else if (value.length >= 86 && value.length <= 88) {
        lenses.push(
          new vscode.CodeLens(range, {
            title: 'View Transaction',
            command: 'solana.peekTransaction',
            arguments: [value],
          })
        );
      }
    }
    return lenses;
  }
}
