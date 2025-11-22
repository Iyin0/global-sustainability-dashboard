import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { QueryClient } from '@tanstack/react-query'
import Navigation from '@/components/Navigation'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <div className="min-h-screen flex flex-col relative">
        <Navigation />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <TanStackRouterDevtools />
    </>
  )
}