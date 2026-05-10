import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-green-400 hover:underline">
          Back Home
        </Link>

        <h1 className="mt-8 mb-6 text-4xl font-bold text-green-400">
          Disclaimer
        </h1>

        <div className="space-y-6 rounded-2xl border border-green-900 bg-gray-900 p-8 text-gray-300">
          <p>
            BillClarity provides educational information only. It does not
            provide legal, financial, medical, insurance, or accounting advice.
          </p>

          <p>
            BillClarity may help explain confusing wording, possible fees,
            possible red flags, and suggested questions to ask, but it cannot
            guarantee that every error, issue, charge, or fee will be found.
          </p>

          <p>
            Always review your original documents carefully. For serious legal,
            medical, financial, insurance, accounting, or billing problems,
            contact a qualified professional.
          </p>

          <p>
            Do not rely only on BillClarity before making important decisions.
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/analyze"
            className="rounded-lg bg-green-500 px-6 py-3 font-bold text-black hover:bg-green-400"
          >
            Analyze a Document
          </Link>
        </div>
      </div>
    </main>
  );
}