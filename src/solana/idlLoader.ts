import * as vscode from 'vscode';
import * as fs from 'fs/promises';

const idlCache: Map<string, any> = new Map();

export async function loadIdls() {
  idlCache.clear();
  const idlFiles = await vscode.workspace.findFiles('**/target/idl/*.json');
  for (const file of idlFiles) {
    try {
      const content = await fs.readFile(file.fsPath, 'utf-8');
      const idl = JSON.parse(content);
      if (idl.metadata?.address) {
        idlCache.set(idl.metadata.address, idl);
        console.log(`Loaded IDL for program: ${idl.metadata.address}`);
      }
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      vscode.window.showWarningMessage(`Failed to load IDL from ${file.fsPath}: ${errorMessage}`);
    }
  }
}

export function getIdl(programId: string) {
  return idlCache.get(programId);
}
