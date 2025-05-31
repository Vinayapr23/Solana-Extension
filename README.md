#  Solana-Extension

A lightweight VSCode extension to **peek into Solana accounts and transactions** directly from your code or terminal. Perfect for developers building with **Anchor**, **web3.js**, or raw Solana programs.

##  Features

###  Peek Commands
- **View Account**: Decode on-chain accounts using Anchor IDL
- **View Transaction**: Decode instructions and account metadata

###  CodeLens Integration
- Automatically detects Solana **public keys** (32–44 chars) and **transaction signatures** (86–88 chars)
- Provides inline action buttons:
  - "View Account" for public keys
  - "View Transaction" for transaction signatures

### Terminal Link Support
- Automatically converts 86–88 character transaction signatures into **clickable links** in the terminal
- Opens decoded JSON view of transaction with a single click

###  Anchor IDL Integration
- Auto-loads IDLs from `target/idl/*.json`
- Decodes account data and instructions using `@coral-xyz/anchor`'s BorshCoder
- Seamless integration with Anchor projects

###  Dynamic Cluster Resolution
Automatically connects to the right RPC endpoint in this priority order:
1. VSCode configuration (`solana.network`)
2. Anchor.toml (`provider.cluster`)
3. Solana CLI config (`~/.config/solana/cli/config.yml`)
4. Defaults to Devnet

##  Getting Started

### Prerequisites
- Visual Studio Code 
- Node.js 16.x or higher
- npm or yarn

### Installation & Development Setup

1. **Clone and Open**
   ```bash
   git clone https://github.com/Vinayapr23/Solana-Extension.git
   cd Solana-Extension
   code .
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Building the Extension**
   ```bash
   npm run compile
   ```

4. **Launch Extension**
   Press `F5` in VS Code to launch the **Extension Development Host**

##  Testing the Extension

### ✅ Test Account Peeking
1. Paste a Solana account public key into any `.ts`, `.js`, or `.log` file
2. Place your cursor on the public key
3. Run `Solana: Peek Account` from the Command Palette (`Ctrl+Shift+P`)

### ✅ Test Transaction Peeking
1. Paste a transaction signature (86–88 characters) into any file
2. Place cursor on the signature
3. Run `Solana: Peek Transaction` from the Command Palette

### ✅ Test CodeLens
- Paste public keys and transaction signatures into a supported file
- Observe inline "View Account" and "View Transaction" buttons appear automatically

### ✅ Test Terminal Links
In the integrated terminal, try:
```bash
echo "4sYq1yfnkjVZbGdBNwccTi6xDEZws4bt7Z8FnzA9Dz29zRyJ3BL8AjMni47GGNLsHUn4rDXPVvQUfpMQwYuAYeXv"
```
A clickable link should appear for the transaction signature.

##  Configuration

### Manual Network Configuration
Set your preferred Solana cluster in VSCode settings:

```json
{
  "solana.network": "https://api.devnet.solana.com"
}
```

### Supported Networks
- **Mainnet**: `https://api.mainnet-beta.solana.com`
- **Devnet**: `https://api.devnet.solana.com`
- **Testnet**: `https://api.testnet.solana.com`
- **Localhost**: `http://localhost:8899`
- **Custom RPC**: Any valid Solana RPC endpoint

### Auto-Detection
The extension will automatically detect your network configuration from:
- **Anchor.toml**: `[provider.cluster]` setting
- **Solana CLI**: `~/.config/solana/cli/config.yml`


## Available Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `Solana: Peek Account` | Display decoded account information from a public key | Place cursor on pubkey, run command |
| `Solana: Peek Transaction` | Show decoded transaction instructions and metadata | Place cursor on tx signature, run command |


##  Dependencies

- `@coral-xyz/anchor` - IDL decoding and Anchor framework integration
- `@solana/web3.js` - Solana blockchain interaction
- `vscode` - VS Code extension API


##  Roadmap

- [ ] Support for custom IDL paths
- [ ] Account state change notifications
- [ ] Integrated Solana program debugging
- [ ] Token metadata display
- [ ] Transaction simulation
- [ ] Multi-signature wallet support

##  Known Issues

- IDL auto-loading only works for standard Anchor project structures
- Large transaction decoding may be slow on older machines
- Terminal links require integrated terminal (not external terminals)

## Acknowlegement 

I know this is not production ready nor it is published.Probably will publish it after few more features!
