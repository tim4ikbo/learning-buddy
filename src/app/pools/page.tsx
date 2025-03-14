import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import CreatePoolButton from '@/components/pools/CreatePoolButton'
import PoolsList from '@/components/pools/PoolsList'

export default async function PoolsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Study Pools</h1>
        <CreatePoolButton />
      </div>
      <PoolsList />
    </div>
  )
} 