const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const formatINR = (n) => inr.format(Math.round(n));

export const discountPct = (p) => (p.mrp > 0 ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0);

function couponDiscount(coupon, amount) {
  if (!coupon || amount < coupon.min) return 0;
  let d = coupon.type === 'percent' ? Math.round((amount * coupon.value) / 100) : coupon.value;
  if (coupon.maxDiscount) d = Math.min(d, coupon.maxDiscount);
  return Math.min(d, amount);
}

/**
 * Live cart preview. The backend (app/Services/Pricing.php) recomputes the same numbers when the
 * order is placed, so this only needs to match it, not be trusted.
 *
 * lines: [{ product, qty }]; coupon: { code, type, value, min, maxDiscount } from /coupons/apply;
 * settings: shop rules from /site.
 * Buy 1 Get 1: all units are sorted by price (high → low) and every second unit is free,
 * so the customer always gets the lower-priced item of each pair.
 */
export function computeTotals(lines, coupon, settings) {
  const units = lines.flatMap(({ product, qty }) => Array(qty).fill(product.price)).sort((a, b) => b - a);
  const itemCount = units.length;
  const subtotal = units.reduce((s, p) => s + p, 0);
  const mrpTotal = lines.reduce((s, { product, qty }) => s + product.mrp * qty, 0);
  const b1g1Discount = settings.b1g1Enabled ? units.reduce((s, p, i) => (i % 2 === 1 ? s + p : s), 0) : 0;
  const afterOffer = subtotal - b1g1Discount;

  const discount = couponDiscount(coupon, afterOffer);
  const couponNote = coupon && afterOffer < coupon.min ? `Add ${formatINR(coupon.min - afterOffer)} more to use ${coupon.code}` : '';

  const payable = afterOffer - discount;
  const shipping = itemCount === 0 || payable >= settings.freeShippingMin ? 0 : settings.shippingFee;
  const total = payable + shipping;

  return {
    itemCount,
    subtotal,
    mrpTotal,
    mrpSavings: mrpTotal - subtotal,
    b1g1Discount,
    couponDiscount: discount,
    couponNote,
    shipping,
    total,
    totalSavings: mrpTotal - payable,
    needsOneMoreForFree: settings.b1g1Enabled && itemCount % 2 === 1,
  };
}
