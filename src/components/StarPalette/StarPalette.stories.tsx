import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { StarPalette } from "./StarPalette";
import { useRef, useState, useEffect } from "react";

const meta: Meta<typeof StarPalette> = {
  title: "Components/StarPalette",
  component: StarPalette,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof StarPalette>;

const StarPaletteWrapper = (args: any) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      style={{
        width: "800px",
        height: "600px",
        background: "#1a1a1a",
        position: "relative",
      }}
    >
      <StarPalette {...args} containerRef={containerRef} />
    </div>
  );
};

const HoveredStarPaletteWrapper = (args: any) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger the hover effect immediately when component mounts
  useEffect(() => {
    const palette = containerRef.current?.querySelector(
      'div[style*="position: absolute"]'
    );
    if (palette) {
      const event = new MouseEvent("mouseenter", {
        bubbles: true,
        cancelable: true,
      });
      palette.dispatchEvent(event);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "800px",
        height: "600px",
        background: "#1a1a1a",
        position: "relative",
      }}
    >
      <StarPalette {...args} containerRef={containerRef} />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <StarPaletteWrapper {...args} />,
  args: {
    onStarDragStart: (template) => console.log("Drag start:", template),
    onStarDragEnd: (template) => console.log("Drag end:", template),
  },
};

export const Hovered: Story = {
  render: (args) => <StarPaletteWrapper {...args} />,
  args: {
    forceHover: true,
    onStarDragStart: (template) => console.log("Drag start:", template),
    onStarDragEnd: (template) => console.log("Drag end:", template),
  },
};
