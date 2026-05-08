const { GoogleGenerativeAI } = require("@google/generative-ai");

const createAiError = (message, status = 502) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const isMockAiEnabled = () =>
  process.env.USE_MOCK_AI === "1" ||
  /^true$/i.test(String(process.env.USE_MOCK_AI || ""));

const getAiProvider = () =>
  String(process.env.AI_PROVIDER || "gemini").toLowerCase() === "groq" ? "groq" : "gemini";

const getGeminiModel = () => process.env.GEMINI_MODEL || "gemini-2.5-flash";

const getGroqModel = () => process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const buildUserPrompt = (topic) =>
  `Explain the following in 2-4 short sentences, plain language, no markdown: ${topic}`;

const explainWithMock = (topic) => ({
  explanation: [
    `This is a placeholder answer for "${topic}".`,
    "Your Express route, JSON body, and response shape are real; only the LLM call is skipped.",
    "Set USE_MOCK_AI=0 and use AI_PROVIDER=groq + GROQ_API_KEY, or AI_PROVIDER=gemini + GEMINI_API_KEY.",
  ].join(" "),
  source: "mock",
  model: "mock",
});

const explainWithGemini = async (topic) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw createAiError(
      "Missing GEMINI_API_KEY. Copy .env.example to .env or set AI_PROVIDER=groq with GROQ_API_KEY.",
      500
    );
  }

  const modelName = getGeminiModel();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });
  const prompt = `You are helping beginners. ${buildUserPrompt(topic)}`;
  const result = await model.generateContent(prompt);
  const explanation = result.response.text().trim();

  if (!explanation) {
    throw createAiError("[Gemini] Empty reply from model");
  }

  return { explanation, source: "gemini", model: modelName };
};

const explainWithGroq = async (topic) => {
  if (typeof fetch !== "function") {
    throw createAiError("Groq provider requires Node.js 18+ because it uses global fetch.", 500);
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw createAiError("Missing GROQ_API_KEY. Get a free key at https://console.groq.com/keys", 500);
  }

  const modelName = getGroqModel();
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: "system",
          content:
            "You are helping beginners. Answer in 2-4 short sentences, plain language, no markdown.",
        },
        { role: "user", content: buildUserPrompt(topic) },
      ],
      temperature: 0.4,
      max_tokens: 512,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || response.statusText || "Groq request failed";
    throw createAiError(`[Groq] ${message}`, response.status);
  }

  const explanation = data?.choices?.[0]?.message?.content?.trim();
  if (!explanation) {
    throw createAiError("[Groq] Empty reply from model");
  }

  return { explanation, source: "groq", model: data.model || modelName };
};

const explainTopic = async (topic) => {
  if (isMockAiEnabled()) {
    return explainWithMock(topic);
  }

  return getAiProvider() === "groq" ? explainWithGroq(topic) : explainWithGemini(topic);
};

const getAiInfo = () => ({
  provider: isMockAiEnabled() ? "mock" : getAiProvider(),
  geminiModel: getGeminiModel(),
  groqModel: getGroqModel(),
  mockEnabled: isMockAiEnabled(),
  endpoint: "/api/ai/explain",
});

module.exports = {
  buildUserPrompt,
  explainTopic,
  getAiInfo,
};
