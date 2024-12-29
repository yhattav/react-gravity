import React from "react";
import { ReactLogoIcon } from "../ReactLogoIcon/ReactLogoIcon";

export const IconView: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(45deg, #1a1a1a, #2a2a2a)",
      }}
    >
      <ReactLogoIcon />
    </div>
  );
};
