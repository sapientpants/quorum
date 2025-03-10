import * as React from 'react'
import { createBrowserRouter, RouteObject } from 'react-router-dom'
import { AppLayout } from '../components/layouts/AppLayout'

// Lazy-loaded pages
const Welcome = React.lazy(() => import('../pages/Welcome').then(mod => ({ default: mod.Welcome })))
const Chat = React.lazy(() => import('../pages/Chat').then(mod => ({ default: mod.Chat })))
const Settings = React.lazy(() => import('../pages/Settings').then(mod => ({ default: mod.Settings })))
const Help = React.lazy(() => import('../pages/Help').then(mod => ({ default: mod.Help })))
const Templates = React.lazy(() => import('../pages/Templates').then(mod => ({ default: mod.Templates })))
const NotFound = React.lazy(() => import('../pages/NotFound').then(mod => ({ default: mod.NotFound })))

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
)

const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <React.Suspense fallback={<PageLoader />}>
            <Welcome />
          </React.Suspense>
        ),
      },
      {
        path: 'chat',
        element: (
          <React.Suspense fallback={<PageLoader />}>
            <Chat />
          </React.Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <React.Suspense fallback={<PageLoader />}>
            <Settings />
          </React.Suspense>
        ),
      },
      {
        path: 'help',
        element: (
          <React.Suspense fallback={<PageLoader />}>
            <Help />
          </React.Suspense>
        ),
      },
      {
        path: 'templates',
        element: (
          <React.Suspense fallback={<PageLoader />}>
            <Templates />
          </React.Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <React.Suspense fallback={<PageLoader />}>
            <NotFound />
          </React.Suspense>
        ),
      },
    ],
  },
]

export const router = createBrowserRouter(routes) 