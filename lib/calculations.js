export function margin(test) {
  return (test.b2c || 0) - (test.b2b || 0);
}

export function marginPercentage(b2b, b2c) {
  if (!b2b) return 0;
  return (((b2c - b2b) / b2b) * 100);
}

const MPB_FLOOR = 100;

export function isSerumSample(test) {
  return test.sampleId === "serum";
}

export function mpbFloor(raw) {
  return raw > 0 && raw < MPB_FLOOR ? MPB_FLOOR : raw;
}

export function netB2bWithMpb(items) {
  const raw = items.reduce((sum, t) => sum + (t.b2b || 0), 0);
  return items.some(isSerumSample) ? mpbFloor(raw) : raw;
}

export function totals(items) {
  const b2b = items.reduce((sum, t) => sum + (t.b2b || 0), 0);
  const b2c = items.reduce((sum, t) => sum + (t.b2c || 0), 0);
  const netB2b = netB2bWithMpb(items);

  return {
    b2b,
    b2c,
    netB2b,
    margin: b2c - b2b,
    marginPercentage: marginPercentage(b2b, b2c),
    netMargin: b2c - netB2b,
    netMarginPercentage: marginPercentage(netB2b, b2c),
  };
}

export function packagePricing(pkg) {
  const p = pkg.pricing || { b2b: 0, b2c: 0 };
  return {
    b2b: p.b2b,
    b2c: p.b2c,
    margin: p.b2c - p.b2b,
    marginPercentage: marginPercentage(p.b2b, p.b2c),
  };
}

export function cartTotals(individualItems = [], bundlePkgs = []) {
  const rawB2b = individualItems.reduce((sum, t) => sum + (t.b2b || 0), 0);
  const rawB2c = individualItems.reduce((sum, t) => sum + (t.b2c || 0), 0);
  const bundlesB2b = bundlePkgs.reduce((sum, p) => sum + (p.pricing?.b2b || 0), 0);
  const bundlesB2c = bundlePkgs.reduce((sum, p) => sum + (p.pricing?.b2c || 0), 0);
  const netIndivB2b = netB2bWithMpb(individualItems);
  const netB2b = netIndivB2b + bundlesB2b;
  const b2c = rawB2c + bundlesB2c;
  const b2b = rawB2b + bundlesB2b;
  return {
    b2b,
    b2c,
    netB2b,
    margin: b2c - b2b,
    marginPercentage: marginPercentage(b2b, b2c),
    netMargin: b2c - netB2b,
    netMarginPercentage: marginPercentage(netB2b, b2c),
  };
}

// System-driven patient discount tiers (mirrors BBC App calculations.js):
// > ₹2,000 → 20% off, > ₹1,000 → 10% off, else 0%.
// Checked highest tier first; strictly "more than" — exactly ₹1,000 / ₹2,000 stays in the lower tier.
const SYSTEM_DISCOUNT_TIERS = [
  { above: 2000, pct: 20 },
  { above: 1000, pct: 10 },
];

export function systemDiscountPct(b2c) {
  const tier = SYSTEM_DISCOUNT_TIERS.find((t) => b2c > t.above);
  return tier ? tier.pct : 0;
}

// What the patient actually pays for a profile whose Profile Price total is `b2c`.
// The system discount always applies automatically.
// A staff-typed `manual` price only takes over when it goes *below* the system price —
// it's an extra discount on top, never a way to charge more than the system price.
// Returns: { original, systemPct, systemPrice, systemDiscount, hasManual, price, isDiscounted }
export function patientPrice(b2c, manual) {
  const systemPct = systemDiscountPct(b2c);
  const systemPrice = Math.round(b2c * (100 - systemPct) / 100);
  const hasManual = typeof manual === 'number' && manual > 0 && manual < systemPrice;
  const price = hasManual ? manual : systemPrice;
  return {
    original: b2c,
    systemPct,
    systemPrice,
    systemDiscount: b2c - systemPrice,
    hasManual,
    price,
    isDiscounted: price < b2c,
  };
}
