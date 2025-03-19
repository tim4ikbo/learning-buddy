'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { FaUsers, FaRegClock, FaEllipsisH } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { usePoolContext } from '@/context/PoolContext'

/**
 * Props interface for the PoolCard component
 * @interface PoolCardProps
 * @property {Object} pool - Pool data to display
 * @property {string} pool.id - Unique identifier for the pool
 * @property {string} pool.name - Display name of the pool
 * @property {string} pool.createdAt - ISO timestamp of pool creation
 * @property {number} pool.memberCount - Number of members in the pool
 * @property {string} pool.creatorId - ID of the pool creator
 */
interface PoolCardProps {
  pool: {
    id: string
    name: string
    createdAt: string
    memberCount: number
    creatorId: string
  }
  userId: string
}

/**
 * Card component that displays a study pool's information
 * Includes pool stats, quick actions, and a dropdown menu
 * @component PoolCard
 * @param {PoolCardProps} props - Component props
 * @returns {JSX.Element} Card displaying pool information and actions
 */
export default function PoolCard({ pool, userId }: PoolCardProps) {
  // State for dropdown menu visibility and loading state
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setFilteredPools, setOriginalPools } = usePoolContext()

  const handleLeavePool = async () => {
    if (isLoading) return
    if (pool.creatorId === userId) {
      alert('As the creator, you cannot leave the pool. You can delete it instead.')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/pools/${pool.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave' })
      })

      if (!response.ok) throw new Error('Failed to leave pool')
      
      // Fetch updated pools data
      const poolsResponse = await fetch('/api/pools')
      if (poolsResponse.ok) {
        const updatedPools = await poolsResponse.json()
        setOriginalPools(updatedPools)
        setFilteredPools(updatedPools)
      }
      
      router.refresh()
    } catch (error) {
      console.error('Error leaving pool:', error)
      alert('Failed to leave pool. Please try again.')
    } finally {
      setIsLoading(false)
      setIsMenuOpen(false)
    }
  }

  const handleDeletePool = async () => {
    if (isLoading) return
    if (pool.creatorId !== userId) {
      alert('Only the pool creator can delete the pool')
      return
    }

    if (!confirm('Are you sure you want to delete this pool? This action cannot be undone.')) {
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/pools/${pool.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete pool')
      
      // Fetch updated pools data
      const poolsResponse = await fetch('/api/pools')
      if (poolsResponse.ok) {
        const updatedPools = await poolsResponse.json()
        setOriginalPools(updatedPools)
        setFilteredPools(updatedPools)
      }
      
      router.refresh()
    } catch (error) {
      console.error('Error deleting pool:', error)
      alert('Failed to delete pool. Please try again.')
    } finally {
      setIsLoading(false)
      setIsMenuOpen(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 relative">
      <div className="p-6">
        {/* Pool title and menu button */}
        <div className="flex justify-between items-start mb-4">
          <Link href={`/pools/${pool.id}`}>
            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {pool.name}
            </h3>
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Open pool menu"
          >
            <FaEllipsisH />
          </button>
        </div>

        {/* Pool statistics section */}
        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <FaUsers className="w-4 h-4 mr-2" />
            <span className="text-sm">{pool.memberCount} members</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FaRegClock className="w-4 h-4 mr-2" />
            <span className="text-sm">
              Created {new Date(pool.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Primary action button */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <Link
            href={`/pools/${pool.id}`}
            className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Open Pool
          </Link>
        </div>
      </div>

      {/* Dropdown menu for additional actions */}
      {isMenuOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            <button
              onClick={handleLeavePool}
              className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              role="menuitem"
              disabled={isLoading || pool.creatorId === userId}
            >
              {isLoading ? 'Processing...' : 'Leave Pool'}
            </button>
            <button
              onClick={handleDeletePool}
              className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100 disabled:opacity-50"
              role="menuitem"
              disabled={isLoading || pool.creatorId !== userId}
            >
              {isLoading ? 'Processing...' : 'Delete Pool'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
