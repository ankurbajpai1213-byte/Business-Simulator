import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      message: "AI customer conversations will be enabled after the OpenAI API key is configured.",
      configured: false,
    });
  }

  try {
    const body = (await request.json()) as { playerMessage?: string; businessContext?: string };
    const playerMessage = body.playerMessage?.trim();

    if (!playerMessage || playerMessage.length > 1200) {
      return NextResponse.json({ error: "Invalid message." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      input: [
        {
          role: "system",
          content:
            "You are a customer in a Mumbai cafe simulation. Stay in character, be concise, and never invent numerical game-state changes. The game engine decides all economic consequences.",
        },
        {
          role: "user",
          content: `Business context: ${body.businessContext || "Mumbai cafe, early operation"}\nPlayer says: ${playerMessage}`,
        },
      ],
      max_output_tokens: 180,
    });

    return NextResponse.json({ message: response.output_text, configured: true });
  } catch {
    return NextResponse.json({ error: "AI interaction failed." }, { status: 502 });
  }
}
