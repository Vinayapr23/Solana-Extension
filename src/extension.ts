import * as vscode from 'vscode';
import { AccountPeekProvider } from './providers/accountPeekProvider';
import { TerminalLinkProvider } from './providers/terminalLinkProvider';
import { CodeLensProvider } from './providers/codeLensProvider';
import { initializeConnection } from './solana/connection';
import { loadIdls } from './solana/idlLoader';

/**
 * Activates the Solana VS Code extension.
 */
export async function activate(context: vscode.ExtensionContext) {
  console.log('Solana VS Code Extension activated!');

  // Initialize Solana RPC connection
  initializeConnection().catch((error) => {
    vscode.window.showErrorMessage(`Failed to initialize Solana connection: ${error.message}`);
  });

  // Watch for config or Anchor.toml changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration('solana.network')) {
        await initializeConnection();
      }
    }),

    vscode.workspace.createFileSystemWatcher('**/Anchor.toml').onDidChange(async () => {
      await initializeConnection();
      await loadIdls();
    })
  );

  // Load Anchor IDLs once at startup
  loadIdls().catch((error) => {
    vscode.window.showErrorMessage(`Failed to load IDLs: ${error.message}`);
  });

  // Register custom content provider for Solana accounts
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider('solana-account', new AccountPeekProvider())
  );

  // Register terminal link provider for transaction links
  context.subscriptions.push(
    vscode.window.registerTerminalLinkProvider(new TerminalLinkProvider())
  );

  // Register CodeLens provider for pubkeys and txs
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { pattern: '**/*.{ts,js,rs,json,log}' },
      new CodeLensProvider()
    )
  );

  // Command: View Account
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'solana.peekAccount',
      async (editor) => {
        const position = editor.selection.active;
        const wordRange = editor.document.getWordRangeAtPosition(position, /[A-HJ-NP-Za-km-z1-9]{32,44}/);
        if (!wordRange) {
          vscode.window.showErrorMessage('No valid Solana pubkey selected.');
          return;
        }

        const pubkey = editor.document.getText(wordRange);
        const uri = vscode.Uri.parse(`solana-account:${pubkey}`);
        try {
          const doc = await vscode.workspace.openTextDocument(uri);
          await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
        } catch (err: any) {
          vscode.window.showErrorMessage(`Failed to open account view: ${err.message}`);
        }
      }
    )
  );


  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'solana.peekTransaction',
      async (editor) => {
        const position = editor.selection.active;
       const wordRange = editor.document.getWordRangeAtPosition(position, /[A-HJ-NP-Za-km-z1-9]{86,88}/);

        if (!wordRange) {
          vscode.window.showErrorMessage('No valid Solana transaction signature selected.');
          return;
        }

        const signature = editor.document.getText(wordRange);
        const content = `Click on a terminal link or use a dedicated provider to view the transaction:\n\n${signature}`;
        const doc = await vscode.workspace.openTextDocument({ content, language: 'markdown' });
        await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
      }
    )
  );
}

/**
 * Cleans up on extension deactivation.
 */
export function deactivate() {
  console.log('Solana VS Code Extension deactivated.');
}










// import * as vscode from 'vscode';
// import { AccountPeekProvider } from './providers/accountPeekProvider';
// import { TerminalLinkProvider } from './providers/terminalLinkProvider';
// import { CodeLensProvider } from './providers/codeLensProvider';
// import { initializeConnection } from './solana/connection';
// import { loadIdls } from './solana/idlLoader';

// export function activate(context: vscode.ExtensionContext) {
//   console.log('Solana VS Code Extension activated!');

//   // Initialize Solana connection
//   initializeConnection().catch((error) => {
//     vscode.window.showErrorMessage(`Failed to initialize Solana connection: ${error.message}`);
//   });

//   // Reload connection and IDLs on config changes
//   context.subscriptions.push(
//     vscode.workspace.onDidChangeConfiguration(async (e) => {
//       if (e.affectsConfiguration('solana.network')) {
//         await initializeConnection();
//       }
//     }),
//     vscode.workspace.createFileSystemWatcher('**/Anchor.toml').onDidChange(async () => {
//       await initializeConnection();
//       await loadIdls();
//     })
//   );

//   // Load Anchor IDLs
//   loadIdls().catch((error) => {
//     vscode.window.showErrorMessage(`Failed to load IDLs: ${error.message}`);
//   });

//   // Register providers
//   context.subscriptions.push(
//     vscode.workspace.registerTextDocumentContentProvider('solana-account', new AccountPeekProvider()),
//     vscode.window.registerTerminalLinkProvider(new TerminalLinkProvider()),
//     vscode.languages.registerCodeLensProvider(
//       { pattern: '**/*.{ts,js,rs,json,log}' },
//       new CodeLensProvider()
//     ),
//     vscode.commands.registerTextEditorCommand(
//       'solana.peekAccount',
//       (editor, edit, uri) => {
//         const position = editor.selection.active;
//         const wordRange = editor.document.getWordRangeAtPosition(position, /[A-HJ-NP-Za-km-z1-9]{32,44}/);
//         if (wordRange) {
//           const pubkey = editor.document.getText(wordRange);
//           vscode.commands.executeCommand('vscode.previewHtml', vscode.Uri.parse(`solana-account:${pubkey}`));
//         } else {
//           vscode.window.showErrorMessage('No valid Solana pubkey selected.');
//         }
//       }
//     ),
//     vscode.commands.registerTextEditorCommand(
//       'solana.peekTransaction',
//       (editor, edit, uri) => {
//         const position = editor.selection.active;
//         const wordRange = editor.document.getWordRangeAtPosition(position, /[A-HJ-NP-Za-km-z1-9]{88}/);
//         if (wordRange) {
//           const signature = editor.document.getText(wordRange);
//           vscode.commands.executeCommand('vscode.previewHtml', vscode.Uri.parse(`solana-tx:${signature}`));
//         } else {
//           vscode.window.showErrorMessage('No valid Solana transaction signature selected.');
//         }
//       }
//     )
//   );
// }

// export function deactivate() {
//   console.log('Solana VS Code Extension deactivated.');
// }
