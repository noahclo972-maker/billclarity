"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Report = {
  title: string;
  documentType: string;
  dateAnalyzed: string;
  riskLevel: string;
  summary: string;
  mainIssue: string;
  nextSteps: string[];
  questions: string[];
  message: string;
};

export default function ResultsPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedReport = localStorage.getItem("currentBillClarityReport");

    if (savedReport) {
      setReport(JSON.parse(savedReport));
    }
  }, []);

  function copyMessage() {
    if (!report) return;

    navigator.clipboard.writeText(report.message);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-green-400 mb-4">
          No report found
        </h1>

        <p className="text-gray-300 mb-8">
          Go analyze a document first.
        </p>

        <Link
          href="/analyze"
          className="bg-green-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-green-400"
        >
          Analyze a Document
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex justify-between">
          <Link href="/analyze" className="text-green-400 hover:underline">
            Back to Analyze
          </Link>

          <Link href="/past-analyses" className="text-green-400 hover:underline">
            Past Analyses
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-green-400 mb-2">
          BillClarity Report
        </h1>

        <p className="text-gray-400 mb-8">
          {report.title} • {report.documentType} • {report.dateAnalyzed}
        </p>

        <section className="bg-gray-900 border border-green-900 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-green-400 mb-4">
            Quick Verdict
          </h2>

          <p className="text-yellow-400 font-bold text-xl mb-3">
            Risk: {report.riskLevel}
          </p>

          <p className="text-gray-300">{report.mainIssue}</p>
        </section>

        <section className="bg-gray-900 border border-green-900 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-green-400 mb-4">
            Plain-English Summary
          </h2>

          <p className="text-gray-300 leading-relaxed">{report.summary}</p>
        </section>

        <section className="bg-gray-900 border border-green-900 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-green-400 mb-4">
            What To Do Next
          </h2>

          <ol className="space-y-2 text-gray-300">
            {report.nextSteps.map((step, index) => (
              <li key={index}>
                <span className="text-green-400 font-bold">
                  {index + 1}.{" "}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-gray-900 border border-green-900 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-green-400 mb-4">
            Questions To Ask
          </h2>

          <ul className="space-y-2 text-gray-300">
            {report.questions.map((question, index) => (
              <li key={index}>• {question}</li>
            ))}
          </ul>
        </section>

        <section className="bg-gray-900 border border-green-900 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-green-400 mb-4">
            Copy-and-Paste Message
          </h2>

          <div className="bg-black border-l-4 border-green-500 p-4 text-gray-300 mb-4 rounded">
            {report.message}
          </div>

          <button
            onClick={copyMessage}
            className="bg-green-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-green-400"
          >
            {copied ? "Copied!" : "Copy Message"}
          </button>
        </section>

        <section className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-6">
          <h2 className="text-yellow-500 font-bold mb-3">Disclaimer</h2>

          <p className="text-yellow-100/80 text-sm leading-relaxed">
            This analysis is for educational purposes only and may not be
            perfect. It is not legal, financial, medical, insurance, or
            accounting advice.
          </p>
        </section>
      </div>
    </main>
  );
}