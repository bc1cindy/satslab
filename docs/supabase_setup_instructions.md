# Configuração do Webhook BTCPay via Supabase

## 1. Execute o SQL no Supabase

No Supabase Dashboard → SQL Editor, execute o arquivo:
```sql
-- Conteúdo de supabase_webhook_function.sql
```

## 2. Crie a Edge Function

### Instalar Supabase CLI:
```bash
npm install -g supabase
```

### Inicializar projeto:
```bash
supabase init
supabase login
```

### Criar a Edge Function:
```bash
supabase functions new btcpay-webhook
```

### Substituir o conteúdo:
Copie o conteúdo de `supabase_edge_function.ts` para:
```
supabase/functions/btcpay-webhook/index.ts
```

### Deploy da função:
```bash
supabase functions deploy btcpay-webhook
```

## 3. Configure o Webhook no BTCPay

### URL do Webhook:
```
https://dusltdzlltnvwlkpnvsu.supabase.co/functions/v1/btcpay-webhook
```

### Eventos:
- ✅ A payment of an invoice has been settled
- ✅ An invoice became settled
- ✅ An invoice expired
- ✅ An invoice became invalid

### Authorization Header:
```
Bearer ${SUPABASE_ANON_KEY}
```

⚠️ **SECURITY**: Replace `${SUPABASE_ANON_KEY}` with your actual Supabase anonymous key from environment variables. NEVER commit real API keys to version control.

## 4. Alternativa Mais Simples - Database Webhook

Se não quiser usar Edge Functions, você pode usar Database Webhooks:

### No Supabase Dashboard:
1. Vá em **Database** → **Webhooks**
2. Clique **"Create a new hook"**
3. **Table**: `webhook_logs`
4. **Events**: `INSERT`
5. **HTTP Request**:
   - **URL**: Qualquer URL (não será usada)
   - **Method**: POST

### Depois configure webhook do BTCPay para:
```
https://dusltdzlltnvwlkpnvsu.supabase.co/rest/v1/rpc/process_btcpay_webhook
```

Com headers:
```
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1c2x0ZHpsbHRudndsa3BudnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNjM4NDUsImV4cCI6MjA2NzYzOTg0NX0.lxwWAWe-DSRRBtckuglM4DSFi7SEqKFZ-XnIriYydNk
Content-Type: application/json
```

## 5. Testar

### Endpoint de teste:
```bash
curl https://dusltdzlltnvwlkpnvsu.supabase.co/functions/v1/btcpay-webhook
```

### Ver logs:
```sql
-- No Supabase SQL Editor
SELECT * FROM webhook_logs ORDER BY processed_at DESC LIMIT 10;
```

## Projeto Supabase:
**ID**: `dusltdzlltnvwlkpnvsu`  
**URL**: `https://dusltdzlltnvwlkpnvsu.supabase.co`