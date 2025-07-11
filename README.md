# SatsLab - Free and Open Source Bitcoin Education Platform

🚀 **Experience**: https://satslab.org/

Interactive Bitcoin education platform with hands-on learning through practical modules using the Signet network.

**🆓 Free Software**: SatsLab is proudly free and open source software, committed to educational freedom and accessibility for all.

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

**SatsLab is free and open source software!** We welcome contributions from the community:

1. **Fork the repository**
2. **Create your feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code of Conduct
- Respect the free software principles
- Welcome contributors of all skill levels
- Focus on educational value and accessibility
- Maintain high code quality and documentation

## 📝 License

**MIT License** - SatsLab is free software that respects your freedoms.

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Freedom to:
- ✅ **Use** - Run the program for any purpose
- ✅ **Study** - Access and examine the source code
- ✅ **Modify** - Change and improve the software
- ✅ **Distribute** - Share copies with others
- ✅ **Improve and Share** - Distribute your modifications

This license is compatible with GNU GPL and approved by the Free Software Foundation.

## 🔗 Links

- **Live Site**: https://satslab.org/
- **Repository**: https://github.com/bc1cindy/satslab
- **Issues**: https://github.com/bc1cindy/satslab/issues

## 🙏 Support

For questions or support, please open an issue in the repository.

---

*Built with ❤️ for the Bitcoin community*