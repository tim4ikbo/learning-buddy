'use client'

import { useEffect, useState } from 'react'
import PoolCard from './PoolCard'

interface Pool {
  id: string
  name: string
  createdAt: string
  memberCount: number
}

export default function PoolsList() {
  const [pools, setPools] = useState<Pool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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
        setError('Failed to load pools. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPools()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-36"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-blue-600 hover:text-blue-800 underline"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (pools.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <img
            src="/empty-pools.svg"
            alt="No pools"
            className="w-48 h-48 mx-auto opacity-50"
          />
        </div>
        <p className="text-gray-500 text-lg mb-4">
          No study pools available. Create one to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pools.map((pool) => (
        <PoolCard key={pool.id} pool={pool} />
      ))}
    </div>
  )
} 