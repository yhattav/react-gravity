import React, { useEffect, useState, useCallback } from "react";
import { Layout } from "antd";
import {
  GithubOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  BugOutlined,
} from "@ant-design/icons";
import { GravitySection } from "./sections/GravitySection";
import { DebugInfo } from "./components/DebugInfo";
import { DebugData } from "./types/Debug";
import "./App.css";
import { ReactLogoIcon } from "./components/ReactLogoIcon/ReactLogoIcon";
import "./styles/mobile.scss";
import { debounce } from "lodash";

const { Content, Header } = Layout;

function App() {
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  const handleDebugData = useCallback((data: DebugData) => {
    setDebugData(data);
  }, []);

  useEffect(() => {
    const handleResize = debounce(() => {
      setIsMobileView(window.innerWidth < 768);
    }, 100);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!document.getElementById("cursor-container")) {
      const cursorContainer = document.createElement("div");
      cursorContainer.id = "cursor-container";
      cursorContainer.style.position = "fixed";
      cursorContainer.style.top = "0";
      cursorContainer.style.left = "0";
      cursorContainer.style.pointerEvents = "none";
      cursorContainer.style.zIndex = "9999";
      document.body.appendChild(cursorContainer);
    }

    return () => {
      const container = document.getElementById("cursor-container");
      if (container) {
        document.body.removeChild(container);
      }
    };
  }, []);

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="header-content">
          <div style={{ display: "flex", alignItems: "center" }}>
            <ReactLogoIcon />
            <h1 className="app-title">Gravity Simulator</h1>
          </div>
          <div className="header-icons">
            <a
              href="https://github.com/yhattav/react-gravity"
              target="_blank"
              rel="noopener noreferrer"
              className="header-icon"
              title="View Source Code"
            >
              <GithubOutlined />
            </a>
            <a
              href="https://github.com/yhattav/react-gravity/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="header-icon"
              title="Report Issues"
            >
              <BugOutlined />
            </a>
            <a
              href="https://github.com/yhattav/react-gravity/wiki"
              target="_blank"
              rel="noopener noreferrer"
              className="header-icon"
              title="Documentation"
            >
              <QuestionCircleOutlined />
            </a>
            <a
              href="https://github.com/yhattav/react-gravity/blob/main/README.md#configuration"
              target="_blank"
              rel="noopener noreferrer"
              className="header-icon"
              title="Configuration Guide"
            >
              <SettingOutlined />
            </a>
          </div>
        </div>
      </Header>
      <Layout>
        <Content className="app-content">
          <GravitySection onDebugData={handleDebugData} />
        </Content>
        {!isMobileView && (
          <Layout.Sider
            className="app-sider"
            width="20%"
            style={{ overflow: "scroll" }}
          >
            {debugData && <DebugInfo data={debugData} />}
          </Layout.Sider>
        )}
      </Layout>
    </Layout>
  );
}

export default App;
