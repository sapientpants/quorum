import * as React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '../components/layouts/AppLayout'
import { PageLoader } from '../components/ui/PageLoader'

// Lazy-loaded pages
const Welcome = React.lazy(() => import('../pages/Welcome').then(mod => ({ default: mod.Welcome })))
const Chat = React.lazy(() => import('../pages/Chat').then(mod => ({ default: mod.Chat })))
const Settings = React.lazy(() => import('../pages/Settings').then(mod => ({ default: mod.Settings })))
const Help = React.lazy(() => import('../pages/Help').then(mod => ({ default: mod.Help })))
const Templates = React.lazy(() => import('../pages/Templates').then(mod => ({ default: mod.Templates })))
const NotFound = React.lazy(() => import('../pages/NotFound').then(mod => ({ default: mod.NotFound })))
const ParticipantConfig = React.lazy(() => import('../pages/ParticipantConfigPage').then(mod => ({ default: mod.ParticipantConfigPage })))

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={
          <React.Suspense fallback={<PageLoader />}>
            <Welcome />
          </React.Suspense>
        } />
        <Route path="chat" element={
          <React.Suspense fallback={<PageLoader />}>
            <Chat />
          </React.Suspense>
        } />
        <Route path="settings" element={
          <React.Suspense fallback={<PageLoader />}>
            <Settings />
          </React.Suspense>
        } />
        <Route path="help" element={
          <React.Suspense fallback={<PageLoader />}>
            <Help />
          </React.Suspense>
        } />
        <Route path="templates" element={
          <React.Suspense fallback={<PageLoader />}>
            <Templates />
          </React.Suspense>
        } />
        <Route path="participants" element={
          <React.Suspense fallback={<PageLoader />}>
            <ParticipantConfig />
          </React.Suspense>
        } />
        <Route path="*" element={
          <React.Suspense fallback={<PageLoader />}>
            <NotFound />
          </React.Suspense>
        } />
      </Route>
    </Routes>
  )
} 