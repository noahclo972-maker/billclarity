import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

function extractJson(text: string) {
  let cleaned = text.trim();

  cleaned = cleaned.replace(/```json/g, "").replace(/```/g, "").trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found in Claude response.");
  }

  const jsonText = cleaned.slice(firstBrace, lastBrace + 1);

  return JSON.parse(jsonText);
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing ANTHROPIC_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const body = await request.json();

    const title = body.title;
    const documentType = body.documentType;
    const userConcern = body.userConcern;
    const documentText = body.documentText;

    if (!documentText || !documentType) {
      return NextResponse.json(
        { error: "Missing document text or document type." },
        { status: 400 }
      );
    }

    const prompt = `
You are BillClarity, a consumer bill and document explanation assistant.

Analyze the document below and return ONLY a JSON object.

CRITICAL RULES:
- Return ONLY JSON.
- Do NOT use markdown.
- Do NOT use backticks.
- Do NOT include an intro sentence.
- Do NOT include an explanation after the JSON.
- Do NOT include comments in the JSON.
- All strings must use double quotes.
- Arrays must be valid JSON arrays.
- The response must be parseable by JSON.parse().

Safety rules:
- You are not a lawyer, doctor, financial advisor, insurance agent, accountant, or billing professional.
- Do not give legal, medical, financial, insurance, or accounting advice.
- Explain possible meanings, possible concerns, and questions the user can ask.
- Do not invent facts.
- If something is unclear, say it is unclear.

The "message" field is VERY IMPORTANT.

The "message" field must be a ready-to-send customer service message written from the user's point of view.

The "message" field must:
- Start with "Hello,"
- Be polite and professional.
- Ask for clarification.
- Mention the specific confusing fees or charges from the document.
- Ask for an itemized explanation.
- Ask whether the fees can be corrected, removed, waived, or explained.
- End with "Thank you."
- NOT give advice to the user.
- NOT say "consider comparing" or "you should."
- NOT sound like a summary.
- NOT sound like legal advice.
- Be something the user could copy and send directly.

Good example for "message":
"Hello, I am reviewing my recent bill and would like clarification about the administrative fee, convenience fee, and late fee listed on my statement. Can you please provide an itemized explanation of these charges and let me know whether any of them can be corrected, removed, or waived? I would also like to understand whether these fees are required under my account or agreement. Thank you."

Bad example for "message":
"Whether fees are too high depends on your area. You should compare providers."

Return this exact JSON shape:

{
  "title": "string",
  "documentType": "string",
  "dateAnalyzed": "string",
  "riskLevel": "Low",
  "summary": "string",
  "mainIssue": "string",
  "nextSteps": ["string"],
  "questions": ["string"],
  "message": "string"
}

Allowed riskLevel values:
Low, Medium, High, Urgent

Document title:
${title || "Untitled document"}

Document type:
${documentType}

User concern:
${userConcern || "No concern provided."}

Document text:
${documentText}
`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const firstBlock = message.content[0];

    if (!firstBlock || firstBlock.type !== "text") {
      return NextResponse.json(
        { error: "Claude did not return text." },
        { status: 500 }
      );
    }

    console.log("RAW CLAUDE RESPONSE:");
    console.log(firstBlock.text);

    let parsed;

    try {
      parsed = extractJson(firstBlock.text);
    } catch (error) {
      console.error("Could not parse Claude JSON:");
      console.error(firstBlock.text);
      console.error(error);

      return NextResponse.json(
        {
          error:
            "Claude returned invalid JSON. Check PowerShell for the raw Claude output.",
        },
        { status: 500 }
      );
    }

    const safeResult = {
      title: parsed.title || title || "Untitled document",
      documentType: parsed.documentType || documentType,
      dateAnalyzed: parsed.dateAnalyzed || new Date().toLocaleDateString(),
      riskLevel: parsed.riskLevel || "Medium",
      summary: parsed.summary || "No summary returned.",
      mainIssue: parsed.mainIssue || "No main issue returned.",
      nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
      message:
        parsed.message ||
        "Hello, I am reviewing my bill and would like clarification about the charges listed. Can you please provide an itemized explanation and let me know whether any fees can be corrected, removed, waived, or explained? Thank you.",
    };

    return NextResponse.json(safeResult);
  } catch (error) {
    console.error("Analyze API error:");
    console.error(error);

    return NextResponse.json(
      {
        error: "Analysis failed. Check PowerShell for the exact backend error.",
      },
      { status: 500 }
    );
  }
}