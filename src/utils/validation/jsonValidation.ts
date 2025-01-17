import { fromZodError } from "zod-validation-error";
import { ScenarioSchema } from "../../schemas/scenario";
import { Scenario } from "../../types/scenario";

interface ValidationResult {
  isValid: boolean;
  data?: Scenario;
  error?: string;
}

export const cleanJsonString = (content: string): string => {
  return content.replace(/^```json\n/, "").replace(/\n```$/, "");
};

export const validateScenarioJson = (content: string): ValidationResult => {
  try {
    // First, try to parse as JSON
    const cleanContent = cleanJsonString(content);
    const parsedJson = JSON.parse(cleanContent);

    // Then validate against schema
    const result = ScenarioSchema.safeParse(parsedJson);

    if (result.success) {
      return {
        isValid: true,
        data: result.data,
      };
    }

    // Convert Zod error to readable format
    const validationError = fromZodError(result.error);
    return {
      isValid: false,
      error: validationError.message,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Invalid JSON format",
    };
  }
};

export const formatScenarioJson = (scenario: Scenario): string => {
  return JSON.stringify(scenario, null, 2);
};
