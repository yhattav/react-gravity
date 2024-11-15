import React, { useEffect, useState, useCallback } from 'react';
import { Layout, Tabs } from 'antd';
import {
  DemoSection,
  GravitySection,
  PaintSection,
  ContentRevealSection,
  EntryAnimationSection,
  GallerySection,
} from './sections';
import { Section } from './types/Section';
import { DebugInfo } from './components/DebugInfo';

const { Content, Header } = Layout;
const { TabPane } = Tabs;

// Define all sections
const sections: Section[] = [
  {
    id: 'demo',
    title: 'Basic Demo',
    component: DemoSection,
    height: '100vh',
  },
  {
    id: 'entry-animation',
    title: 'Entry Animation',
    component: EntryAnimationSection,
    height: '100vh',
  },
  {
    id: 'gravity',
    title: 'Gravity',
    component: GravitySection,
    height: '100vh',
  },
  {
    id: 'paint',
    title: 'Paint',
    component: PaintSection,
    height: '100vh',
  },
  {
    id: 'content-reveal',
    title: 'Content Reveal',
    component: ContentRevealSection,
    height: '100vh',
  },
  {
    id: 'gallery',
    title: 'Gallery',
    component: GallerySection,
    height: '100vh',
  },
];

// Add type for debug data
interface DebugData {
  [key: string]: any;
}

function App() {
  const [activeSection, setActiveSection] = useState(() => {
    const saved = localStorage.getItem('activeSection');
    return saved || 'gravity';
  });

  const [debugData, setDebugData] = useState<DebugData | null>(null);

  useEffect(() => {
    localStorage.setItem('activeSection', activeSection);
  }, [activeSection]);

  const CurrentSection = sections.find(
    (section) => section.id === activeSection
  )?.component;

  const handleDebugData = useCallback((data: DebugData) => {
    setDebugData(data);
  }, []);

  useEffect(() => {
    // Create a container for cursors if it doesn't exist
    if (!document.getElementById('cursor-container')) {
      const cursorContainer = document.createElement('div');
      cursorContainer.id = 'cursor-container';
      cursorContainer.style.position = 'fixed';
      cursorContainer.style.top = '0';
      cursorContainer.style.left = '0';
      cursorContainer.style.pointerEvents = 'none';
      cursorContainer.style.zIndex = '9999';
      document.body.appendChild(cursorContainer);
    }

    return () => {
      const container = document.getElementById('cursor-container');
      if (container) {
        document.body.removeChild(container);
      }
    };
  }, []);

  return (
    <Layout style={{ height: '100vh' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 16px',
          height: 'auto',
          lineHeight: 'normal',
        }}
      >
        <Tabs
          activeKey={activeSection}
          onChange={setActiveSection}
          style={{ marginBottom: 0 }}
        >
          {sections.map(({ id, title }) => (
            <TabPane tab={title} key={id} />
          ))}
        </Tabs>
      </Header>
      <Layout>
        <Content
          style={{
            position: 'relative',
            height: 'calc(100vh - 64px)',
            overflow: 'hidden',
          }}
        >
          {CurrentSection && <CurrentSection onDebugData={handleDebugData} />}
        </Content>
        <Layout.Sider
          width="20%"
          style={{
            background: '#fff',
            minWidth: '300px',
            height: 'calc(100vh - 64px)',
            overflow: 'auto',
          }}
        >
          {debugData && <DebugInfo data={debugData} />}
        </Layout.Sider>
      </Layout>
    </Layout>
  );
}

export default App;
