# 🚀 Deployment Guide - SatsLab

## Netlify Deploy Setup

### 1. Conectar ao Netlify
1. Acesse [netlify.com](https://netlify.com)
2. Faça login com GitHub
3. Clique em "New site from Git"
4. Selecione seu repositório `satslab`

### 2. Configurações de Build
```
Build command: npm run build
Publish directory: out
```

### 3. Variáveis de Ambiente
Configure no Netlify Dashboard → Site Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXTAUTH_URL=https://satslab.org
NEXTAUTH_SECRET=your_nextauth_secret
BITCOIN_NETWORK=testnet
```

### 4. Configurar Domínio Customizado
1. Netlify Dashboard → Site Settings → Domain Management
2. Add custom domain: `satslab.org`
3. Configure DNS no seu registrador:

```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: seu-site.netlify.app
```

### 5. SSL/HTTPS
- Netlify configura automaticamente
- Força HTTPS habilitado por padrão

## Deploy Automático
✅ Configurado! Agora a cada `git push` para `main`:
1. Netlify detecta mudanças
2. Executa `npm run build`
3. Deploy automático para `satslab.org`

## Monitoramento
- Logs de build: Netlify Dashboard → Deploys
- Analytics: Netlify Dashboard → Analytics
- Erros: Netlify Dashboard → Functions

## Rollback
Se algo der errado:
1. Netlify Dashboard → Deploys
2. Clique em versão anterior
3. "Publish deploy"

## Performance
- ✅ CDN global automático
- ✅ Compressão gzip/brotli
- ✅ Cache inteligente
- ✅ Image optimization (configurado)

## Checklist Final
- [ ] Configurar variáveis de ambiente
- [ ] Testar build local: `npm run build`
- [ ] Conectar domínio satslab.org
- [ ] Verificar SSL funcionando
- [ ] Testar deploy automático com commit

🎉 Pronto! Seu SatsLab estará no ar!