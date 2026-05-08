import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { tier, total, extraPages = 0, addCopy = false, customer = {}, business = {} } = body || {};

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

  if (!STRIPE_KEY) {
    return NextResponse.json({
      fallback: true,
      message: "Stripe key not configured. Set STRIPE_SECRET_KEY in .env.local.",
    });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(STRIPE_KEY);

    const tierName =
      tier === "page" ? "Express Page"
        : tier === "site" ? "Express Site"
        : tier === "backoffice" ? "Express Backoffice"
        : "Flowwwzy Express";

    const lineItems: { price_data: { currency: string; product_data: { name: string; description?: string }; unit_amount: number }; quantity: number }[] = [];

    const basePrice =
      tier === "page" ? 49000
        : tier === "site" ? 89000
        : tier === "backoffice" ? 149000
        : 49000;
    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: { name: tierName, description: business?.name ? `Para ${business.name}` : undefined },
        unit_amount: basePrice,
      },
      quantity: 1,
    });

    if (addCopy) {
      lineItems.push({
        price_data: { currency: "eur", product_data: { name: "Copywriting profissional" }, unit_amount: 20000 },
        quantity: 1,
      });
    }

    if (extraPages > 0) {
      lineItems.push({
        price_data: { currency: "eur", product_data: { name: "Páginas extra" }, unit_amount: 15000 },
        quantity: extraPages,
      });
    }

    const origin = req.headers.get("origin") || "https://start.flowwwzy.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: customer?.email,
      metadata: {
        tier: tier || "",
        businessName: business?.name || "",
        customerName: customer?.name || "",
        phone: customer?.phone || "",
      },
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=1#preview`,
      locale: "pt",
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[checkout] error", e);
    return NextResponse.json({ fallback: true, error: "checkout_failed" }, { status: 500 });
  }
}
