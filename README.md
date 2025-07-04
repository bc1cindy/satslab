# SatsLab - Bitcoin Operations Platform

Plataforma educacional interativa para aprender operações Bitcoin através de módulos práticos com a rede Signet.

## 🚀 Recursos

- **7 Módulos Educacionais**: Do básico ao avançado
- **Rede Signet**: Ambiente seguro para testes com Bitcoin
- **Sistema de Badges**: Recompensas virtuais e Ordinals
- **Autenticação por Chave Privada**: Sem senhas tradicionais
- **Hands-on Learning**: Experiência prática com transações reais

## 📚 Módulos

1. **Introdução ao Bitcoin e Signet** (sem login necessário)
2. **Segurança e Carteiras**
3. **Transações na Signet**
4. **Mineração no Bitcoin**
5. **Lightning Network**
6. **Taproot e Ordinals**
7. **Multisig e Carteiras Hierárquicas**

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Bitcoin**: bitcoinjs-lib, mempool.space API
- **Autenticação**: NextAuth.js com chave privada
- **UI**: Radix UI, Lucide React

## 🏃‍♂️ Como Executar

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd satslab
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o ambiente**
   ```bash
   cp .env.local.example .env.local
   # Configure suas variáveis de ambiente
   ```

4. **Configure o Supabase**
   - Crie um projeto no [Supabase](https://supabase.com)
   - Execute o script SQL em `supabase/schema.sql`
   - Configure as variáveis de ambiente

5. **Execute o projeto**
   ```bash
   npm run dev
   ```

## 🔧 Configuração do Supabase

1. Crie um novo projeto no Supabase
2. Execute o script SQL localizado em `supabase/schema.sql`
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 📁 Estrutura do Projeto

```
app/
├── components/          # Componentes React
│   ├── ui/             # Componentes de UI reutilizáveis
│   ├── modules/        # Componentes específicos dos módulos
│   ├── auth/           # Componentes de autenticação
│   └── layout/         # Componentes de layout
├── lib/                # Bibliotecas e utilitários
│   ├── bitcoin/        # Utilitários Bitcoin
│   ├── supabase/       # Configuração e queries Supabase
│   ├── auth/           # Lógica de autenticação
│   └── utils/          # Utilitários gerais
├── modules/            # Páginas dos módulos
├── api/                # API routes
├── types/              # Definições de tipos TypeScript
└── hooks/              # React hooks customizados
```

## 🔐 Autenticação

O sistema usa chaves privadas Bitcoin para autenticação:
- Usuários fazem login com sua chave privada
- A chave pública é usada como identificador único
- Progressos e badges são vinculados à chave pública

## 🏆 Sistema de Recompensas

- **Badges Virtuais**: Módulos 1-5, salvos no Supabase
- **Ordinals**: Módulos 6-7, mintados na Signet pelo usuário
- **Progresso Persistente**: Trackagem completa de atividades

## 🌐 APIs Utilizadas

- **mempool.space/signet**: Explorador de blocos Signet
- **signetfaucet.com**: Faucet para obter sBTC
- **starbackr.me**: Faucet Lightning Network

## 📝 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue primeiro para discutir mudanças maiores.

## 📞 Suporte

Para dúvidas ou suporte, abra uma issue no repositório.