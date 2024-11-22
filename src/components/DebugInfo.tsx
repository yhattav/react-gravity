import React from "react";
import { DebugData } from "../types/Debug";

interface DebugInfoProps {
  data: DebugData;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ data }) => (
  <div
    style={{
      padding: "1rem",
      fontSize: "12px",
    }}
  >
    <pre>{JSON.stringify(data, null, 2)}</pre>
  </div>
);
