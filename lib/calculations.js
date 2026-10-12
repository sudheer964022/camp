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

// Patient discount logic:
// System discount tiers (10% and 20%) removed as requested.
export function systemDiscountPct(b2c) {
  return 0;
}

// What the patient actually pays for a profile whose Profile Price total is `b2c`.
// If staff enters a manual custom/discounted price below b2c, it is applied.
// Returns: { original, systemPct, systemPrice, systemDiscount, hasManual, price, isDiscounted }
export function patientPrice(b2c, manual) {
  const systemPct = 0;
  const systemPrice = b2c;
  const hasManual = typeof manual === 'number' && manual > 0 && manual < b2c;
  const price = hasManual ? manual : b2c;
  return {
    original: b2c,
    systemPct: 0,
    systemPrice: b2c,
    systemDiscount: 0,
    hasManual,
    price,
    isDiscounted: price < b2c,
  };
}
