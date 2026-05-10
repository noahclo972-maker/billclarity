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
    const sessionId = body.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing checkout session ID." },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id || "";

    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id || "";

    if (!customerId) {
      return NextResponse.json(
        { error: "No Stripe customer ID found on checkout session." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      customerId,
      subscriptionId,
      paymentStatus: session.payment_status,
      status: session.status,
    });
  } catch (error) {
    console.error("Confirm checkout error:");
    console.error(error);

    return NextResponse.json(
      { error: "Could not confirm checkout session. Check PowerShell." },
      { status: 500 }
    );
  }
}