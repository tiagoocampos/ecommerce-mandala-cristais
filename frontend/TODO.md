# TODO - Mandala Cristais (Auth + Loja)

- [ ] Ajustar `frontend/src/services/api.ts` para usar `VITE_API_URL`.
- [ ] Corrigir/normalizar auth global (ideal: hooks/useAuth ou usar `lib/auth.ts`).
- [ ] Ajustar/implementar `frontend/src/components/ProtectedRoute.tsx` para proteger `/minha-conta`.
- [ ] Criar páginas: 
  - [ ] `src/pages/store/Login.tsx`
  - [ ] `src/pages/store/Register.tsx`
  - [ ] `src/pages/store/MyAccount.tsx`
- [ ] Atualizar `frontend/src/routes.tsx` para registrar `/login`, `/cadastro`, `/minha-conta`.
- [ ] Atualizar `frontend/src/components/store/StoreHeader.tsx` para redirecionar para `/login` se não logado, e `/minha-conta` se logado (ou dropdown + Sair).
- [ ] Atualizar `frontend/src/components/store/CategoryStrip.tsx` para buscar categorias reais via `GET /category` (pública) e fallback emoji 💎.
- [ ] Atualizar `frontend/src/pages/store/Home.tsx` para remover hardcode em categorias (depender apenas do CategoryStrip atualizado).
- [ ] Implementar CRUD de endereços em `MyAccount`:
  - [ ] Listar: `GET /address`
  - [ ] Criar: `POST /address`
  - [ ] Editar parcial: `PUT /address?address_id=<id>`
  - [ ] Remover com confirmação: `DELETE /address?address_id=<id>`
  - [ ] Tratar erros de validação (Zod) e negócio com `toast`.
- [ ] Build final e validação manual de fluxo: cadastro → auto-login → minha conta → add/edit/delete endereço.

