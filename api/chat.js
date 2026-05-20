// api/chat.js — Vercel Serverless Function
// Proxies requests to the Anthropic API so the key never ships to the client.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY environment variable is not set." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch {
      return res.status(400).json({ error: "Invalid JSON in request body." });
    }
  }

  if (!body || !body.model || !body.messages) {
    return res.status(400).json({ error: "Request body must include model and messages." });
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();
if (data.content) {
  data.content = data.content.map(block => {
    if (block.type === "text") {
      const t = block.text;
      const start = t.indexOf("{");
      const end = t.lastIndexOf("}");
      if (start !== -1 && end !== -1) block.text = t.slice(start, end + 1);
    }
    return block;
  });
}
return res.status(upstream.status).json(data);
  } catch (err) {
    console.error("Anthropic proxy error:", err);
    return res.status(500).json({ error: "Upstream API call failed: " + err.message });
  }
}