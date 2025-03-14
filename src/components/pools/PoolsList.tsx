'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Pool {
  id: string
  name: string
  createdAt: string
  memberCount: number
}

export default function PoolsList() {
  const [pools, setPools] = useState<Pool[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const response = await fetch('/api/pools')
        if (!response.ok) {
          throw new Error('Failed to fetch pools')
        }
        const data = await response.json()
        setPools(data)
      } catch (error) {
        console.error('Error fetching pools:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPools()
  }, [])

  if (isLoading) {
    return <div>Loading pools...</div>
  }

  if (pools.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No study pools available. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pools.map((pool) => (
        <Link
          key={pool.id}
          href={`/pools/${pool.id}`}
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">{pool.name}</h3>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Members: {pool.memberCount}</span>
            <span>Created: {new Date(pool.createdAt).toLocaleDateString()}</span>
          </div>
        </Link>
      ))}
    </div>
  )
} 