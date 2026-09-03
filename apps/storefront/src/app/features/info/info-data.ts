import type { Lang } from '../../core/i18n/translations';

/**
 * Static customer-information pages rendered by the `InfoPage` component.
 * Each page is keyed by its URL slug and provides bilingual content.
 *
 * The `body` fields are trusted developer-authored HTML rendered via
 * `[innerHTML]` — Angular's built-in sanitiser strips dangerous constructs
 * (scripts, event handlers) automatically.
 */
export interface InfoSection {
  heading?: string;
  body: string;
}

export interface InfoPageContent {
  title: string;
  sections: InfoSection[];
}

export interface InfoPage {
  slug: string;
  content: Record<Lang, InfoPageContent>;
}

export const INFO_PAGES: Record<string, InfoPage> = {
  szallitas: {
    slug: 'szallitas',
    content: {
      hu: {
        title: 'Szállítás',
        sections: [
          {
            heading: 'Számítógépes szállítási idő',
            body: '<p>Minden rendelést 1-3 munkanapon belül feladunk. A várható átfutási idő a célországtól függ:</p><ul><li><strong>Magyarország:</strong> 1-2 munkanap</li><li><strong>Európai Unió:</strong> 3-5 munkanap</li><li><strong>Európán kívül:</strong> 5-10 munkanap</li></ul>',
          },
          {
            heading: 'Szállítási díjak',
            body: '<p>A szállítási díj a pénztárnál kerül kiszámításra a célország és a rendelés értéke alapján. 30 000 Ft feletti rendelések esetén ingyenes a szállítás Magyarország területén.</p>',
          },
          {
            heading: 'Nyomon követés',
            body: '<p>Miután a csomag feladásra kerül, email-ben kap egy követőszámot, amellyel valós időben nyomon követheti a szállítás állapotát.</p>',
          },
        ],
      },
      en: {
        title: 'Shipping & Delivery',
        sections: [
          {
            heading: 'Processing time',
            body: '<p>All orders are dispatched within 1-3 business days. Estimated transit times depend on the destination:</p><ul><li><strong>Hungary:</strong> 1-2 business days</li><li><strong>EU:</strong> 3-5 business days</li><li><strong>Rest of the world:</strong> 5-10 business days</li></ul>',
          },
          {
            heading: 'Shipping costs',
            body: '<p>Shipping is calculated at checkout based on the destination country and order value. Orders over 30 000 HFT ship free within Hungary.</p>',
          },
          {
            heading: 'Tracking',
            body: '<p>Once your parcel is dispatched you will receive a tracking number by email so you can follow its journey in real time.</p>',
          },
        ],
      },
    },
  },

  visszakuldes: {
    slug: 'visszakuldes',
    content: {
      hu: {
        title: 'Visszaküldés',
        sections: [
          {
            heading: '14 napos visszaküldési jog',
            body: '<p>Megrendelésétől számított 14 napon belül indokolás nélkül elállhat a vásárlástól. A visszaküldött terméknek eredeti, használatlan állapotban kell lennie, az összes címkével és csomagolással együtt.</p>',
          },
          {
            heading: 'Hogyan kezdeményez visszaküldést?',
            body: '<ol><li>Lépjen kapcsolatba ügyfélszolgálatunkkal a rendelési szám megadásával.</li><li>Címkézze fel a csomagot a kapott visszaküldési címre.</li><li>Adja le a csomagot a futárszolgálatnál.</li></ol>',
          },
          {
            heading: 'Visszatérítés',
            body: '<p>A visszatérítést a termék beérkezését követő 5 munkanapon belül teljesítjük az eredeti fizetési módra. A szállítási költség nem része a visszatérítésnek.</p>',
          },
        ],
      },
      en: {
        title: 'Returns',
        sections: [
          {
            heading: '14-day return policy',
            body: '<p>You may return any item within 14 days of receiving your order, no reason required. Returned items must be in their original, unused condition with all tags and packaging intact.</p>',
          },
          {
            heading: 'How to start a return',
            body: '<ol><li>Contact customer service with your order number.</li><li>Label your parcel with the provided return address.</li><li>Drop off the parcel at the carrier.</li></ol>',
          },
          {
            heading: 'Refunds',
            body: '<p>Refunds are processed within 5 business days of receiving the returned item, to the original payment method. Original shipping costs are non-refundable.</p>',
          },
        ],
      },
    },
  },

  'gyakori-kerdesek': {
    slug: 'gyakori-kerdesek',
    content: {
      hu: {
        title: 'Gyakori kérdések',
        sections: [
          {
            heading: 'Mikor érkezik meg a rendelésem?',
            body: '<p>A rendeléseket 1-3 munkanapon belül feladjuk. A pontos érkezési idő a célországtól függ — részletekért tekintse meg a Szállítás oldalt.</p>',
          },
          {
            heading: 'Módosíthatom vagy lemondhatom a rendelésem?',
            body: '<p>Feladás előtt igen — lépjen kapcsolatba velünk minél hamarabb. Miután a csomag feladásra került, a módosítás már nem lehetséges, de a visszaküldési jog továbbra is érvényes.</p>',
          },
          {
            heading: 'Milyen fizetési módokat fogadnak el?',
            body: '<p>Bankkártyát (Visa, Mastercard, American Express) az Stripe-on keresztül, valamint PayPal, Apple Pay, Google Pay és utánvétet.</p>',
          },
          {
            heading: 'Hogyan használjam a kedvezménykódot?',
            body: '<p>A kódot a pénztár oldalon, a „Kedvezménykód" mezőben adhatja meg. A kedvezmény azonnal megjelenik a rendelés összesítőjében.</p>',
          },
        ],
      },
      en: {
        title: 'FAQ',
        sections: [
          {
            heading: 'When will my order arrive?',
            body: '<p>Orders are dispatched within 1-3 business days. Exact delivery time depends on your country — see the Shipping page for details.</p>',
          },
          {
            heading: 'Can I modify or cancel my order?',
            body: '<p>Yes, before dispatch — contact us as soon as possible. Once the parcel is shipped, modifications are no longer possible, but the return policy still applies.</p>',
          },
          {
            heading: 'What payment methods do you accept?',
            body: '<p>Cards (Visa, Mastercard, American Express) via Stripe, as well as PayPal, Apple Pay, Google Pay and cash on delivery.</p>',
          },
          {
            heading: 'How do I use a discount code?',
            body: '<p>Enter your code in the "Discount code" field at checkout. The discount is applied to your order summary immediately.</p>',
          },
        ],
      },
    },
  },

  'meret-tablazat': {
    slug: 'meret-tablazat',
    content: {
      hu: {
        title: 'Méret táblázat',
        sections: [
          {
            heading: 'Felsőruházat (pólók, pulóverek, kabátok)',
            body: '<table class="w-full text-sm"><thead><tr class="border-b border-(--color-store-border)"><th class="py-2 text-left">Méret</th><th class="py-2 text-left">Mell (cm)</th><th class="py-2 text-left">Hossz (cm)</th><th class="py-2 text-left">Váll (cm)</th></tr></thead><tbody><tr class="border-b border-(--color-store-border)"><td class="py-2">XS</td><td class="py-2">46</td><td class="py-2">66</td><td class="py-2">42</td></tr><tr class="border-b border-(--color-store-border)"><td class="py-2">S</td><td class="py-2">50</td><td class="py-2">68</td><td class="py-2">44</td></tr><tr class="border-b border-(--color-store-border)"><td class="py-2">M</td><td class="py-2">54</td><td class="py-2">70</td><td class="py-2">46</td></tr><tr class="border-b border-(--color-store-border)"><td class="py-2">L</td><td class="py-2">58</td><td class="py-2">72</td><td class="py-2">48</td></tr><tr><td class="py-2">XL</td><td class="py-2">62</td><td class="py-2">74</td><td class="py-2">50</td></tr></tbody></table>',
          },
          {
            heading: 'Hogyan mérjek?',
            body: '<p>A mellbőséget a hónaljaknál mérve, a legszélesebb ponton vegye. A hosszt a váll varrata tetejétől az alsó szegélyig mérje. Ha két méret között van, válassza a nagyobbat a kényelmesebb viseletért.</p>',
          },
        ],
      },
      en: {
        title: 'Size Guide',
        sections: [
          {
            heading: 'Tops (t-shirts, hoodies, jackets)',
            body: '<table class="w-full text-sm"><thead><tr class="border-b border-(--color-store-border)"><th class="py-2 text-left">Size</th><th class="py-2 text-left">Chest (cm)</th><th class="py-2 text-left">Length (cm)</th><th class="py-2 text-left">Shoulder (cm)</th></tr></thead><tbody><tr class="border-b border-(--color-store-border)"><td class="py-2">XS</td><td class="py-2">46</td><td class="py-2">66</td><td class="py-2">42</td></tr><tr class="border-b border-(--color-store-border)"><td class="py-2">S</td><td class="py-2">50</td><td class="py-2">68</td><td class="py-2">44</td></tr><tr class="border-b border-(--color-store-border)"><td class="py-2">M</td><td class="py-2">54</td><td class="py-2">70</td><td class="py-2">46</td></tr><tr class="border-b border-(--color-store-border)"><td class="py-2">L</td><td class="py-2">58</td><td class="py-2">72</td><td class="py-2">48</td></tr><tr><td class="py-2">XL</td><td class="py-2">62</td><td class="py-2">74</td><td class="py-2">50</td></tr></tbody></table>',
          },
          {
            heading: 'How to measure',
            body: '<p>Measure the chest at the widest point under the armpits. Measure the length from the top of the shoulder seam to the bottom hem. If you are between sizes, choose the larger one for a more comfortable fit.</p>',
          },
        ],
      },
    },
  },

  rolunk: {
    slug: 'rolunk',
    content: {
      hu: {
        title: 'Rólunk',
        sections: [
          {
            body: '<p>Az ULTRAS SHOP 2024-ben indult egyetlen céllal: minőségi, tartós utcai viseletet kínálni, amely nem követ kompromisszumot a stílus és a fenntarthatóság között. Minden darabot kis szériában, gondosan kiválasztott partnereinkkel készítünk.</p>',
          },
          {
            heading: 'Küldetésünk',
            body: '<p>Hisszük, hogy a divat lehet egyszerre felelős és kifejező. Olyan ruhákat készítünk, amelyeket évekig hordhat — nem egy szezonra.</p>',
          },
          {
            heading: 'Az csapatunk',
            body: '<p>Egy kis, szenvedélyes csapat vagyunk Budapesten. Tervezők, varrónők és logisztikai szakemberek, akik mind egyetlen közös célért dolgoznak: hogy minden rendelés tökéletes legyen.</p>',
          },
        ],
      },
      en: {
        title: 'Our Story',
        sections: [
          {
            body: '<p>ULTRAS SHOP launched in 2024 with a single goal: to offer quality, durable streetwear that makes no compromise between style and sustainability. Every piece is produced in small batches with carefully selected partners.</p>',
          },
          {
            heading: 'Our mission',
            body: '<p>We believe fashion can be both responsible and expressive. We make clothes you can wear for years — not just a season.</p>',
          },
          {
            heading: 'Our team',
            body: '<p>We are a small, passionate team based in Budapest. Designers, tailors and logistics specialists all working towards one common goal: making every order perfect.</p>',
          },
        ],
      },
    },
  },

  fenntarthatosag: {
    slug: 'fenntarthatosag',
    content: {
      hu: {
        title: 'Fenntarthatóság',
        sections: [
          {
            heading: 'Anyagok',
            body: '<p>Termékeink 100% organikus pamutból (GOTS tanúsított) és újrahasznosított poliészterből készülnek. A csomagolásunk újrahasznosított és biológiailag lebomló anyagokból áll.</p>',
          },
          {
            heading: 'Gyártás',
            body: '<p>Választott gyártóink mind fair trade tanúsítvánnyal rendelkeznek. Kis szériákban dolgozunk a túlzott termelés elkerülése érdekében, és a maradék anyagokat újrahasznosítjuk.</p>',
          },
          {
            heading: 'Szénlábnyom',
            body: '<p>Minden szállítás szén-dioxid-kompenzációval történ. Évente jelentést teszünk közzé a környezeti hatásunkról és a céljainkról.</p>',
          },
        ],
      },
      en: {
        title: 'Sustainability',
        sections: [
          {
            heading: 'Materials',
            body: '<p>Our products are made from 100% organic cotton (GOTS certified) and recycled polyester. Our packaging is recycled and biodegradable.</p>',
          },
          {
            heading: 'Manufacturing',
            body: '<p>All our manufacturing partners are fair-trade certified. We work in small batches to avoid overproduction and recycle leftover fabrics.</p>',
          },
          {
            heading: 'Carbon footprint',
            body: '<p>Every shipment is carbon-offset. We publish an annual report on our environmental impact and goals.</p>',
          },
        ],
      },
    },
  },

  adatvedelem: {
    slug: 'adatvedelem',
    content: {
      hu: {
        title: 'Adatvédelem',
        sections: [
          {
            heading: 'Milyen adatokat gyűjtünk?',
            body: '<p>A rendelés teljesítéséhez szükséges adatokat: nevet, email címet, szállítási címet és telefonszámot. Fizetési adatokat nem tárolunk — a tranzakciókat a Stripe és a PayPal kezeli.</p>',
          },
          {
            heading: 'Hogyan használjuk az adatokat?',
            body: '<p>A személyes adatait kizárólag a rendelés teljesítésére, az ügyfélszolgálatra és (az Ön beleegyezésével) hírlevél küldésére használjuk. Soha nem adjuk el az adatait harmadik feleknek.</p>',
          },
          {
            heading: 'Az Ön jogai',
            body: '<p>A GDPR alapján bármikor kérheti adatai megtekintését, módosítását vagy törlését. Ehhez írjon nekünk email-t az oldal alján található címre.</p>',
          },
        ],
      },
      en: {
        title: 'Privacy Policy',
        sections: [
          {
            heading: 'What data we collect',
            body: '<p>We collect the data needed to fulfil your order: name, email address, shipping address and phone number. We do not store payment data — transactions are handled by Stripe and PayPal.</p>',
          },
          {
            heading: 'How we use your data',
            body: '<p>Your personal data is used solely for order fulfilment, customer support and (with your consent) newsletter delivery. We never sell your data to third parties.</p>',
          },
          {
            heading: 'Your rights',
            body: '<p>Under GDPR you may request to view, correct or delete your data at any time. Email us at the address listed at the bottom of this page.</p>',
          },
        ],
      },
    },
  },

  aszf: {
    slug: 'aszf',
    content: {
      hu: {
        title: 'Általános szerződési feltételek',
        sections: [
          {
            heading: '1. A feltételek hatálya',
            body: '<p>Ezek az általános szerződési feltételek (ÁSZF) minden az ULTRAS SHOP webáruházában leadott rendelésre vonatkoznak. A rendelés leadásával Ön elfogadja ezeket a feltételeket.</p>',
          },
          {
            heading: '2. Szerződés létrejötte',
            body: '<p>A szerződés a rendelés visszaigazolásának e-mailjével jön létre. Fenntartjuk a jogot, hogy olyan rendeléseket töröljünk, amelyeknél technikai hiba vagy egyértelmű tévesztés történt az árazásban.</p>',
          },
          {
            heading: '3. Árak és fizetés',
            body: '<p>Minden ár a kosárban és a pénztárnál forintban (HUF) vagy a választott pénznemben jelenik meg, az áfát tartalmazza. A fizetés a pénztár oldalon történik biztonságos szolgáltatókon keresztül.</p>',
          },
          {
            heading: '4. Tulajdonjog átszállása',
            body: '<p>A termék tulajdonjoga a teljes vételár beérkezésekor száll át Önre. A terméket a szállításig a saját kockázatunkra tároljuk.</p>',
          },
          {
            heading: '5. Panaszkezelés',
            body: '<p>Panasza esetén írjon nekünk email-t. A panaszt 30 napon belül megvizsgáljuk és válaszolunk. Online vitarendelkezésre az Európai Bizottság platformján is lehetősége van.</p>',
          },
        ],
      },
      en: {
        title: 'Terms & Conditions',
        sections: [
          {
            heading: '1. Scope',
            body: '<p>These terms and conditions apply to every order placed on the ULTRAS SHOP online store. By placing an order you agree to these terms.</p>',
          },
          {
            heading: '2. Formation of contract',
            body: '<p>The contract is formed when the order confirmation email is sent. We reserve the right to cancel orders affected by technical errors or obvious pricing mistakes.</p>',
          },
          {
            heading: '3. Prices and payment',
            body: '<p>All prices are shown in HUF or your selected currency at the cart and checkout, including VAT. Payment is made on the checkout page via secure providers.</p>',
          },
          {
            heading: '4. Transfer of ownership',
            body: '<p>Ownership of the goods transfers to you upon receipt of the full purchase price. We store the goods at our own risk until dispatch.</p>',
          },
          {
            heading: '5. Complaints',
            body: '<p>To file a complaint, email us. We investigate and respond within 30 days. Online dispute resolution is also available on the European Commission platform.</p>',
          },
        ],
      },
    },
  },
};

/** Slugs for the two footer link groups, in display order. */
export const CUSTOMER_CARE_SLUGS = ['szallitas', 'visszakuldes', 'gyakori-kerdesek', 'meret-tablazat'];
export const ABOUT_SLUGS = ['rolunk', 'fenntarthatosag', 'adatvedelem', 'aszf'];
