import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/dashboard/DashboardView';
import { DimensionView } from './components/dimension/DimensionView';
import { MonitoringView } from './components/monitoring/MonitoringView';
import { CommunityTrustView } from './components/trust/CommunityTrustView';
import { ReportsView } from './components/reports/ReportsView';
import { UserManagementView } from './components/users/UserManagementView';
import { MasterDataView } from './components/master/MasterDataView';
import { SettingsView } from './components/admin/SettingsView';

const MainAppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { requirements, evidences, dimensions } = useData();

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Memuat E-VIDEN OMBUDSMAN 2026...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  // Calculate counts for sidebar badges
  const nonSecondaryRequirements = requirements.filter((r) => {
    const dim = dimensions.find((d) => d.id === r.dimensionId);
    return !dim?.isSecondaryData;
  });

  const uncompleteCount = nonSecondaryRequirements.filter((req) => {
    const reqEvs = evidences.filter((e) => e.requirementId === req.id);
    return reqEvs.length === 0 || reqEvs.some((e) => e.verificationStatus === 'needs_revision');
  }).length;

  const pendingCount = evidences.filter((e) => e.verificationStatus === 'pending').length;
  const revisionCount = evidences.filter((e) => e.verificationStatus === 'needs_revision').length;
  const verifiedCount = evidences.filter((e) => e.verificationStatus === 'verified').length;

  const renderViewContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigateToDimension={(dimId) => setCurrentView(dimId)}
            onNavigateToMonitoring={(monView) => setCurrentView(monView)}
          />
        );

      case 'dim-input':
      case 'dim-proses':
      case 'dim-output':
      case 'dim-pengaduan':
        return <DimensionView dimensionId={currentView} />;

      case 'mon-all':
      case 'mon-uncomplete':
      case 'mon-pending':
      case 'mon-revision':
      case 'mon-verified':
        return <MonitoringView filterType={currentView} />;

      case 'trust':
        return <CommunityTrustView />;

      case 'report-summary':
        return <ReportsView onlyMissing={false} />;

      case 'report-missing':
        return <ReportsView onlyMissing={true} />;

      case 'admin-users':
        return <UserManagementView />;

      case 'admin-master':
        return <MasterDataView />;

      case 'admin-settings':
        return <SettingsView />;

      default:
        return (
          <DashboardView
            onNavigateToDimension={(dimId) => setCurrentView(dimId)}
            onNavigateToMonitoring={(monView) => setCurrentView(monView)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentView={currentView}
      />

      <div className="flex-1 flex relative">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={(v) => setCurrentView(v)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          counts={{
            uncomplete: uncompleteCount,
            pending: pendingCount,
            revision: revisionCount,
            verified: verifiedCount,
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderViewContent()}
        </main>
      </div>

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainAppContent />
      </DataProvider>
    </AuthProvider>
  );
}
