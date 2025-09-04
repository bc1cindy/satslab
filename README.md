# SatsLab

Open-source Bitcoin education platform with hands-on learning using Signet testnet.

**Live**: https://satslab.org | **Repo**: https://github.com/bc1cindy/satslab

## Features

### 7 Progressive Modules
1. **Bitcoin and Signet Introduction** - Learn the fundamental concepts of Bitcoin and explore the Signet network
2. **Security and Wallets** - Learn about private keys, wallet security, and creating Bitcoin addresses
3. **Signet Transactions** - Learn to create and send Bitcoin transactions, understand fees, and use OP_RETURN
4. **Bitcoin Mining** - Learn how Bitcoin mining works and simulate the proof-of-work process
5. **Lightning Network** - Learn about the Lightning Network and make instant Bitcoin transactions
6. **Taproot and Inscriptions** - Explore advanced Bitcoin features: Taproot for privacy and Inscriptions for NFTs
7. **Multisig Wallets** - Master multisig wallets for advanced security and collaborative transactions

### Core Features
- Real-time transaction explorer
- Interactive learning with testnet Bitcoin
- Multi-language support (EN/PT)

### Bitcoin4All Videos 

## Quick Start

```bash
# Clone
git clone https://github.com/bc1cindy/satslab.git
cd satslab

# Install
npm install

# Configure
cp .env.local.example .env.local
# Edit .env.local

# Run
npm run dev
```

## Environment Variables

### Required
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

### Optional
```env
BTCPAY_URL=           # Donations
BTCPAY_API_KEY=
ADMIN_EMAIL=          # Admin access
```

## Database

1. Create [Supabase](https://supabase.com) project
2. Run SQL migrations in `/supabase/migrations/`

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind
- **Bitcoin**: bitcoinjs-lib, mempool.space API
- **Database**: Supabase (PostgreSQL)


## Contributing

1. Fork
2. Create branch (`git checkout -b feature/new`)
3. Commit (`git commit -m 'Add feature'`)
4. Push (`git push origin feature/new`)
5. Open PR

## License

MIT - Free and open source

## Support

Issues: https://github.com/bc1cindy/satslab/issues

---

Built for the Bitcoin community 🧡