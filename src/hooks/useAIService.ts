import { useState, useCallback, useEffect } from "react";
import OpenAI from "openai";
import { validateScenarioJson } from "../utils/validation/jsonValidation";

export type AIService = "openai" | "anthropic" | "none";

export interface AIServiceConfig {
  service: AIService;
  apiKey: string;
}

interface UseAIServiceProps {
  onContentUpdate: (content: string) => void;
  onError: (error: string) => void;
  onValidJson: () => void;
}

export const useAIService = ({
  onContentUpdate,
  onError,
  onValidJson,
}: UseAIServiceProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiConfig, setAIConfig] = useState<AIServiceConfig>(() => {
    const saved = localStorage.getItem("aiServiceConfig");
    return saved ? JSON.parse(saved) : { service: "none", apiKey: "" };
  });

  // Save AI config to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("aiServiceConfig", JSON.stringify(aiConfig));
  }, [aiConfig]);

  // Validate JSON content
  const validateJson = useCallback(
    (content: string) => {
      const result = validateScenarioJson(content);
      if (result.isValid && result.data) {
        onContentUpdate(JSON.stringify(result.data, null, 2));
        onValidJson();
        return true;
      }
      return false;
    },
    [onContentUpdate, onValidJson]
  );

  // Handle OpenAI streaming
  const handleOpenAIStream = useCallback(
    async (
      stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
    ) => {
      let accumulatedJson = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        accumulatedJson += content;

        // Update content in real-time
        onContentUpdate(accumulatedJson);

        // Try to validate if we might have complete JSON
        if (accumulatedJson.includes("}")) {
          validateJson(accumulatedJson);
        }
      }

      // Final validation
      if (!validateJson(accumulatedJson)) {
        onError("Generated JSON is not a valid scenario");
      }
    },
    [onContentUpdate, validateJson, onError]
  );

  // Generate content using selected AI service
  const generateContent = useCallback(
    async (prompt: string) => {
      if (aiConfig.service === "none" || !aiConfig.apiKey) {
        console.log("No AI service configured. Prompt copied to clipboard.");
        return;
      }

      setIsGenerating(true);
      try {
        if (aiConfig.service === "openai") {
          const openai = new OpenAI({
            apiKey: aiConfig.apiKey,
            dangerouslyAllowBrowser: true,
          });

          const stream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            store: true,
            messages: [{ role: "user", content: prompt }],
            stream: true,
          });

          await handleOpenAIStream(stream);
        } else if (aiConfig.service === "anthropic") {
          const response = await fetch(
            "https://api.anthropic.com/v1/messages",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": aiConfig.apiKey,
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                model: "claude-3-opus-20240229",
                max_tokens: 4096,
                messages: [{ role: "user", content: prompt }],
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
          }

          const data = await response.json();
          const content = data.content[0].text;

          if (!validateJson(content)) {
            onError("Generated JSON is not a valid scenario");
          }
        }
      } catch (error) {
        onError(
          error instanceof Error ? error.message : "AI generation failed"
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [aiConfig, handleOpenAIStream, validateJson, onError]
  );

  return {
    aiConfig,
    setAIConfig,
    isGenerating,
    generateContent,
  };
};
