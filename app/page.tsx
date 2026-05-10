"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="mb-6">
          <p className="text-green-400 font-semibold tracking-wide uppercase">
            BillClarity
          </p>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Stop guessing what your bills actually mean.
        </h1>

        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
          Upload a bill, contract, policy, statement, or charge notice and get a
          clear breakdown of confusing fees, hidden costs, deadlines, and what
          to ask before you pay.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/analyze"
            className="bg-green-500 text-black px-8 py-4 rounded-lg font-bold hover:bg-green-400 transition"
          >
            Analyze My Bill
          </Link>

          <a
            href="#how-it-works"
            className="border border-green-500 text-green-400 px-8 py-4 rounded-lg font-bold hover:bg-green-500/10 transition"
          >
            See How It Works
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-green-400 mb-12">
          What BillClarity Helps With
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            title="Plain-English Breakdown"
            description="Turn confusing wording into simple explanations you can actually understand."
          />

          <FeatureCard
            title="Hidden Fee Detection"
            description="Spot vague fees, duplicate charges, and questionable costs before you pay."
          />

          <FeatureCard
            title="Medical & Insurance Bills"
            description="Understand billing language, denial wording, unclear charges, and next questions to ask."
          />

          <FeatureCard
            title="Subscription Charge Review"
            description="Check cancellation terms, auto-renewal language, and surprise fees."
          />

          <FeatureCard
            title="Lease & Utility Charges"
            description="Review rent charges, service fees, utility costs, penalties, and confusing add-ons."
          />

          <FeatureCard
            title="Message Generator"
            description="Get a professional copy-and-paste message you can send to ask questions or dispute a charge."
          />
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="max-w-7xl mx-auto px-6 py-16 border-t border-green-900/40"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center text-green-400 mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <StepCard
            number="1"
            title="Upload or Paste"
            description="Upload a PDF/image or paste the bill text directly into the app."
          />

          <StepCard
            number="2"
            title="AI Reviews It"
            description="BillClarity reads the document and checks for confusing fees, deadlines, and red flags."
          />

          <StepCard
            number="3"
            title="Get Clear Next Steps"
            description="Receive a plain-English report, questions to ask, and a ready-to-send message."
          />
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-gray-900 border border-green-900/40 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-green-400 mb-4">
            Start free. Upgrade when you need more.
          </h2>

          <p className="text-gray-300 mb-8">
            Free users get limited monthly analyses. Plus and Pro plans unlock
            more reports and advanced features.
          </p>

          <Link
            href="/pricing"
            className="inline-block bg-green-500 text-black px-8 py-4 rounded-lg font-bold hover:bg-green-400 transition"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-6">
          <h3 className="text-yellow-500 font-bold mb-3">Disclaimer</h3>
          <p className="text-yellow-100/80 text-sm leading-relaxed">
            BillClarity provides educational information only. It does not
            provide legal, financial, medical, insurance, or accounting advice.
            Always review important documents carefully and contact a qualified
            professional when needed.
          </p>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-900 border border-green-900/40 rounded-xl p-6 hover:border-green-500/60 transition">
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-900 border border-green-900/40 rounded-xl p-6 text-center">
      <div className="w-14 h-14 bg-green-500 text-black rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-5">
        {number}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
}