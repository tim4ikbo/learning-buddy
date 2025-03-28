'use client'

import { useEffect, useState, useCallback } from 'react'
import PoolCard from './PoolCard'
import { usePoolContext } from '@/context/PoolContext'
import { useSession } from 'next-auth/react'

/**
 * Component that displays a grid of study pools
 * Handles loading, error states, and empty states
 * Uses PoolContext for filtered results based on search
 * @component PoolsList
 * @returns {JSX.Element} Grid of pool cards or appropriate status message
 */
export default function PoolsList() {
  // Local state for loading and error handling
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Access pool context for managing pool data
  const { filteredPools, setFilteredPools, setOriginalPools } = usePoolContext()
  const { data: session } = useSession()

  // Fetch pools data function
  const fetchPools = useCallback(async () => {
    try {
      const response = await fetch('/api/pools')
      if (!response.ok) {
        throw new Error('Failed to fetch pools')
      }
      const data = await response.json()
      // Update both original and filtered pools with fetched data
      setOriginalPools(data)
      setFilteredPools(data)
    } catch (error) {
      console.error('Error fetching pools:', error)
      setError('Failed to load pools. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }, [setOriginalPools, setFilteredPools])

  /**
   * Effect hook to fetch pools data on component mount
   * Updates both original and filtered pools in context
   */
  // Set up refetch function in context
  useEffect(() => {
    setFilteredPools([])
    fetchPools()
  })

  // Initial fetch
  useEffect(() => {
    fetchPools()
  }, [fetchPools])

  /**
   * Loading state with skeleton animation
   */
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

  /**
   * Error state with retry button
   */
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

  /**
   * Empty state when no pools are found
   * Shows different message based on whether it's due to filtering or no pools exist
   */
  if (filteredPools.length === 0) {
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
          {error || 'No study pools available. Create one to get started!'}
        </p>
      </div>
    )
  }

  /**
   * Main render - Grid of pool cards
   * Responsive grid that adjusts columns based on screen size
   */
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPools.map((pool) => (
        <PoolCard 
          key={pool.id} 
          pool={pool} 
          userId={session?.user?.id || ''}
        />
      ))}
    </div>
  )
} 