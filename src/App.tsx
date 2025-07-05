import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/Navigation';
import Whiteboard from './components/Whiteboard';
import DSATracker from './components/DSATracker';
import Journal from './components/Journal';
import Savings from './components/Savings';
import { ActiveSection } from './types';

function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('whiteboard');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'whiteboard':
        return <Whiteboard />;
      case 'dsa':
        return <DSATracker />;
      case 'journal':
        return <Journal />;
      case 'savings':
        return <Savings />;
      default:
        return <Whiteboard />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navigation 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <main className="h-[calc(100vh-4rem)] overflow-auto">
          {renderActiveSection()}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;