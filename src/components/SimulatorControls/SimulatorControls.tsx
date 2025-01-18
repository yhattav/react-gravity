import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { MdFullscreen, MdFullscreenExit, MdInvertColors } from "react-icons/md";
import { BiReset } from "react-icons/bi";
import { BsPlayFill, BsPauseFill, BsFillCameraFill } from "react-icons/bs";
import { AiOutlineExport, AiOutlineClose } from "react-icons/ai";
import { VscLibrary } from "react-icons/vsc";
import { SettingOutlined } from "@ant-design/icons";
import { MusicPlayer } from "../MusicPlayer/MusicPlayer";
import { IoCode } from "react-icons/io5";

interface SimulatorControlsProps {
  onPause: () => void;
  onReset: () => void;
  onFullscreen: () => void;
  onExport: (e: React.MouseEvent) => void;
  onInvertColors: () => void;
  onScreenshot: (e: React.MouseEvent) => Promise<void>;
  onScenarioPanel: (e: React.MouseEvent) => void;
  onSettingsPanel: (e: React.MouseEvent) => void;
  onJsonPanel: (e: React.MouseEvent) => void;
  isPaused: boolean;
  isFullscreen: boolean;
  isAudioPlaying?: boolean;
  isAudioLoaded?: boolean;
  onAudioToggle?: (e: React.MouseEvent) => void;
  disableSound?: boolean;
  isSaveModalOpen: boolean;
}

interface ControlButton {
  icon: React.ReactNode;
  title: string;
  onClick: (e: React.MouseEvent) => void;
  condition?: boolean;
  dynamicIcon?: boolean;
  alternateIcon?: React.ReactNode;
}

const ControlButton: React.FC<ControlButton> = ({
  icon,
  title,
  onClick,
  dynamicIcon,
  alternateIcon,
}) => (
  <motion.button
    onClick={onClick}
    onMouseDown={(e) => e.stopPropagation()}
    className="floating-panel floating-button"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    title={title}
  >
    {dynamicIcon && alternateIcon ? alternateIcon : icon}
  </motion.button>
);

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  onPause,
  onReset,
  onFullscreen,
  onExport,
  onInvertColors,
  onScreenshot,
  onScenarioPanel,
  onSettingsPanel,
  onJsonPanel,
  isPaused,
  isFullscreen,
  isAudioPlaying,
  isAudioLoaded,
  onAudioToggle,
  disableSound,
  isSaveModalOpen,
}) => {
  const handleClick = useCallback(
    <T extends Element>(handler: (e: React.MouseEvent<T>) => void) =>
      (e: React.MouseEvent<T>) => {
        e.stopPropagation();
        handler(e);
      },
    []
  );

  const handleSimpleClick = useCallback(
    (handler: () => void) => (e: React.MouseEvent) => {
      e.stopPropagation();
      handler();
    },
    []
  );

  const topButtons: ControlButton[] = [
    {
      icon: <BsFillCameraFill size={20} />,
      title: "Take Screenshot",
      onClick: handleClick(onScreenshot),
    },
    {
      icon: <BsPlayFill size={20} />,
      title: isPaused ? "Resume Simulation" : "Pause Simulation",
      onClick: handleSimpleClick(onPause),
      dynamicIcon: true,
      alternateIcon: isPaused ? (
        <BsPlayFill size={20} />
      ) : (
        <BsPauseFill size={20} />
      ),
    },
    {
      icon: <BiReset size={20} />,
      title: "Reset Simulation",
      onClick: handleSimpleClick(onReset),
    },
    {
      icon: <MdFullscreen size={20} />,
      title: isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen",
      onClick: handleSimpleClick(onFullscreen),
      dynamicIcon: true,
      alternateIcon: isFullscreen ? (
        <MdFullscreenExit size={20} />
      ) : (
        <MdFullscreen size={20} />
      ),
    },
    {
      icon: <AiOutlineExport size={20} />,
      title: isSaveModalOpen ? "Close Export" : "Export Scenario",
      onClick: handleClick(onExport),
      dynamicIcon: true,
      alternateIcon: isSaveModalOpen ? (
        <AiOutlineClose size={20} />
      ) : (
        <AiOutlineExport size={20} />
      ),
    },
    {
      icon: <MdInvertColors size={20} />,
      title: "Invert Colors",
      onClick: handleSimpleClick(onInvertColors),
    },
  ];

  const bottomButtons: ControlButton[] = [
    {
      icon: <VscLibrary size={20} />,
      title: "Scenarios",
      onClick: handleClick(onScenarioPanel),
    },
    {
      icon: <IoCode size={20} />,
      title: "Load JSON",
      onClick: handleClick(onJsonPanel),
    },
    {
      icon: <SettingOutlined size={20} />,
      title: "Settings",
      onClick: handleClick(onSettingsPanel),
    },
  ];

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
            onToggle={handleClick(onAudioToggle)}
          />
        )}
        {topButtons.map((button, index) => (
          <ControlButton key={index} {...button} />
        ))}
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
        {bottomButtons.map((button, index) => (
          <ControlButton key={index} {...button} />
        ))}
      </div>
    </>
  );
};
