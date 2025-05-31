import * as vscode from 'vscode';

export async function showPeekContent(uri: vscode.Uri, content: string) {
  try {
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside, preview: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Failed to show content: ${errorMessage}`);
  }
}
