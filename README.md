# SatsLab - Bitcoin Education Platform

🚀 **Experience**: https://satslab.org/

Interactive Bitcoin education platform with hands-on learning through practical modules using the Signet network.

## ⚡ Features

- **7 Educational Modules**: From basics to advanced Bitcoin operations
- **Signet Network**: Safe Bitcoin testing environment
- **Badge System**: Virtual rewards and Ordinals
- **Hands-on Learning**: Real transaction experience

## 📚 Modules

1. **Bitcoin & Signet Introduction** (no login required)
2. **Security & Wallets**
3. **Signet Transactions**
4. **Bitcoin Mining**
5. **Lightning Network**
6. **Taproot & Ordinals**
7. **Multisig & HD Wallets**

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Bitcoin**: bitcoinjs-lib, mempool.space API
- **Authentication**: IP-based auth
- **UI**: Radix UI, Lucide React

## 🚀 Quick Start

1. **Clone & Install**
   ```bash
   git clone https://github.com/bc1cindy/satslab.git
   cd satslab
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   # Configure your environment variables
   ```

3. **Database Setup**
   - Create a [Supabase](https://supabase.com) project
   - Run the SQL scripts in order (check `/supabase/` directory)
   - Configure environment variables

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

Required variables in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📁 Project Structure

```
app/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── modules/        # Module-specific components
│   ├── auth/           # Authentication components
│   └── layout/         # Layout components
├── lib/                # Libraries and utilities
│   ├── bitcoin/        # Bitcoin utilities
│   ├── supabase/       # Supabase configuration
│   ├── auth/           # Authentication logic
│   └── security/       # Security utilities
├── modules/            # Module pages
├── admin/              # Admin dashboard
└── api/                # API routes
```

## 🔐 Authentication

Simple authentication system:
- IP-based authentication
- Progress tracking per user

## 🏆 Rewards System

- **Virtual Badges**: Modules 1-5 (stored in Supabase)
- **Ordinals**: Modules 6-7 (minted on Signet)
- **Progress Tracking**: Complete activity monitoring

## 🌐 APIs Used

- **mempool.space/signet**: Signet block explorer
- **signetfaucet.com**: Signet Bitcoin faucet
- **starbackr.me**: Lightning Network faucet

## 🤝 Contributing

Open source project! Contributions welcome:
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details.

## 🔗 Links

- **Live Site**: https://satslab.org/
- **Repository**: https://github.com/bc1cindy/satslab
- **Issues**: https://github.com/bc1cindy/satslab/issues

## 🙏 Support

For questions or support, please open an issue in the repository.

---

*Built with ❤️ for the Bitcoin community*