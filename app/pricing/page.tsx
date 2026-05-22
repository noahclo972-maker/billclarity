"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Plan = "free" | "plus" | "pro";

export default function PricingPage() {
  const [error, setError] = useState("");
  const [loadingPlan, setLoadingPlan] = useState("");
  const [currentPlan, setCurrentPlan] = useState<Plan>("free");
  const [customerId, setCustomerId] = useState("");

  useEffect(() => {
    async function handleStripeSuccess() {
      const params = new URLSearchParams(window.location.search);
      const success = params.get("success");
      const plan = params.get("plan");
      const sessionId = params.get("session_id");

      if (success === "true" && (plan === "plus" || plan === "pro")) {
        localStorage.setItem("billclarity_subscription", plan);
        setCurrentPlan(plan);

        if (sessionId) {
          try {
            const response = await fetch("/api/confirm-checkout-session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sessionId,
              }),
            });

            const responseText = await response.text();

            let data;

            try {
              data = responseText ? JSON.parse(responseText) : {};
            } catch {
              console.error(
                "Confirm checkout did not return JSON:",
                responseText
              );
              setError(
                "Your payment was completed, but we could not finish loading your subscription details. Please refresh or contact support."
              );
              window.history.replaceState({}, "", "/pricing");
              return;
            }

            if (response.ok && data.customerId) {
              localStorage.setItem(
                "billclarity_stripe_customer_id",
                data.customerId
              );

              localStorage.setItem(
                "billclarity_subscription_status",
                JSON.stringify({
                  tier: plan,
                  status: "active",
                  stripeCustomerId: data.customerId,
                  stripeSubscriptionId: data.subscriptionId || "",
                  updatedAt: new Date().toISOString(),
                })
              );

              setCustomerId(data.customerId);
            } else {
              console.error("Could not save customer ID:", data.error);
              setError(
                data.error ||
                  "Your payment was completed, but subscription management could not be set up automatically."
              );
            }
          } catch (error) {
            console.error("Confirm checkout failed:", error);
            setError(
              "Your payment was completed, but subscription management could not be set up automatically."
            );
          }
        }

        window.history.replaceState({}, "", "/pricing");
        return;
      }

      const savedPlan = localStorage.getItem("billclarity_subscription");
      const savedCustomerId = localStorage.getItem(
        "billclarity_stripe_customer_id"
      );

      if (savedPlan === "plus" || savedPlan === "pro") {
        setCurrentPlan(savedPlan);
      } else {
        setCurrentPlan("free");
      }

      if (savedCustomerId) {
        setCustomerId(savedCustomerId);
      }
    }

    handleStripeSuccess();
  }, []);

  async function startCheckout(plan: "plus" | "pro") {
    setError("");
    setLoadingPlan(plan);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const responseText = await response.text();

      let data;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        setError("Checkout could not be started. Please try again.");
        setLoadingPlan("");
        return;
      }

      if (!response.ok) {
        setError(data.error || "Checkout could not be started.");
        setLoadingPlan("");
        return;
      }

      if (!data.url) {
        setError("Stripe did not return a checkout link.");
        setLoadingPlan("");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      setError("Checkout could not be started. Please try again.");
      setLoadingPlan("");
    }
  }

  async function openCustomerPortal() {
    setError("");

    const savedCustomerId =
      customerId || localStorage.getItem("billclarity_stripe_customer_id");

    if (!savedCustomerId) {
      setError(
        "We could not find your subscription management details. Please complete checkout again or contact support."
      );
      return;
    }

    try {
      const response = await fetch("/api/create-customer-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: savedCustomerId,
        }),
      });

      const responseText = await response.text();

      let data;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        setError("Subscription management could not be opened.");
        return;
      }

      if (!response.ok) {
        setError(data.error || "Subscription management could not be opened.");
        return;
      }

      if (!data.url) {
        setError("Stripe did not return a subscription management link.");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      setError("Subscription management could not be opened.");
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="text-green-400 hover:underline">
          Back Home
        </Link>

        <h1 className="mt-8 mb-4 text-center text-4xl font-bold text-green-400">
          Pricing
        </h1>

        <p className="mb-4 text-center text-gray-300">
          Choose the plan that fits how often you need help reviewing bills,
          statements, and confusing charges.
        </p>

        <div className="mx-auto mb-8 max-w-xl rounded-lg border border-green-900 bg-gray-900 p-4 text-center">
          <p className="text-gray-300">
            Current plan:{" "}
            <span className="font-bold text-green-400 uppercase">
              {currentPlan}
            </span>
          </p>

          {(currentPlan === "plus" || currentPlan === "pro") && (
            <button
              onClick={openCustomerPortal}
              className="mt-4 rounded-lg bg-green-500 px-5 py-2 font-bold text-black hover:bg-green-400"
            >
              Manage Subscription
            </button>
          )}
        </div>

        {error && (
          <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-red-500 bg-red-950 p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <PlanCard
            name="Free"
            price="$0/month"
            features={[
              "1 free bill scan per month",
              "Basic bill summary",
              "Basic red flag detection",
              "Saved reports on this device",
            ]}
            buttonText={currentPlan === "free" ? "Current Plan" : "Use Free"}
            onClick={() => {
              localStorage.setItem("billclarity_subscription", "free");
              setCurrentPlan("free");
              window.location.href = "/analyze";
            }}
            disabled={currentPlan === "free"}
          />

          <PlanCard
            name="Plus"
            price="$6.99/month"
            features={[
              "50 bill scans per month",
              "Full reports",
              "Hidden fee review",
              "Message generator",
              "PDF export",
            ]}
            buttonText={
              currentPlan === "plus"
                ? "Current Plan"
                : loadingPlan === "plus"
                ? "Opening Stripe..."
                : "Upgrade to Plus"
            }
            onClick={() => startCheckout("plus")}
            highlighted
            disabled={currentPlan === "plus" || loadingPlan !== ""}
          />

          <PlanCard
            name="Pro"
            price="$14.99/month"
            features={[
              "Unlimited bill scans",
              "Advanced reports",
              "Advanced red flag review",
              "Message tone options",
              "PDF export",
            ]}
            buttonText={
              currentPlan === "pro"
                ? "Current Plan"
                : loadingPlan === "pro"
                ? "Opening Stripe..."
                : "Upgrade to Pro"
            }
            onClick={() => startCheckout("pro")}
            disabled={currentPlan === "pro" || loadingPlan !== ""}
          />
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/analyze"
            className="inline-block rounded-lg bg-green-500 px-6 py-3 font-bold text-black hover:bg-green-400"
          >
            Go to Analyze
          </Link>
        </div>
      </div>
    </main>
  );
}

function PlanCard({
  name,
  price,
  features,
  buttonText,
  onClick,
  highlighted,
  disabled,
}: {
  name: string;
  price: string;
  features: string[];
  buttonText: string;
  onClick: () => void;
  highlighted?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={
        highlighted
          ? "rounded-xl border-2 border-green-500 bg-gray-900 p-6"
          : "rounded-xl border border-green-900 bg-gray-900 p-6"
      }
    >
      <h2 className="mb-2 text-2xl font-bold text-white">{name}</h2>

      <p className="mb-6 text-4xl font-bold text-green-400">{price}</p>

      <ul className="mb-8 space-y-3 text-gray-300">
        {features.map((feature) => (
          <li key={feature}>✓ {feature}</li>
        ))}
      </ul>

      <button
        onClick={onClick}
        disabled={disabled}
        className={
          highlighted
            ? "block w-full rounded-lg bg-green-500 px-6 py-3 text-center font-bold text-black hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            : "block w-full rounded-lg border border-green-500 px-6 py-3 text-center font-bold text-green-400 hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        {buttonText}
      </button>
    </div>
  );
}