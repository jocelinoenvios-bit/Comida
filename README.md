# Boraqui 🧡

Plataforma de delivery para cidades do interior do Brasil — inspirada no iFood, mas pensada para
o comércio local. Cada estabelecimento continua usando seus próprios entregadores; o Boraqui apenas
reúne todo o delivery da cidade em um só lugar e envia o pedido, já organizado, para o WhatsApp do
estabelecimento.

Lançamento: **Varjota, CE**. Arquitetura pronta para expandir a centenas de cidades.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript) — um único app cobrindo cliente, comerciante e
  administrador, além de PWA instalável em Android/iPhone/desktop.
- **Prisma + SQLite** para desenvolvimento local (schema portátil para Postgres em produção — troque
  só o `provider`/`DATABASE_URL`).
- **NextAuth v5** — login com Google e login por telefone (OTP simulado no MVP).
- **Tailwind CSS v4** com paleta de marca (laranja/azul-escuro/branco/cinza-claro).
- **Zustand** para o carrinho (persistido em `localStorage`, por estabelecimento).
- Server Actions do Next.js para todas as mutações (pedidos, cardápio, planos, aprovação de lojas etc).

## Por que essa arquitetura escala para centenas de cidades

- `City` e `Neighborhood` são entidades de primeira classe — cadastrar uma nova cidade não exige
  deploy nem alteração de código, só um registro no painel admin (`/admin/cidades`).
- Categorias, planos e banners são globais por padrão e podem ser filtrados por cidade (`Banner.cityId`
  nulo = todas as cidades).
- Toda consulta de estabelecimentos já é filtrada por `cityId`, então o catálogo de cada cidade fica
  isolado (índices em `Establishment(cityId, status)` para consultas rápidas mesmo com muitas cidades).
- Horário de funcionamento é resolvido pelo fuso horário da loja (hoje fixo em `America/Fortaleza`;
  o próximo passo natural é um campo `timezone` por `City` quando o Boraqui cruzar fusos).

## Rodando localmente

```bash
npm install
cp .env.example .env        # ajuste AUTH_GOOGLE_ID/SECRET se for testar login Google
npx prisma migrate dev      # cria o SQLite local e aplica o schema
npm run db:seed             # popula Varjota/CE com estabelecimentos, produtos, planos etc.
npm run dev
```

Abra http://localhost:3000.

### Contas de demonstração (login por telefone, código `0000`)

| Papel        | Telefone         |
|--------------|-------------------|
| Cliente      | `+5588999990002`  |
| Comerciante  | `+5588999990001` (dono do "Point do Burguer") |
| Administrador| `+5588999990000`  |

O login por telefone usa um código fixo (`0000`) neste MVP — trocar por um provedor de SMS real
(Twilio, Zenvia...) é a única mudança necessária em `src/auth.ts` para produção.

## Estrutura

```
prisma/schema.prisma       modelo de dados (cidades, estabelecimentos, cardápio, pedidos, planos...)
prisma/seed.ts             dados de demonstração de Varjota/CE
src/app/                   rotas (App Router)
  (cliente)                /, /busca, /categoria/[slug], /loja/[slug], /carrinho, /checkout,
                           /pedidos, /favoritos, /enderecos, /perfil, /entrar
  painel/                  painel do comerciante (loja, horário, cardápio, cupons, relatórios)
  admin/                   painel administrativo (cidades, estabelecimentos, planos, categorias,
                           banners, notificações, estatísticas)
src/server/actions/        Server Actions (mutações) por domínio
src/server/queries.ts      leituras compartilhadas (home, busca, categoria, loja)
src/lib/whatsapp.ts        geração da mensagem de pedido + link wa.me
src/store/cart.ts          carrinho (zustand + localStorage)
```

## Fluxo de pedido (o coração do Boraqui)

1. Cliente monta o carrinho na página do estabelecimento (`/loja/[slug]`).
2. No checkout, escolhe endereço, forma de pagamento (PIX/Dinheiro/Cartão) e observações.
3. Ao confirmar, o Boraqui grava o pedido e monta automaticamente uma mensagem organizada
   (cliente, telefone, endereço, itens, total, observações) e abre a conversa do WhatsApp do
   estabelecimento — sem exigir nenhuma mudança na operação que o comerciante já usa.

## Sistema de planos

Gratuito (até 20 produtos) → Bronze (produtos ilimitados) → Prata (destaque + promoções + relatórios)
→ Ouro (primeiras posições, banner principal, notificações, relatórios completos). Editável em
`/admin/planos`; o limite de produtos do plano é aplicado na hora de cadastrar itens no cardápio.

## Limitações conhecidas do MVP (próximos passos)

- **Upload de imagens**: comerciantes colam URLs de imagem; falta um pipeline de upload
  (S3/Cloudinary) com recorte/compressão.
- **OTP por telefone** é simulado (`0000`); falta integração com um provedor de SMS.
- **Pagamento** continua manual via WhatsApp (PIX copia-e-cola, dinheiro ou cartão na entrega),
  como pedido no briefing — pagamento online fica para uma fase futura.
- **Apps nativos**: hoje o Boraqui é uma PWA instalável (funciona offline para a casca do app,
  ícone na tela inicial, tela cheia). Publicar nas lojas exigiria empacotar com Capacitor/Expo
  reaproveitando a mesma base web.
- **Rastreamento de pedido, fidelidade, entregadores parceiros** — mencionados no briefing como
  expansão futura; o schema já tem espaço para isso (`Order.status`, `User.role`) sem quebrar o
  que existe.

## Comandos úteis

```bash
npm run dev         # ambiente de desenvolvimento
npm run build        # build de produção
npm run lint          # ESLint
npm run db:seed      # repopula os dados de demonstração
npm run db:reset      # reseta o banco local e roda o seed de novo
```
