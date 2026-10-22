# Notas

Pontos em aberto que dependem de decisões ainda não tomadas (por exemplo, o host de produção).

## Autenticação de admin

Contexto: o login de admin (`apps/api/src/domain/auth/`) usa um token JWT guardado num cookie
`httpOnly` chamado `admin_session`, válido por 8 horas. Os pontos abaixo não são bugs, mas precisam
ser revisados quando o host for definido.

### 1. O logout não invalida o token

A API não guarda uma lista de sessões: ela só confere a assinatura do token e se o admin ainda
existe no banco. O logout apaga o cookie do navegador, mas uma cópia do token continuaria válida até
expirar (8 horas).

- **Risco atual:** baixo. O cookie é `httpOnly`, então nem um script malicioso na página consegue
  lê-lo.
- **Para encerrar sessões na hora:** apagar o admin do banco (encerra as sessões dele) ou trocar o
  `JWT_SECRET` (desloga todos os admins).
- **Se um dia for necessário revogar sessões individualmente:** guardar as sessões no banco e
  conferir a cada requisição no `AdminGuard`.

### 2. O site e a API precisam estar no mesmo site

O cookie usa `SameSite=Strict`: o navegador só o envia em requisições feitas pelo mesmo site. É isso
que protege contra CSRF.

- **Desenvolvimento:** funciona, porque o Vite repassa `/api` para a API (tudo fica em
  `localhost:5173`).
- **Produção, funciona se:** front e API estiverem no mesmo domínio ou em subdomínios dele. Exemplo:
  `cafedafisica.com` + `cafedafisica.com/api`, ou `cafedafisica.com` + `api.cafedafisica.com`.
- **Produção, quebra se:** estiverem em domínios diferentes. Exemplo: `cafe-da-fisica.vercel.app` +
  `cafe-api.onrender.com`. O login responde 200, mas o cookie nunca volta e `/api/auth/me` sempre
  responde 401.
- **Se for preciso usar domínios diferentes:**
    - mudar o cookie para `SameSite=None` (em `auth.controller.ts`);
    - habilitar `credentials: true` no CORS (`app.setup.ts`);
    - usar `credentials: 'include'` no `fetch` do front (`apps/web/src/api/client.ts`);
    - adicionar outra proteção contra CSRF, já que o `SameSite` deixa de protegê-la.

### 3. `trust proxy` atrás de proxy reverso

O login aceita 5 tentativas por minuto **por IP**. Muitos hosts (Render, Railway, Fly.io, Nginx,
Cloudflare) põem um proxy na frente da API. Nesse caso, toda requisição chega com o IP do proxy e o
IP real do usuário vai no cabeçalho `X-Forwarded-For`, que o Express ignora por padrão.

- **Sintoma:** todos os usuários contam como um só. Cinco erros de senha de qualquer pessoa bloqueiam
  o login de todos por um minuto.
- **Correção:** só se houver proxy na frente da API, adicionar em `apps/api/src/app.setup.ts`:

    ```ts
    // Number of proxies in front of the API; check the host's documentation.
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
    ```

- **Cuidado:** sem proxy, essa linha deixa qualquer um falsificar o IP pelo cabeçalho e escapar do
  limite. O número deve ser a quantidade de proxies entre o usuário e a API.

## Painel de admin no frontend

O painel fica em `/admin`, decidido no navegador (`apps/web/src/Root.tsx`). Não existe um arquivo
`admin.html`: o servidor que hospedar o front precisa responder qualquer caminho desconhecido (como
`/admin`) com o `index.html` (o chamado "fallback de SPA"). Sem isso, abrir `/admin` direto ou
recarregar a página dá 404. O Vite já faz isso em `npm run dev` e `npm run preview`; em produção
depende do host (por exemplo, `rewrites` no Vercel, `_redirects` no Netlify, `try_files` no Nginx).

### Checklist ao definir o host

- [ ] O servidor do front devolve `index.html` para `/admin` (fallback de SPA)?
- [ ] Front e API no mesmo site? Se não, aplicar as mudanças do item 2.
- [ ] Há proxy reverso na frente da API? Se sim, configurar `trust proxy` (item 3).
- [ ] `JWT_SECRET` definido nas variáveis de ambiente de produção (a API não sobe sem ele).
- [ ] HTTPS ativo: em produção o cookie é `Secure` e não é enviado por HTTP.
