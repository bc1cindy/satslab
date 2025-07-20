# Configuração do Webhook BTCPay Server

## 1. Acesse o BTCPay Server Dashboard
- Vá em: https://pay.bitcoinheiros.com/
- Faça login com suas credenciais

## 2. Configure o Webhook
- Vá em **Stores** → **SatsLabPro** → **Settings** → **Webhooks**
- Clique **"Create Webhook"**

## 3. Configurações do Webhook

### **Payload URL:**
```
https://satslab.org/api/webhooks/btcpay
```

### **Events (Eventos):**
Selecione os seguintes eventos:
- ✅ `A payment of an invoice has been settled`
- ✅ `An invoice became settled`
- ✅ `An invoice expired`
- ✅ `An invoice became invalid`

### **Secret (opcional mas recomendado):**
- Gere uma string aleatória: `openssl rand -hex 32`
- Adicione no `.env.local`: `BTCPAY_WEBHOOK_SECRET=sua_string_aqui`

### **Automatic redelivery:**
- ✅ Habilite para tentar novamente em caso de falha

## 4. Teste o Webhook

### **Teste local (desenvolvimento):**
```bash
# Use ngrok para expor localhost
ngrok http 3000

# Configure a URL temporária no BTCPay:
# https://abc123.ngrok.io/api/webhooks/btcpay
```

### **Verificar configuração:**
```bash
curl https://satslab.org/api/webhooks/btcpay
```

## 5. Adicione ao .env.local
```bash
# BTCPayServer Webhook
BTCPAY_WEBHOOK_SECRET=sua_string_secreta_aqui
```

## 6. Como Funciona

### **Fluxo Automático:**
1. 👤 Usuário seleciona Bitcoin no checkout
2. 🔗 Sistema cria invoice no BTCPay
3. 💰 Usuário paga via Bitcoin/Lightning
4. 🔔 BTCPay envia webhook para nossa API
5. ✅ Sistema automaticamente libera acesso Pro
6. 📧 Usuário pode acessar `/pro` imediatamente

### **Eventos Processados:**
- **`InvoicePaymentSettled`**: Pagamento confirmado
- **`InvoiceSettled`**: Invoice totalmente processado
- **`InvoiceExpired`**: Invoice expirou
- **`InvoiceInvalid`**: Invoice inválido

## 7. Logs e Debug

### **Verificar logs:**
```bash
# Logs do webhook no console do servidor
tail -f logs/app.log | grep "BTCPay webhook"
```

### **Endpoint de debug:**
```bash
curl https://satslab.org/api/webhooks/btcpay
# Retorna configurações do webhook
```

## 8. Segurança

- ✅ **Verificação de assinatura** com webhook secret
- ✅ **Validação de eventos** apenas tipos esperados
- ✅ **Rate limiting** automático do Next.js
- ✅ **Logs detalhados** para auditoria

## 9. Fallback Manual

Caso o webhook falhe, você pode conceder acesso manualmente:

```sql
-- No Supabase SQL Editor
SELECT grant_pro_access(
  'email@usuario.com', 
  'bitcoin', 
  726.53, 
  'invoice_id_do_btcpay'
);
```