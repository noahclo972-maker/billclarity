import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY in .env.local" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    const body = await request.json();
    const plan = body.plan;

    if (plan !== "plus" && plan !== "pro") {
      return NextResponse.json(
        { error: "Invalid plan. Use plus or pro." },
        { status: 400 }
      );
    }

    const priceId =
      plan === "plus"
        ? process.env.NEXT_PUBLIC_STRIPE_PLUS_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: `Missing Stripe price ID for ${plan} plan.` },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      // Stripe replaces {CHECKOUT_SESSION_ID} after successful payment.
      success_url: `${appUrl}/pricing?success=true&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:");
    console.error(error);

    return NextResponse.json(
      { error: "Checkout could not be started. Check PowerShell." },
      { status: 500 }
    );
  }
}