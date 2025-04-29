import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import CreatePoolButton from '@/components/pools/CreatePoolButton'
import PoolsList from '@/components/pools/PoolsList'
import PoolsHeader from '@/components/pools/PoolsHeader'
import { PoolProvider } from '@/context/PoolContext'

// Pools page component for listing and creating study pools
export default async function PoolsPage() {
  // Authenticate the user
  const session = await auth()

  // Redirect to login if not authenticated
  if (!session) {
    redirect('/login')
  }

  // Render the pools UI within the PoolProvider context
  return (
    <PoolProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <PoolsHeader />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Study Pools</h1>
              <p className="text-gray-600 mt-1">Create or join pools to study together</p>
            </div>
            <CreatePoolButton />
          </div>

          {/* Pools Grid */}
          <div className="mt-8">
            <PoolsList />
          </div>
        </div>
      </div>
    </PoolProvider>
  )
} 