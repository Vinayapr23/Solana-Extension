import { Connection, PublicKey } from '@solana/web3.js';
import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { parse as parseToml } from 'toml';

let connection: Connection | null = null;

const CLUSTER_MAP: { [key: string]: string } = {
  mainnet: 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
  localnet: 'http://localhost:8899',
};

async function getNetworkFromConfig(): Promise<string> {
  const config = vscode.workspace.getConfiguration('solana');
  const customRpc = config.get<string>('network');
  if (customRpc && /^https?:\/\//.test(customRpc)) {
    return customRpc;
  }

  const anchorFiles = await vscode.workspace.findFiles('**/Anchor.toml');
  if (anchorFiles.length > 0) {
    try {
      const tomlContent = await fs.readFile(anchorFiles[0].fsPath, 'utf-8');
      const parsed = parseToml(tomlContent);
      const cluster = parsed.provider?.cluster;
      if (cluster && CLUSTER_MAP[cluster.toLowerCase()]) {
        return CLUSTER_MAP[cluster.toLowerCase()];
      } else if (parsed.provider?.cluster && /^https?:\/\//.test(parsed.provider.cluster)) {
        return parsed.provider.cluster;
      }
    } catch (error) {
      console.error('Failed to parse Anchor.toml:', error);
    }
  }

  const solanaConfigPath = path.join(os.homedir(), '.config', 'solana', 'cli', 'config.yml');
  try {
    const configContent = await fs.readFile(solanaConfigPath, 'utf-8');
    const match = configContent.match(/json_rpc_url:\s*"?([^"\n]+)"?/);
    if (match && match[1] && /^https?:\/\//.test(match[1])) {
      return match[1];
    }
  } catch (error) {
    console.error('Failed to read Solana CLI config:', error);
  }

  return CLUSTER_MAP.devnet;
}

export async function initializeConnection() {
  const rpcUrl = await getNetworkFromConfig();
  try {
    connection = new Connection(rpcUrl, 'confirmed');
    await connection.getVersion();
    vscode.window.showInformationMessage(`Connected to Solana network: ${rpcUrl}`);
  } catch (error) {
    connection = null;
    const message = (error instanceof Error) ? error.message : String(error);
    throw new Error(`Failed to connect to ${rpcUrl}: ${message}`);
  }
}

export function getConnection(): Connection {
  if (!connection) {
    throw new Error('Solana connection not initialized.');
  }
  return connection;
}

export async function getAccountInfo(pubkey: string) {
  const conn = getConnection();
  try {
    const account = await conn.getAccountInfo(new PublicKey(pubkey), 'confirmed');
    if (!account) {
      return null;
    }
    return {
      lamports: account.lamports,
      owner: account.owner,
      data: account.data,
      executable: account.executable,
    };
  } catch (error) {
    const message = (error instanceof Error) ? error.message : String(error);
    throw new Error(`Failed to fetch account info for ${pubkey}: ${message}`);
  }
}

export async function getTransaction(signature: string) {
  const conn = getConnection();
  try {
    const tx = await conn.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    });
    return tx || null;
  } catch (error) {
    const message = (error instanceof Error) ? error.message : String(error);
    throw new Error(`Failed to fetch transaction ${signature}: ${message}`);
  }
}
