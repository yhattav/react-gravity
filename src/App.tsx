import React, { useEffect, useState, useCallback } from "react";
import { Layout } from "antd";
import { GravitySection } from "./sections/GravitySection";
import { DebugInfo } from "./components/DebugInfo";
import "./App.css";

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
        <h1 className="app-title">Gravity Simulator</h1>
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
