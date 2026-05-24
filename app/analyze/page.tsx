"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Plan = "free" | "plus" | "pro";

function getPlanLimit(plan: Plan) {
  if (plan === "free") return 1;
  if (plan === "plus") return 50;
  return Infinity;
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function AnalyzePage() {
  const [documentType, setDocumentType] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [concern, setConcern] = useState("");
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [currentPlan, setCurrentPlan] = useState<Plan>("free");
  const [monthlyUsage, setMonthlyUsage] = useState(0);

  useEffect(() => {
    const savedPlan = localStorage.getItem("billclarity_subscription");

    if (savedPlan === "plus" || savedPlan === "pro") {
      setCurrentPlan(savedPlan);
    } else {
      setCurrentPlan("free");
    }

    const usageRaw = localStorage.getItem("billclarity_usage");
    const usage = usageRaw ? JSON.parse(usageRaw) : {};
    const monthKey = getCurrentMonthKey();

    setMonthlyUsage(usage[monthKey] || 0);
  }, []);

  function incrementUsage() {
    const usageRaw = localStorage.getItem("billclarity_usage");
    const usage = usageRaw ? JSON.parse(usageRaw) : {};
    const monthKey = getCurrentMonthKey();

    usage[monthKey] = (usage[monthKey] || 0) + 1;

    localStorage.setItem("billclarity_usage", JSON.stringify(usage));
    setMonthlyUsage(usage[monthKey]);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "This file type is not supported. Please upload a PDF, JPG, PNG, or TXT file."
      );
      setSelectedFile(null);
      setFileName("");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("This file is too large. Please upload a file under 10 MB.");
      setSelectedFile(null);
      setFileName("");
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setError("");
  }

  async function handleAnalyze() {
    setError("");

    const limit = getPlanLimit(currentPlan);

    if (monthlyUsage >= limit) {
      setError(
        `You have reached your ${currentPlan.toUpperCase()} plan limit for this month. Upgrade to continue analyzing documents.`
      );
      return;
    }

    if (!selectedFile && documentText.trim() === "") {
      setError("Please upload a file or paste document text.");
      return;
    }

    if (documentType === "") {
      setError("Please choose a document type.");
      return;
    }

    const finalTitle =
      documentTitle.trim() ||
      `${documentType} - ${new Date().toLocaleDateString()}`;

    setIsLoading(true);

    try {
      let finalDocumentText = documentText.trim();

      if (selectedFile) {
        setLoadingMessage("Reading your file...");

        const formData = new FormData();
        formData.append("file", selectedFile);

        const ocrResponse = await fetch("/api/ocr", {
          method: "POST",
          body: formData,
        });

        const ocrResponseText = await ocrResponse.text();

        let ocrData;

        try {
          ocrData = ocrResponseText ? JSON.parse(ocrResponseText) : {};
        } catch {
          console.error("OCR backend did not return JSON:", ocrResponseText);
          setError(
            "We could not read this file. Please try again or paste the text manually."
          );
          setIsLoading(false);
          return;
        }

        if (!ocrResponse.ok) {
          setError(
            ocrData.error ||
              "We could not read this file. Please paste the text manually."
          );
          setIsLoading(false);
          return;
        }

        finalDocumentText = ocrData.text || "";

        if (!finalDocumentText.trim()) {
          setError(
            "We could not find readable text in this file. Please paste the document text manually."
          );
          setIsLoading(false);
          return;
        }
      }

      setLoadingMessage("Creating your report...");

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: finalTitle,
          documentType: documentType,
          userConcern: concern,
          documentText: finalDocumentText,
        }),
      });

      const responseText = await response.text();

      let data;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        console.error("Analyze backend did not return JSON:", responseText);
        setError("The report could not be created. Please try again.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setError(
          data.error ||
            `The report could not be created. Status: ${response.status}`
        );
        setIsLoading(false);
        return;
      }

      const realReport = {
        id: Date.now().toString(),
        title: data.title || finalTitle,
        documentType: data.documentType || documentType,
        dateAnalyzed: data.dateAnalyzed || new Date().toLocaleDateString(),
        riskLevel: data.riskLevel || "Medium",
        concern: concern,
        summary: data.summary || "No summary returned.",
        mainIssue: data.mainIssue || "No main issue returned.",
        nextSteps: Array.isArray(data.nextSteps) ? data.nextSteps : [],
        questions: Array.isArray(data.questions) ? data.questions : [],
        message: data.message || "",
      };

      localStorage.setItem(
        "currentBillClarityReport",
        JSON.stringify(realReport)
      );

      const oldReports = localStorage.getItem("billClarityReports");
      const reports = oldReports ? JSON.parse(oldReports) : [];

      reports.unshift(realReport);

      localStorage.setItem("billClarityReports", JSON.stringify(reports));

      incrementUsage();

      window.location.href = "/results";
    } catch (error) {
      console.error(error);
      setError("The report could not be created. Please try again.");
      setIsLoading(false);
    }
  }

  const limit = getPlanLimit(currentPlan);
  const usageDisplay =
    limit === Infinity ? "Unlimited" : `${monthlyUsage}/${limit}`;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex justify-between">
          <Link href="/" className="text-green-400 hover:underline">
            Back Home
          </Link>

          <Link href="/pricing" className="text-green-400 hover:underline">
            Pricing
          </Link>
        </div>

        <h1 className="mb-3 text-4xl font-bold text-green-400">
          Try 1 Free Bill Scan
        </h1>

        <p className="mb-6 text-gray-300">
          Paste bill text or upload a file to get a plain-English breakdown,
          questions to ask, and a copy-and-paste message before you pay or
          contact customer service.
        </p>

        <div className="mb-6 rounded-lg border border-green-900 bg-gray-900 p-4">
          <p className="text-gray-300">
            Current plan:{" "}
            <span className="font-bold text-green-400 uppercase">
              {currentPlan}
            </span>
          </p>

          <p className="text-gray-300">
            Monthly usage:{" "}
            <span className="font-bold text-green-400">{usageDisplay}</span>
          </p>

          <p className="mt-2 text-xs text-gray-500">
            Free plan includes 1 bill scan per month. Monthly usage resets at
            the start of each month.
          </p>
        </div>

        <div className="mb-6 rounded-lg border border-yellow-700 bg-yellow-950 p-4 text-sm text-yellow-200">
          Tip: For privacy, remove account numbers, member IDs, full addresses, 
          birthdates, and payment information before uploading. BillClarity only 
          needs the bill wording, charges, fees, dates, and confusing sections.

        </div>

        <div className="space-y-6 rounded-xl border border-green-900 bg-gray-900 p-6">
          <div>
            <label className="mb-2 block font-bold">Upload a file</label>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.txt"
              onChange={handleFileChange}
              className="block w-full text-gray-300"
            />

            {fileName && (
              <p className="mt-2 text-green-400">Selected file: {fileName}</p>
            )}

            <p className="mt-2 text-sm text-gray-500">
              PDF, JPG, PNG, or TXT. Max 10 MB.
            </p>
          </div>

          <div>
            <label className="mb-2 block font-bold">
              Or paste document text
            </label>

            <textarea
              value={documentText}
              onChange={(event) => setDocumentText(event.target.value)}
              placeholder="Paste the bill, contract, policy, or charge details here..."
              className="h-40 w-full rounded-lg border border-green-900 bg-black p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block font-bold">Document title</label>

            <input
              value={documentTitle}
              onChange={(event) => setDocumentTitle(event.target.value)}
              placeholder="Example: April phone bill"
              className="w-full rounded-lg border border-green-900 bg-black p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block font-bold">Document type</label>

            <select
              value={documentType}
              onChange={(event) => setDocumentType(event.target.value)}
              className="w-full rounded-lg border border-green-900 bg-black p-3 text-white"
            >
              <option value="">Choose one</option>
              <option value="Medical bill">Medical bill</option>
              <option value="Insurance document">Insurance document</option>
              <option value="Utility bill">Utility bill</option>
              <option value="Subscription charge">Subscription charge</option>
              <option value="Phone or internet bill">
                Phone or internet bill
              </option>
              <option value="Rent or lease charge">Rent or lease charge</option>
              <option value="Credit card statement">Credit card statement</option>
              <option value="Bank fee">Bank fee</option>
              <option value="Contract">Contract</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-bold">
              What are you worried about?
            </label>

            <textarea
              value={concern}
              onChange={(event) => setConcern(event.target.value)}
              placeholder="Example: I think this fee is too high."
              className="h-24 w-full rounded-lg border border-green-900 bg-black p-3 text-white"
            />
          </div>

          {isLoading && (
            <div className="rounded-lg border border-green-500 bg-green-950 p-4 text-green-300">
              {loadingMessage || "Working..."}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500 bg-red-950 p-4 text-red-300">
              {error}
            </div>
          )}

          {monthlyUsage >= limit && (
            <Link
              href="/pricing"
              className="block rounded-lg border border-yellow-500 bg-yellow-950 p-4 text-center font-bold text-yellow-300 hover:bg-yellow-900"
            >
              Upgrade to continue
            </Link>
          )}

          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full rounded-lg bg-green-500 py-4 text-lg font-bold text-black hover:bg-green-400 disabled:opacity-50"
          >
            {isLoading ? "Analyzing..." : "Run Free Bill Scan"}
          </button>
        </div>
      </div>
    </main>
  );
}