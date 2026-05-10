import { NextRequest, NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing MISTRAL_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const client = new Mistral({
      apiKey: apiKey,
    });

    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 }
      );
    }

    if (uploadedFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "This file is too large. Please upload a file under 10 MB." },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "text/plain",
    ];

    if (!allowedTypes.includes(uploadedFile.type)) {
      return NextResponse.json(
        {
          error:
            "This file type is not supported. Please upload a PDF, JPG, PNG, or TXT file.",
        },
        { status: 400 }
      );
    }

    if (uploadedFile.type === "text/plain") {
      const text = await uploadedFile.text();

      return NextResponse.json({
        text: text,
      });
    }

    const arrayBuffer = await uploadedFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    const dataUrl = `data:${uploadedFile.type};base64,${base64}`;

    const ocrResponse = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        documentUrl: dataUrl,
      },
    });

    const text =
      ocrResponse.pages
        ?.map((page) => page.markdown || "")
        .join("\n\n")
        .trim() || "";

    if (!text) {
      return NextResponse.json(
        {
          error:
            "We could not read this file clearly. Please paste the text manually or upload a clearer file.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      text: text,
    });
  } catch (error) {
    console.error("OCR API error:");
    console.error(error);

    return NextResponse.json(
      {
        error:
          "We could not read this file clearly. Please paste the text manually or upload a clearer file.",
      },
      { status: 500 }
    );
  }
}