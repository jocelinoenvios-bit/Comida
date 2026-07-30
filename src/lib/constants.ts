// "Enums" em string, validados aqui em vez de enum nativo do Postgres — troca de
// valor não exige migração de schema, só atualizar essas listas.

export const USER_ROLES = ["CUSTOMER", "MERCHANT", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ESTABLISHMENT_STATUS = ["PENDING", "APPROVED", "SUSPENDED"] as const;
export type EstablishmentStatus = (typeof ESTABLISHMENT_STATUS)[number];

export const PAYMENT_METHODS = ["PIX", "DINHEIRO", "CARTAO"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  PIX: "PIX",
  DINHEIRO: "Dinheiro",
  CARTAO: "Cartão",
};

export const ORDER_STATUS = [
  "PENDING",
  "SENT_TO_WHATSAPP",
  "CONFIRMED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendente",
  SENT_TO_WHATSAPP: "Enviado no WhatsApp",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
};

export const COUPON_TYPES = ["PERCENT", "FIXED"] as const;
export type CouponType = (typeof COUPON_TYPES)[number];

export const NOTIFICATION_TYPES = [
  "PROMOCAO",
  "CUPOM",
  "NOVO_ESTABELECIMENTO",
  "PEDIDO_ENVIADO",
  "PEDIDO_CONFIRMADO",
  "GERAL",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const WEEKDAYS = [
  { key: "mon", label: "Segunda" },
  { key: "tue", label: "Terça" },
  { key: "wed", label: "Quarta" },
  { key: "thu", label: "Quinta" },
  { key: "fri", label: "Sexta" },
  { key: "sat", label: "Sábado" },
  { key: "sun", label: "Domingo" },
] as const;
export type WeekdayKey = (typeof WEEKDAYS)[number]["key"];

export type OpeningHours = Partial<Record<WeekdayKey, [string, string][]>>;

export const PLAN_SLUGS = ["FREE", "BRONZE", "PRATA", "OURO"] as const;
export type PlanSlug = (typeof PLAN_SLUGS)[number];

export const PLANS_SEED = [
  {
    slug: "FREE" as const,
    name: "Gratuito",
    maxProducts: 20,
    highlighted: false,
    priceMonthly: 0,
    features: ["Até 20 produtos", "Sem destaque nas buscas"],
  },
  {
    slug: "BRONZE" as const,
    name: "Bronze",
    maxProducts: null,
    highlighted: false,
    priceMonthly: 49.9,
    features: ["Produtos ilimitados", "Painel completo"],
  },
  {
    slug: "PRATA" as const,
    name: "Prata",
    maxProducts: null,
    highlighted: true,
    priceMonthly: 99.9,
    features: ["Tudo do Bronze", "Destaque nas pesquisas", "Promoções", "Relatórios"],
  },
  {
    slug: "OURO" as const,
    name: "Ouro",
    maxProducts: null,
    highlighted: true,
    priceMonthly: 179.9,
    features: [
      "Tudo do Prata",
      "Primeiras posições",
      "Banner principal",
      "Notificações",
      "Relatórios completos",
    ],
  },
];

export const CATEGORIES_SEED = [
  { slug: "pizza", name: "Pizza", icon: "pizza" },
  { slug: "hamburguer", name: "Hambúrguer", icon: "beef" },
  { slug: "espetinho", name: "Espetinho", icon: "utensils-crossed" },
  { slug: "sushi", name: "Sushi", icon: "fish" },
  { slug: "pastel", name: "Pastel", icon: "cookie" },
  { slug: "acai", name: "Açaí", icon: "ice-cream-bowl" },
  { slug: "sorvete", name: "Sorvete", icon: "ice-cream-cone" },
  { slug: "lanches", name: "Lanches", icon: "sandwich" },
  { slug: "marmitas", name: "Marmitas", icon: "utensils" },
  { slug: "doces", name: "Doces", icon: "candy" },
  { slug: "padarias", name: "Padarias", icon: "croissant" },
  { slug: "churrasco", name: "Churrasco", icon: "flame" },
  { slug: "bebidas", name: "Bebidas", icon: "cup-soda" },
  { slug: "farmacia", name: "Farmácia", icon: "pill" },
  { slug: "mercado", name: "Mercado", icon: "shopping-cart" },
  { slug: "conveniencia", name: "Conveniência", icon: "store" },
  { slug: "outros", name: "Outros", icon: "more-horizontal" },
];

export const BRAND = {
  name: "Boraqui",
  tagline: "Bora comer? Boraqui!",
  launchCity: "Varjota",
  launchState: "CE",
};
