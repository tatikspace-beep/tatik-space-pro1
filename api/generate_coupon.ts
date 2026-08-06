import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const couponCode = `TATIK_SPECIAL_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);

  res.status(200).json({
    success: true,
    couponCode,
    email: "tati01sp@gmail.com",
    discountPercentage: 100,
    expiresAt: expiryDate.toISOString(),
    message: "Use this coupon code on checkout for 100% discount",
  });
}
