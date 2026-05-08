const aiService = require("../services/aiService");

const getAiHint = (status, message) => {
  const text = String(message || "");
  const is429 = status === 429 || text.includes("429") || text.includes("Too Many Requests");
  const is403 =
    status === 403 ||
    text.includes("403") ||
    text.includes("Forbidden") ||
    text.includes("denied access");

  if (is429) {
    return "Rate limit hit. Wait a minute, reduce calls, or switch to a smaller/free model in your .env settings.";
  }

  if (is403) {
    return "Access was denied by the provider project/account. Create a fresh API key/project, switch providers, or set USE_MOCK_AI=1 for class demos.";
  }

  return undefined;
};

const getAiStatus = (error) => {
  const status = typeof error?.status === "number" ? error.status : undefined;
  const message = String(error?.message || "");

  if (status === 429 || message.includes("429") || message.includes("Too Many Requests")) return 429;
  if (
    status === 403 ||
    message.includes("403") ||
    message.includes("Forbidden") ||
    message.includes("denied access")
  ) {
    return 403;
  }

  return status || 502;
};

const getInfo = (req, res) =>
  res.status(200).json({
    message: "AI explain service is ready",
    data: aiService.getAiInfo(),
  });

const explainTopic = async (req, res) => {
  const topic = req.body.topic.trim();

  try {
    const output = await aiService.explainTopic(topic);
    return res.status(200).json({
      message: "Explanation generated successfully",
      data: {
        topic,
        explanation: output.explanation,
        source: output.source,
        model: output.model,
      },
    });
  } catch (error) {
    console.error(error);

    const status = getAiStatus(error);
    const hint = getAiHint(status, error?.message);

    return res.status(status).json({
      message: error?.message || "LLM request failed",
      code: "AI_REQUEST_FAILED",
      ...(hint && { hint }),
    });
  }
};

module.exports = {
  getInfo,
  explainTopic,
};
