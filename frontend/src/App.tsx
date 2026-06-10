import { useState } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { Sidebar } from './Sidebar';
import type { PageId } from './Sidebar';
import { Dashboard } from './pages/Dashboard';
import { RiskAssessment } from './pages/RiskAssessment';
import { ModelAnalytics } from './pages/ModelAnalytics';
import { AboutModel } from './pages/AboutModel';
import './App.css';

function AppContent() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Render Page based on State
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigateToAssessment={() => setActivePage('assessment')} />;
      case 'assessment':
        return <RiskAssessment />;
      case 'analytics':
        return <ModelAnalytics />;
      case 'about':
        return <AboutModel />;
      default:
        return <Dashboard onNavigateToAssessment={() => setActivePage('assessment')} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Panel Content */}
      <main className="flex-1 overflow-y-auto h-screen md:h-auto">
        {renderPage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
