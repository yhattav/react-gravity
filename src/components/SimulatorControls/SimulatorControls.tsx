import React from "react";
import { motion } from "framer-motion";
import { MdFullscreen, MdFullscreenExit, MdInvertColors } from "react-icons/md";
import { BiReset } from "react-icons/bi";
import { BsPlayFill, BsPauseFill, BsFillCameraFill } from "react-icons/bs";
import { AiOutlineExport } from "react-icons/ai";
import { VscLibrary } from "react-icons/vsc";
import { SettingOutlined } from "@ant-design/icons";
import { MusicPlayer } from "../MusicPlayer/MusicPlayer";

interface SimulatorControlsProps {
  onPause: () => void;
  onReset: () => void;
  onFullscreen: () => void;
  onExport: (e: React.MouseEvent) => void;
  onInvertColors: () => void;
  onScreenshot: (e: React.MouseEvent) => void;
  onScenarioPanel: (e: React.MouseEvent) => void;
  onSettingsPanel: (e: React.MouseEvent) => void;
  isPaused: boolean;
  isFullscreen: boolean;
  isAudioPlaying?: boolean;
  isAudioLoaded?: boolean;
  onAudioToggle?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disableSound?: boolean;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  onPause,
  onReset,
  onFullscreen,
  onExport,
  onInvertColors,
  onScreenshot,
  onScenarioPanel,
  onSettingsPanel,
  isPaused,
  isFullscreen,
  isAudioPlaying,
  isAudioLoaded,
  onAudioToggle,
  disableSound,
}) => {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          display: "flex",
          gap: "10px",
          zIndex: 1001,
          width: "fit-content",
          height: "40px",
          alignItems: "center",
        }}
      >
        {!disableSound && onAudioToggle && (
          <MusicPlayer
            isPlaying={isAudioPlaying ?? false}
            isLoaded={isAudioLoaded ?? false}
            onToggle={onAudioToggle}
          />
        )}
        <motion.button
          onClick={onScreenshot}
          className="floating-panel floating-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Take Screenshot"
        >
          <BsFillCameraFill size={20} />
        </motion.button>
        <motion.button
          onClick={onPause}
          className="floating-panel floating-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isPaused ? "Resume Simulation" : "Pause Simulation"}
        >
          {isPaused ? <BsPlayFill size={20} /> : <BsPauseFill size={20} />}
        </motion.button>

        <motion.button
          onClick={onReset}
          className="floating-panel floating-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Reset Simulation"
        >
          <BiReset size={20} />
        </motion.button>

        <motion.button
          onClick={onFullscreen}
          className="floating-panel floating-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <MdFullscreenExit size={20} />
          ) : (
            <MdFullscreen size={20} />
          )}
        </motion.button>

        <motion.button
          onClick={onExport}
          className="floating-panel floating-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Export Scenario"
        >
          <AiOutlineExport size={20} />
        </motion.button>

        <motion.button
          onClick={onInvertColors}
          className="floating-panel floating-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Invert Colors"
        >
          <MdInvertColors size={20} />
        </motion.button>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          display: "flex",
          gap: "10px",
          zIndex: 1001,
        }}
      >
        <motion.button
          onClick={onScenarioPanel}
          className="floating-panel floating-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Scenarios"
        >
          <VscLibrary size={20} />
        </motion.button>

        <motion.button
          onClick={onSettingsPanel}
          className="floating-panel floating-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Settings"
        >
          <SettingOutlined size={20} />
        </motion.button>
      </div>
    </>
  );
};
