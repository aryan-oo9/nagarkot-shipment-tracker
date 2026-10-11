import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { CreateShipmentPage } from './pages/CreateShipmentPage';
import { ShipmentDetailPage } from './pages/ShipmentDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        {/* Default redirect to shipments dashboard */}
        <Route index element={<Navigate to="/shipments" replace />} />
        
        {/* Core operational routes */}
        <Route path="shipments" element={<DashboardPage />} />
        <Route path="shipments/new" element={<CreateShipmentPage />} />
        <Route path="shipments/:id" element={<ShipmentDetailPage />} />
        
        {/* 404 Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
