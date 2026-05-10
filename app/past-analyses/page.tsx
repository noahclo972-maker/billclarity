"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Report = {
  id: string;
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

export default function PastAnalysesPage() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const savedReports = localStorage.getItem("billClarityReports");

    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
  }, []);

  function openReport(report: Report) {
    localStorage.setItem("currentBillClarityReport", JSON.stringify(report));
    window.location.href = "/results";
  }

  function deleteReport(id: string) {
    const updatedReports = reports.filter((report) => report.id !== id);

    setReports(updatedReports);
    localStorage.setItem("billClarityReports", JSON.stringify(updatedReports));
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between">
          <Link href="/" className="text-green-400 hover:underline">
            Back Home
          </Link>

          <Link href="/analyze" className="text-green-400 hover:underline">
            Analyze New Document
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-green-400 mb-3">
          Past Analyses
        </h1>

        <p className="text-gray-300 mb-8">
          These reports are saved only on this browser/device.
        </p>

        {reports.length === 0 ? (
          <div className="bg-gray-900 border border-green-900 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-green-400 mb-3">
              No saved reports yet
            </h2>

            <p className="text-gray-300 mb-6">
              Analyze a document first, and your demo report will show up here.
            </p>

            <Link
              href="/analyze"
              className="inline-block bg-green-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-green-400"
            >
              Analyze Your First Document
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-gray-900 border border-green-900 rounded-xl p-6"
              >
                <h2 className="text-xl font-bold text-green-400 mb-2">
                  {report.title}
                </h2>

                <p className="text-sm text-gray-400 mb-3">
                  {report.documentType} • {report.dateAnalyzed}
                </p>

                <p className="text-yellow-400 font-bold mb-3">
                  Risk: {report.riskLevel}
                </p>

                <p className="text-gray-300 mb-5">{report.summary}</p>

                <div className="flex gap-3">
                  <button
                    onClick={() => openReport(report)}
                    className="bg-green-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-green-400"
                  >
                    Open
                  </button>

                  <button
                    onClick={() => deleteReport(report.id)}
                    className="border border-red-500 text-red-400 px-4 py-2 rounded-lg font-bold hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}