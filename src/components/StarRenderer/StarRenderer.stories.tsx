import type { Meta, StoryObj } from "@storybook/react";
import { StarRenderer } from "./StarRenderer";

const meta: Meta<typeof StarRenderer> = {
  title: "Astronomy/StarRenderer",
  component: StarRenderer,
  parameters: {
    layout: "centered",
  },
  args: {
    template: {
      size: 50,
      color: "#FFD700",
      mass: 1000,
      luminosity: 1,
    },
    glowIntensity: 15,
  },
};

export default meta;
type Story = StoryObj<typeof StarRenderer>;

export const Default: Story = {};

export const RedGiant: Story = {
  args: {
    template: {
      size: 100,
      color: "#FF4500",
      mass: 2000,
      luminosity: 2,
    },
    glowIntensity: 25,
  },
};

export const WhiteDwarf: Story = {
  args: {
    template: {
      size: 25,
      color: "#E0FFFF",
      mass: 500,
      luminosity: 0.5,
    },
    glowIntensity: 10,
  },
};
