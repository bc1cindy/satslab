# 🔐 Configuração Segura do BTCPayServer

## 1. Variáveis de Ambiente Necessárias

Para o sistema de doação funcionar, você precisa configurar estas variáveis **NA PLATAFORMA DE DEPLOY**:

```env
BTCPAY_URL=https://pay.bitcoinheiros.com
BTCPAY_API_KEY=sua_chave_api_aqui
```

## 2. Como Configurar por Plataforma

### Vercel
1. Acesse seu dashboard do Vercel
2. Vá para Project → Settings → Environment Variables
3. Adicione as variáveis acima
4. Faça redeploy

### Netlify
1. Acesse Site Settings → Environment Variables
2. Adicione as variáveis
3. Faça redeploy

### Railway
1. Acesse Project → Variables
2. Adicione as variáveis
3. Redeploy automático

## 3. Segurança

⚠️ **NUNCA** commite credenciais no código!

✅ **Sempre** use variáveis de ambiente da plataforma
✅ **API Keys** ficam apenas no painel de controle
✅ **Logs** não expõem credenciais completas

## 4. Teste de Configuração

Para testar se as variáveis estão configuradas:

```bash
curl https://seusite.com/api/btcpay/test-config
```

Deve retornar:
```json
{
  "btcpayUrl": "https://pay.bitcoinheiros.com",
  "hasApiKey": true,
  "environment": "production"
}
```

## 5. Gerando API Key no BTCPayServer

1. Acesse: https://pay.bitcoinheiros.com/account/apikeys
2. Clique em "Generate Key"
3. Permissões necessárias:
   - ✅ `btcpay.store.cancreateinvoice`
   - ✅ `btcpay.store.canviewinvoices`
4. Copie a chave gerada
5. Configure na plataforma de deploy

## 6. Troubleshooting

### Erro: "BTCPay API key não configurada"
- Verifique se as variáveis estão configuradas na plataforma
- Faça redeploy após adicionar as variáveis
- Teste com `/api/btcpay/test-config`

### Erro 500 na criação de invoice
- Verifique se a API key tem permissões corretas
- Confirme se o Store ID está correto
- Verifique os logs do BTCPayServer