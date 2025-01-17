import { Scenario } from "../../types/scenario";

interface SimulatorDimensions {
  width: number;
  height: number;
}

const EXAMPLE_SCENARIO = {
  id: "example-id",
  name: "Example Name",
  description: "Example Description",
  data: {
    settings: {},
    gravityPoints: [],
    particles: [],
    paths: [],
  },
};

export const generateScenarioPrompt = (
  description: string,
  currentScenario: Scenario,
  dimensions: SimulatorDimensions
): string => {
  const { width, height } = dimensions;
  const centerX = width / 2;
  const centerY = height / 2;

  return `You are a scenario generator for a gravity simulator. Your task is to create a JSON scenario based on the user's description.

Environment Context:
- Simulator dimensions: ${width}x${height} pixels
- Center position: x=${centerX}, y=${centerY}
- Current physics settings: ${JSON.stringify(
    currentScenario.data.settings,
    null,
    2
  )}

Scenario Requirements:
1. All positions must be within the simulator bounds (0 to ${width} for x, 0 to ${height} for y)
2. Each gravity point must have:
   - position (x, y)
   - mass (typical range: 100,000 to 2,000,000)
   - label (descriptive name)
3. Each particle must have:
   - position (x, y)
   - velocity (x, y) (typical range: -50 to 50)
   - mass (typical range: 0.01 to 0.1)
   - elasticity (0 to 1, typically 0.8)
   - id (unique string)
4. Settings can include:
   - NEW_PARTICLE_MASS (default: ${
     currentScenario.data.settings.NEW_PARTICLE_MASS
   })
   - NEW_PARTICLE_ELASTICITY (default: ${
     currentScenario.data.settings.NEW_PARTICLE_ELASTICITY
   })
   - FRICTION (default: ${currentScenario.data.settings.FRICTION})
   - POINTER_MASS (default: ${currentScenario.data.settings.POINTER_MASS})

User's Description: "${description}"

Generate a valid JSON scenario that matches this description. The JSON must follow this structure:
${JSON.stringify(EXAMPLE_SCENARIO, null, 2)}

Consider:
- Relative positions (e.g., "center" means x=${centerX}, y=${centerY})
- Physical accuracy (e.g., orbits need appropriate velocity vectors)
- Visual balance within the simulator dimensions
- Realistic mass and velocity ranges for stable simulation

Return only the valid JSON with no additional text.`;
};
