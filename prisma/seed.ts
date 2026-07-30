import { PrismaClient } from "@prisma/client";
import { CATEGORIES_SEED, PLANS_SEED } from "../src/lib/constants";

const prisma = new PrismaClient();

const img = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const DEFAULT_HOURS = JSON.stringify({
  mon: [["11:00", "23:00"]],
  tue: [["11:00", "23:00"]],
  wed: [["11:00", "23:00"]],
  thu: [["11:00", "23:00"]],
  fri: [["11:00", "23:30"]],
  sat: [["11:00", "23:30"]],
  sun: [["17:00", "22:30"]],
});

// Este seed é executado a cada deploy (build command na Vercel), então precisa ser
// idempotente: rodar de novo nunca deve duplicar ou falhar por causa de dados já
// existentes. Por isso usamos upsert com IDs determinísticos em vez de create() puro.
async function main() {
  console.log("Seeding Boraqui — Varjota/CE...");

  // ---------- Planos ----------
  const plans: Record<string, { id: string }> = {};
  for (const p of PLANS_SEED) {
    plans[p.slug] = await prisma.plan.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        maxProducts: p.maxProducts,
        highlighted: p.highlighted,
        priceMonthly: p.priceMonthly,
        featuresJson: JSON.stringify(p.features),
      },
    });
  }

  // ---------- Categorias ----------
  const categories: Record<string, { id: string }> = {};
  for (const [i, c] of CATEGORIES_SEED.entries()) {
    categories[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { slug: c.slug, name: c.name, icon: c.icon, order: i },
    });
  }

  // ---------- Cidade ----------
  const city = await prisma.city.upsert({
    where: { slug: "varjota-ce" },
    update: {},
    create: { slug: "varjota-ce", name: "Varjota", state: "CE", isActive: true },
  });

  const neighborhoodNames = ["Centro", "Bela Vista", "São José", "Planalto", "Alto do Cruzeiro"];
  const neighborhoods: Record<string, { id: string }> = {};
  for (const name of neighborhoodNames) {
    neighborhoods[name] = await prisma.neighborhood.upsert({
      where: { cityId_name: { cityId: city.id, name } },
      update: {},
      create: { name, cityId: city.id },
    });
  }

  // ---------- Usuários ----------
  const admin = await prisma.user.upsert({
    where: { phone: "+5588999990000" },
    update: {},
    create: {
      name: "Administrador Boraqui",
      phone: "+5588999990000",
      email: "jocelinoenvios@gmail.com",
      role: "ADMIN",
    },
  });

  const merchantUser = await prisma.user.upsert({
    where: { phone: "+5588999990001" },
    update: {},
    create: { name: "Dono do Point do Burguer", phone: "+5588999990001", role: "MERCHANT" },
  });

  const customer = await prisma.user.upsert({
    where: { phone: "+5588999990002" },
    update: {},
    create: { name: "Cliente Demonstração", phone: "+5588999990002", role: "CUSTOMER" },
  });

  await prisma.address.upsert({
    where: { id: "seed-address-customer" },
    update: {},
    create: {
      id: "seed-address-customer",
      userId: customer.id,
      label: "Casa",
      street: "Rua José de Alencar",
      number: "123",
      neighborhoodId: neighborhoods["Centro"].id,
      cityId: city.id,
      isDefault: true,
    },
  });

  // ---------- Estabelecimentos ----------
  type SeedEstablishment = {
    slug: string;
    name: string;
    categorySlugs: string[];
    neighborhood: string;
    whatsapp: string;
    instagram?: string;
    deliveryFee: number;
    avgDeliveryTimeMin: number;
    plan: string;
    status?: "PENDING" | "APPROVED" | "SUSPENDED";
    ownerId?: string;
    products: {
      section: string;
      name: string;
      price: number;
      promoPrice?: number;
      description?: string;
      isCombo?: boolean;
      soldCount?: number;
    }[];
    additions?: { name: string; price: number }[];
  };

  const establishmentsSeed: SeedEstablishment[] = [
    {
      slug: "pizzaria-bella-napoli",
      name: "Pizzaria Bella Napoli",
      categorySlugs: ["pizza"],
      neighborhood: "Centro",
      whatsapp: "+5588998880001",
      instagram: "@bellanapolivarjota",
      deliveryFee: 6,
      avgDeliveryTimeMin: 45,
      plan: "OURO",
      products: [
        { section: "Pizzas salgadas", name: "Pizza Calabresa", price: 42, description: "Molho, mussarela, calabresa e cebola", soldCount: 210 },
        { section: "Pizzas salgadas", name: "Pizza Portuguesa", price: 46, soldCount: 150 },
        { section: "Pizzas salgadas", name: "Pizza Quatro Queijos", price: 48, promoPrice: 42, soldCount: 180 },
        { section: "Pizzas doces", name: "Pizza Chocolate com Morango", price: 40, soldCount: 90 },
        { section: "Bebidas", name: "Coca-Cola 2L", price: 12, soldCount: 300 },
      ],
      additions: [
        { name: "Borda recheada catupiry", price: 8 },
        { name: "Queijo extra", price: 6 },
      ],
    },
    {
      slug: "point-do-burguer",
      name: "Point do Burguer",
      categorySlugs: ["hamburguer", "lanches"],
      neighborhood: "Bela Vista",
      whatsapp: "+5588998880002",
      instagram: "@pointdoburguer",
      deliveryFee: 5,
      avgDeliveryTimeMin: 35,
      plan: "PRATA",
      ownerId: merchantUser.id,
      products: [
        { section: "Burgers", name: "X-Bacon", price: 24, description: "Pão, blend 160g, queijo, bacon e molho especial", soldCount: 420 },
        { section: "Burgers", name: "X-Salada", price: 20, soldCount: 300 },
        { section: "Burgers", name: "X-Tudo", price: 30, promoPrice: 26, soldCount: 260 },
        { section: "Combos", name: "Combo X-Bacon + Fritas + Refri", price: 36, isCombo: true, soldCount: 180 },
        { section: "Bebidas", name: "Coca-Cola Lata", price: 6, soldCount: 350 },
      ],
      additions: [
        { name: "Bacon extra", price: 5 },
        { name: "Ovo", price: 3 },
        { name: "Cheddar", price: 4 },
      ],
    },
    {
      slug: "espetinho-do-ze",
      name: "Espetinho do Zé",
      categorySlugs: ["espetinho", "churrasco"],
      neighborhood: "São José",
      whatsapp: "+5588998880003",
      deliveryFee: 4,
      avgDeliveryTimeMin: 40,
      plan: "BRONZE",
      products: [
        { section: "Espetinhos", name: "Espetinho de Carne", price: 9, soldCount: 400 },
        { section: "Espetinhos", name: "Espetinho de Frango com Bacon", price: 10, soldCount: 320 },
        { section: "Espetinhos", name: "Espetinho de Queijo Coalho", price: 8, soldCount: 280 },
        { section: "Acompanhamentos", name: "Vinagrete", price: 4, soldCount: 120 },
      ],
    },
    {
      slug: "sushi-varjota",
      name: "Sushi Varjota",
      categorySlugs: ["sushi"],
      neighborhood: "Centro",
      whatsapp: "+5588998880004",
      deliveryFee: 8,
      avgDeliveryTimeMin: 50,
      plan: "PRATA",
      products: [
        { section: "Combinados", name: "Combo 20 peças", price: 55, soldCount: 130 },
        { section: "Combinados", name: "Combo 30 peças", price: 78, promoPrice: 69, soldCount: 95 },
        { section: "Temaki", name: "Temaki Salmão", price: 26, soldCount: 140 },
      ],
    },
    {
      slug: "pastelaria-da-praca",
      name: "Pastelaria da Praça",
      categorySlugs: ["pastel"],
      neighborhood: "Centro",
      whatsapp: "+5588998880005",
      deliveryFee: 4,
      avgDeliveryTimeMin: 30,
      plan: "FREE",
      products: [
        { section: "Pastéis salgados", name: "Pastel de Carne", price: 8, soldCount: 500 },
        { section: "Pastéis salgados", name: "Pastel de Queijo", price: 7, soldCount: 460 },
        { section: "Bebidas", name: "Caldo de Cana 500ml", price: 6, soldCount: 200 },
      ],
    },
    {
      slug: "acai-da-serra",
      name: "Açaí da Serra",
      categorySlugs: ["acai"],
      neighborhood: "Planalto",
      whatsapp: "+5588998880006",
      deliveryFee: 5,
      avgDeliveryTimeMin: 30,
      plan: "BRONZE",
      products: [
        { section: "Açaí", name: "Açaí 300ml", price: 12, soldCount: 380 },
        { section: "Açaí", name: "Açaí 500ml", price: 18, soldCount: 340 },
        { section: "Açaí", name: "Açaí 700ml", price: 24, promoPrice: 21, soldCount: 220 },
      ],
      additions: [
        { name: "Granola", price: 2 },
        { name: "Leite em pó", price: 2 },
        { name: "Morango", price: 4 },
      ],
    },
    {
      slug: "sorveteria-polar",
      name: "Sorveteria Polar",
      categorySlugs: ["sorvete"],
      neighborhood: "Bela Vista",
      whatsapp: "+5588998880007",
      deliveryFee: 5,
      avgDeliveryTimeMin: 30,
      plan: "FREE",
      products: [
        { section: "Casquinhas", name: "Casquinha Simples", price: 6, soldCount: 260 },
        { section: "Potes", name: "Pote 500ml", price: 16, soldCount: 180 },
      ],
    },
    {
      slug: "marmitex-da-dona-ana",
      name: "Marmitex da Dona Ana",
      categorySlugs: ["marmitas"],
      neighborhood: "São José",
      whatsapp: "+5588998880008",
      deliveryFee: 5,
      avgDeliveryTimeMin: 40,
      plan: "BRONZE",
      products: [
        { section: "Marmitas", name: "Marmita Pequena", price: 15, soldCount: 300 },
        { section: "Marmitas", name: "Marmita Média", price: 20, soldCount: 260 },
        { section: "Marmitas", name: "Marmita Grande", price: 25, soldCount: 190 },
      ],
    },
    {
      slug: "padaria-pao-quente",
      name: "Padaria Pão Quente",
      categorySlugs: ["padarias", "doces"],
      neighborhood: "Centro",
      whatsapp: "+5588998880009",
      deliveryFee: 4,
      avgDeliveryTimeMin: 25,
      plan: "PRATA",
      products: [
        { section: "Salgados", name: "Coxinha", price: 6, soldCount: 400 },
        { section: "Doces", name: "Bolo de Rolo (fatia)", price: 8, soldCount: 150 },
        { section: "Padaria", name: "Pão Francês (kg)", price: 12, soldCount: 220 },
      ],
    },
    {
      slug: "mercadinho-bom-preco",
      name: "Mercadinho Bom Preço",
      categorySlugs: ["mercado", "bebidas", "conveniencia"],
      neighborhood: "Alto do Cruzeiro",
      whatsapp: "+5588998880010",
      deliveryFee: 6,
      avgDeliveryTimeMin: 35,
      plan: "BRONZE",
      products: [
        { section: "Bebidas", name: "Coca-Cola 2L", price: 11, soldCount: 260 },
        { section: "Bebidas", name: "Água Mineral 500ml", price: 3, soldCount: 320 },
        { section: "Mercearia", name: "Pacote de Arroz 5kg", price: 28, soldCount: 90 },
      ],
    },
    {
      slug: "farmacia-popular-varjota",
      name: "Farmácia Popular Varjota",
      categorySlugs: ["farmacia"],
      neighborhood: "Centro",
      whatsapp: "+5588998880011",
      deliveryFee: 5,
      avgDeliveryTimeMin: 30,
      plan: "OURO",
      products: [
        { section: "Medicamentos", name: "Dipirona 500mg", price: 9, soldCount: 150 },
        { section: "Higiene", name: "Álcool em Gel 500ml", price: 12, soldCount: 130 },
      ],
    },
    {
      slug: "conveniencia-24h",
      name: "Conveniência 24h",
      categorySlugs: ["conveniencia", "bebidas"],
      neighborhood: "Bela Vista",
      whatsapp: "+5588998880012",
      deliveryFee: 6,
      avgDeliveryTimeMin: 25,
      plan: "FREE",
      status: "PENDING",
      products: [
        { section: "Bebidas", name: "Cerveja Lata 350ml", price: 5, soldCount: 200 },
        { section: "Snacks", name: "Salgadinho 100g", price: 7, soldCount: 140 },
      ],
    },
  ];

  for (const est of establishmentsSeed) {
    const establishment = await prisma.establishment.upsert({
      where: { slug: est.slug },
      update: {},
      create: {
        slug: est.slug,
        name: est.name,
        ownerId: est.ownerId,
        cityId: city.id,
        neighborhoodId: neighborhoods[est.neighborhood].id,
        logoUrl: img(`${est.slug}-logo`, 300, 300),
        coverUrl: img(`${est.slug}-cover`, 1200, 600),
        description: `${est.name} — sabor e tradição em Varjota, direto no seu WhatsApp.`,
        whatsapp: est.whatsapp,
        instagram: est.instagram,
        pixKey: est.whatsapp,
        deliveryFee: est.deliveryFee,
        avgDeliveryTimeMin: est.avgDeliveryTimeMin,
        openingHoursJson: DEFAULT_HOURS,
        status: est.status ?? "APPROVED",
        planId: plans[est.plan].id,
        ratingAvg: 4.2 + Math.random() * 0.7,
        ratingCount: 20 + Math.floor(Math.random() * 180),
        ordersCount: 50 + Math.floor(Math.random() * 500),
      },
    });

    for (const slug of est.categorySlugs) {
      await prisma.establishmentCategory.upsert({
        where: { establishmentId_categoryId: { establishmentId: establishment.id, categoryId: categories[slug].id } },
        update: {},
        create: { establishmentId: establishment.id, categoryId: categories[slug].id },
      });
    }

    const sectionCache: Record<string, { id: string }> = {};
    let sectionOrder = 0;
    for (const p of est.products) {
      if (!sectionCache[p.section]) {
        const sectionId = `${establishment.id}-section-${slugify(p.section)}`;
        sectionCache[p.section] = await prisma.menuSection.upsert({
          where: { id: sectionId },
          update: {},
          create: { id: sectionId, establishmentId: establishment.id, name: p.section, order: sectionOrder++ },
        });
      }
      const primaryCategoryId = categories[est.categorySlugs[0]]?.id;
      const productId = `${establishment.id}-product-${slugify(p.name)}`;
      await prisma.product.upsert({
        where: { id: productId },
        update: {},
        create: {
          id: productId,
          establishmentId: establishment.id,
          menuSectionId: sectionCache[p.section].id,
          categoryId: primaryCategoryId,
          name: p.name,
          description: p.description,
          imageUrl: img(`${est.slug}-${p.name}`, 600, 450),
          price: p.price,
          promoPrice: p.promoPrice,
          isCombo: p.isCombo ?? false,
          soldCount: p.soldCount ?? 0,
        },
      });
    }

    if (est.additions) {
      for (const a of est.additions) {
        const additionId = `${establishment.id}-addition-${slugify(a.name)}`;
        await prisma.additionItem.upsert({
          where: { id: additionId },
          update: {},
          create: { id: additionId, establishmentId: establishment.id, name: a.name, price: a.price },
        });
      }
    }

    await prisma.coupon.upsert({
      where: { code: `${est.slug.split("-")[0].toUpperCase()}10` },
      update: {},
      create: {
        establishmentId: establishment.id,
        code: `${est.slug.split("-")[0].toUpperCase()}10`,
        type: "PERCENT",
        value: 10,
        minOrderValue: 20,
      },
    });
  }

  // Suspende um estabelecimento de exemplo para demonstrar o painel admin
  await prisma.establishment.update({
    where: { slug: "sorveteria-polar" },
    data: { status: "SUSPENDED" },
  });

  const burguer = await prisma.establishment.findUniqueOrThrow({ where: { slug: "point-do-burguer" } });

  await prisma.favorite.upsert({
    where: { userId_establishmentId: { userId: customer.id, establishmentId: burguer.id } },
    update: {},
    create: { userId: customer.id, establishmentId: burguer.id },
  });

  const xbacon = await prisma.product.findUniqueOrThrow({ where: { id: `${burguer.id}-product-x-bacon` } });
  const address = await prisma.address.findUniqueOrThrow({ where: { id: "seed-address-customer" } });

  const order = await prisma.order.upsert({
    where: { code: "BQ-0001" },
    update: {},
    create: {
      code: "BQ-0001",
      customerId: customer.id,
      establishmentId: burguer.id,
      addressId: address.id,
      paymentMethod: "PIX",
      subtotal: 24,
      deliveryFee: 5,
      total: 29,
      status: "CONFIRMED",
      items: {
        create: [{ productId: xbacon.id, name: xbacon.name, unitPrice: xbacon.price, quantity: 1 }],
      },
    },
  });

  await prisma.review.upsert({
    where: { orderId: order.id },
    update: {},
    create: {
      establishmentId: burguer.id,
      customerId: customer.id,
      orderId: order.id,
      foodRating: 5,
      serviceRating: 5,
      deliveryRating: 4,
      comment: "Lanche excelente, chegou rápido!",
    },
  });

  // ---------- Banners ----------
  const banners = [
    { id: "seed-banner-frete-gratis", title: "Frete grátis nos combos até 20h", imageUrl: img("banner-frete-gratis", 1600, 500), order: 0 },
    { id: "seed-banner-pizza", title: "Semana da Pizza — até 15% OFF", imageUrl: img("banner-pizza", 1600, 500), order: 1 },
    { id: "seed-banner-novidades", title: "Novos estabelecimentos toda semana", imageUrl: img("banner-novidades", 1600, 500), order: 2 },
  ];
  for (const b of banners) {
    await prisma.banner.upsert({
      where: { id: b.id },
      update: {},
      create: { id: b.id, cityId: city.id, title: b.title, imageUrl: b.imageUrl, order: b.order },
    });
  }

  await prisma.notification.upsert({
    where: { id: "seed-notification-pedido-confirmado" },
    update: {},
    create: {
      id: "seed-notification-pedido-confirmado",
      userId: customer.id,
      title: "Pedido confirmado!",
      body: "Seu pedido no Point do Burguer foi confirmado.",
      type: "PEDIDO_CONFIRMADO",
    },
  });
  await prisma.notification.upsert({
    where: { id: "seed-notification-boas-vindas" },
    update: {},
    create: {
      id: "seed-notification-boas-vindas",
      userId: null,
      title: "Chegou o Boraqui em Varjota!",
      body: "Agora você encontra todos os deliveries da cidade em um só lugar.",
      type: "NOVO_ESTABELECIMENTO",
    },
  });

  console.log("Seed concluído.");
  console.log({ admin: admin.phone, merchant: merchantUser.phone, customer: customer.phone });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
