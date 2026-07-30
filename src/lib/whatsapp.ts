import { PAYMENT_LABELS, PaymentMethod } from "./constants";
import { formatCurrency, formatPhoneForWhatsApp } from "./format";

export interface WhatsAppOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  observations?: string;
  additions?: { name: string; price: number }[];
}

export interface WhatsAppOrderInput {
  establishmentName: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  address?: string;
  paymentMethod: PaymentMethod;
  items: WhatsAppOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  total: number;
  couponCode?: string | null;
  observations?: string;
}

export function buildWhatsAppMessage(order: WhatsAppOrderInput): string {
  const lines: string[] = [];

  lines.push(`Olá, *${order.establishmentName}*! 👋`);
  lines.push(`Gostaria de fazer o seguinte pedido pelo *Boraqui* (${order.orderCode}):`);
  lines.push("");
  lines.push(`*Cliente:* ${order.customerName}`);
  lines.push(`*Telefone:* ${order.customerPhone}`);
  if (order.address) lines.push(`*Endereço:* ${order.address}`);
  lines.push(`*Forma de pagamento:* ${PAYMENT_LABELS[order.paymentMethod]}`);
  lines.push("");
  lines.push("*Itens:*");
  for (const item of order.items) {
    lines.push(`▪ ${item.quantity}x ${item.name} — ${formatCurrency(item.unitPrice * item.quantity)}`);
    if (item.additions?.length) {
      for (const add of item.additions) {
        lines.push(`   + ${add.name}${add.price ? ` (${formatCurrency(add.price)})` : ""}`);
      }
    }
    if (item.observations) lines.push(`   obs: ${item.observations}`);
  }
  lines.push("");
  lines.push(`Subtotal: ${formatCurrency(order.subtotal)}`);
  lines.push(`Taxa de entrega: ${formatCurrency(order.deliveryFee)}`);
  if (order.discount) {
    lines.push(`Desconto${order.couponCode ? ` (${order.couponCode})` : ""}: -${formatCurrency(order.discount)}`);
  }
  lines.push(`*Total: ${formatCurrency(order.total)}*`);
  if (order.observations) {
    lines.push("");
    lines.push(`*Observações:* ${order.observations}`);
  }
  lines.push("");
  lines.push("Pedido gerado automaticamente pelo Boraqui 🧡");

  return lines.join("\n");
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = formatPhoneForWhatsApp(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
