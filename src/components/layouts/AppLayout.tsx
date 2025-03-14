import { Outlet } from 'react-router-dom';
import { NetworkStatusIndicator } from '../NetworkStatusIndicator';
import { ApiErrorModal } from '../ApiErrorModal';

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <Outlet />
      </main>
      <NetworkStatusIndicator position="bottom-right" />
      <ApiErrorModal />
    </div>
  );
}