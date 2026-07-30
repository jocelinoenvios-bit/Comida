"use client";

import { useState } from "react";
import { ProductRow } from "./product-row";
import { ProductSheet, type SheetProduct } from "./product-sheet";
import type { CartEstablishment } from "@/store/cart";

export interface MenuSectionData {
  id: string;
  name: string;
  products: SheetProduct[];
}

export function EstablishmentMenu({
  sections,
  establishment,
}: {
  sections: MenuSectionData[];
  establishment: CartEstablishment;
}) {
  const [activeProduct, setActiveProduct] = useState<SheetProduct | null>(null);

  return (
    <div>
      {sections.map((section) => (
        <div key={section.id} id={`secao-${section.id}`} className="mb-2">
          <h3 className="mb-1 mt-4 text-base font-extrabold text-navy-900">{section.name}</h3>
          <div>
            {section.products.map((p) => (
              <ProductRow
                key={p.id}
                name={p.name}
                description={p.description}
                imageUrl={p.imageUrl}
                price={p.price}
                promoPrice={p.promoPrice}
                onClick={() => setActiveProduct(p)}
              />
            ))}
          </div>
        </div>
      ))}

      {activeProduct && (
        <ProductSheet
          product={activeProduct}
          establishment={establishment}
          onClose={() => setActiveProduct(null)}
        />
      )}
    </div>
  );
}
