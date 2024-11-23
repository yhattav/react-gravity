import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { StarPalette, StarPaletteProps } from "./StarPalette";
import { useRef } from "react";

const meta: Meta<typeof StarPalette> = {
  title: "Components/StarPalette",
  component: StarPalette,
  parameters: {
    backgrounds: {
      default: "dark",
      values: [
        {
          name: "dark",
          value: "#1a1a1a",
        },
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StarPalette>;

const StarPaletteWrapper = (args: StarPaletteProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="storybook-container"
      style={{
        width: "800px",
        height: "600px",
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
