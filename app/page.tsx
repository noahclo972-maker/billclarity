import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <section className="mx-auto max-w-6xl text-center">
        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-green-400">
          BillClarity
        </p>

        <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-bold leading-tight md:text-6xl">
          Stop guessing what your bills actually mean.
        </h1>

        <p className="mx-auto mb-4 max-w-3xl text-xl text-gray-300">
          Your first bill scan is free. Paste bill text or upload a file to get
          a plain-English breakdown, questions to ask, and a copy-and-paste
          message.
        </p>

        <p className="mx-auto mb-10 max-w-3xl text-sm text-gray-500">
          BillClarity helps with confusing bills, fees, statements, insurance
          documents, rent charges, utility bills, subscriptions, and more.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/analyze"
            className="rounded-lg bg-green-500 px-8 py-4 text-lg font-bold text-black hover:bg-green-400"
          >
            Try 1 Free Bill Scan
          </Link>

          <Link
            href="/pricing"
            className="rounded-lg border border-green-500 px-8 py-4 text-lg font-bold text-green-400 hover:bg-green-500/10"
          >
            View Plans
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl">
        <h2 className="mb-10 text-center text-3xl font-bold text-green-400">
          What BillClarity Helps With
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Plain-English Breakdown"
            text="Turn confusing bill wording into simple explanations you can actually understand."
          />

          <FeatureCard
            title="Confusing Fee Review"
            text="Spot unclear fees, duplicate-looking charges, missed credits, and costs worth asking about."
          />

          <FeatureCard
            title="Medical & Insurance Bills"
            text="Understand billing language, insurance wording, patient responsibility, and questions to ask."
          />

          <FeatureCard
            title="Rent & Utility Charges"
            text="Review apartment fees, utility costs, admin fees, late fees, and unclear adjustments."
          />

          <FeatureCard
            title="Subscription Charges"
            text="Check mystery subscriptions, recurring charges, cancellation language, and refund questions."
          />

          <FeatureCard
            title="Message Generator"
            text="Get a copy-and-paste message you can send before paying, calling, or emailing."
          />
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-4xl rounded-xl border border-green-900 bg-gray-900 p-6 text-center">
        <h2 className="mb-3 text-2xl font-bold text-green-400">
          Before you pay a bill you don’t understand, check it first.
        </h2>

        <p className="mb-6 text-gray-300">
          A confusing charge might be nothing — or it might be a fee, mistake,
          duplicate charge, missed credit, or deadline you need to ask about.
        </p>

        <Link
          href="/analyze"
          className="inline-block rounded-lg bg-green-500 px-6 py-3 font-bold text-black hover:bg-green-400"
        >
          Try 1 Free Bill Scan
        </Link>
      </section>

      <section className="mx-auto mt-10 max-w-4xl text-center text-sm text-gray-500">
        <p>
          BillClarity is not legal, medical, financial, insurance, or accounting
          advice. It helps you understand confusing documents and prepare better
          questions.
        </p>
      </section>
    </main>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-green-900 bg-gray-900 p-6">
      <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
      <p className="text-gray-300">{text}</p>
    </div>
  );
}