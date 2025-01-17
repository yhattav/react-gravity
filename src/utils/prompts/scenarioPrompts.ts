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

Physics Model Information:
1. Gravitational Force Calculation:
   - Uses simplified Newton's law: F = G * (m1 * m2) / r²
   - G (gravitational constant) = 0.1 in simulation units
   - Minimum distance clamp = 10 units to prevent infinite forces
   - Force falloff starts at 20 units for stability

2. Mass-Force Relationships:
   - Gravity points (stars/planets) mass range: 5,000 to 2,500,000
     * Brown Dwarf: ~5,000
     * Red Dwarf: ~20,000
     * Main Sequence Star: ~50,000-200,000
     * Red Giant: ~200,000-1,000,000
     * Super Giant: >1,000,000
   - Particles mass range: 0.01 to 0.1
     * Light particles: 0.01-0.03 (faster, more affected by gravity)
     * Medium particles: 0.03-0.07 (balanced)
     * Heavy particles: 0.07-0.1 (more inertia, less affected by gravity)

3. Stable Orbit Guidelines:
   - For circular orbit around mass M at radius r:
     * Required velocity = sqrt(G * M / r) where G = 0.1
     * Example: For a 1,300,000 mass star
       - At r=100: v ≈ 360 units/tick
       - At r=200: v ≈ 180 units/tick (common stable orbit velocity)
       - At r=300: v ≈ 120 units/tick
   - For elliptical orbits, velocity should be:
     * Higher than circular orbit velocity for elongated orbits
     * Lower for more circular orbits
   - Multiple bodies need higher masses to maintain stable orbits
   - IMPORTANT: These velocities are exact - using lower values will result in unstable orbits!

4. Practical Example - Multi-Body Orbital System:
   Consider a system with a central star (mass: 1,300,000) and two orbiting bodies:
   a) Planet (mass: 1.0)
      - Distance from star: 300 units
      - Required orbital velocity: 180 units/tick
      - Direction perpendicular to radius for circular orbit
      - Creates stable circular orbit due to mass ratio ~1:1,300,000
   
   b) Moon (mass: 0.01)
      - Distance from planet: 101 units
      - Additional velocity: 220 units/tick (relative to planet)
      - Smaller mass allows it to be affected by both planet and star

   Key Insights:
   - Mass ratios: Star:Planet:Moon = 1,300,000:1:0.01
   - Required velocities are typically in the range of 100-400 units/tick
   - Common stable orbit velocity is around 180 units/tick at r=200
   - Velocity calculation: v = sqrt(0.1 * M / r)
   - DO NOT adjust for time steps - use the raw calculated values
   - Larger central mass requires higher velocities
   - Safe separation distances prevent immediate collisions

Scenario Requirements:
1. All positions must be within the simulator bounds (0 to ${width} for x, 0 to ${height} for y)
2. Each gravity point must have:
   - position (x, y)
   - mass (use ranges from Physics Model section)
   - label (descriptive name)
3. Each particle must have:
   - position (x, y)
   - velocity (x, y) (calculate based on orbit guidelines)
   - mass (0.01 to 0.1)
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
- Use appropriate mass ratios between gravity points and particles
- Calculate orbital velocities using the provided formulas
- Ensure multi-body systems have sufficient mass for stability
- Position objects with enough separation to prevent immediate collisions

Return only the valid JSON with no additional text.`;
};
