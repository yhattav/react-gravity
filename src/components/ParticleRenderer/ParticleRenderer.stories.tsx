import type { Meta, StoryObj } from "@storybook/react";
import { ParticleRenderer } from "./ParticleRenderer";

const meta: Meta<typeof ParticleRenderer> = {
  title: "Physics/ParticleRenderer",
  component: ParticleRenderer,
  parameters: {
    layout: "centered",
  },
  args: {
    position: { x: 150, y: 150 },
    velocity: { x: 50, y: 0 },
    force: { fx: 0, fy: 98 },
    color: "#BADA55",
    size: 20,
    showVectors: true,
    showVelocityArrows: true,
    showForceArrows: true,
    trails: [
      { x: 100, y: 150, timestamp: Date.now() - 300 },
      { x: 125, y: 150, timestamp: Date.now() - 200 },
      { x: 150, y: 150, timestamp: Date.now() - 100 },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof ParticleRenderer>;

export const Default: Story = {};

export const NoVectors: Story = {
  args: {
    showVectors: false,
  },
};

export const CustomColors: Story = {
  args: {
    color: "#FF5722",
  },
};
