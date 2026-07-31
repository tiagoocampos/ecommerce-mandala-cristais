# TODO - Correção do Webhook do Mercado Pago

## Passos Concluídos
- [x] Análise dos arquivos relevantes (server.ts, routes.ts, WebhookController, WebhookService, CreatePreferenceService, etc.)
- [x] Identificação da causa raiz: Express v5 + body parsing faltando `urlencoded`
- [x] Aprovação do plano pelo usuário

## Passos Concluídos

### 1. ✅ `backend/src/server.ts`
- [x] Adicionar `express.urlencoded({ extended: true })` após `express.json()`
- Isso garante que webhooks enviados como `application/x-www-form-urlencoded` sejam parseados

### 2. ✅ `backend/src/controllers/payment/WebhookController.ts`
- [x] Adicionar try-catch no `handle()`
- [x] Adicionar logs detalhados (method, headers, body)
- [x] Retornar 200 mesmo em erro interno (Mercado Pago espera 200 para não reenviar)
- [x] Logar o erro sem propagar exceção

### 3. ✅ `backend/src/routes.ts`
- [x] Adicionar rota `GET /health` para testar conectividade via ngrok

### 4. Testes Pós-Implementação
- [ ] Reiniciar o servidor
- [ ] Verificar se o ngrok está rodando com URL correta
- [ ] Fazer um pagamento de teste
- [ ] Verificar logs do webhook
