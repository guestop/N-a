import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-hub-signature-256");
  
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const payloadString = await request.text();
  const secret = process.env.GITHUB_WEBHOOK_SECRET || "";

  if (!secret) {
    console.error("GITHUB_WEBHOOK_SECRET is not defined in environment variables");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  try {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payloadString);
    const calculatedSignature = `sha256=${hmac.digest("hex")}`;

    // Safe timing comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );

    if (isValid) {
      const payload = JSON.parse(payloadString);
      const githubEvent = request.headers.get("x-github-event");
      
      if (githubEvent === "push") {
        console.log(`Valid webhook push received for repo: ${payload.repository?.full_name}`);
        // This is where deployment or cache invalidation logic hooks in
      }
      
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } catch (err: unknown) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Internal processing error" }, { status: 500 });
  }
}
