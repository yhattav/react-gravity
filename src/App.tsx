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
import "./App.css";
import "./styles/theme.scss";

const { Content, Header } = Layout;

interface DebugData {
  [key: string]: any;
}

function App() {
  const [debugData, setDebugData] = useState<DebugData | null>(null);

  const handleDebugData = useCallback((data: DebugData) => {
    setDebugData(data);
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
          <h1 className="app-title">Gravity Simulator</h1>
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
        <Layout.Sider className="app-sider" width="20%">
          {debugData && <DebugInfo data={debugData} />}
        </Layout.Sider>
      </Layout>
    </Layout>
  );
}

export default App;
