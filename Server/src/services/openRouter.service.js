import axios from "axios";

async function askAi(messages) {
    try {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("Messages array is empty.");
        }

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: process.env.OPENROUTER_MODEL || "openrouter/free",
                messages: messages,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const content = response?.data?.choices?.[0]?.message?.content;

        if (!content || !content.trim()) {
            throw new Error("AI returned an empty response.");
        }

        return content;
    } catch (error) {
        const errorDetail =
            error.response?.data?.error?.message ||
            error.response?.data?.message ||
            error.message;
        console.error("OpenRouter Error:", errorDetail);
        throw new Error(`OpenRouter Error: ${errorDetail}`);
    }
}

export { askAi };
