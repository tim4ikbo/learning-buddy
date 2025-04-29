/**
 * PoolCard component displays a summary card for a study pool, including:
 * - Pool name, creation date, member count
 * - Quick actions: open, leave, or delete pool
 * - Dropdown menu for additional actions
 *
 * Used within pool lists on the dashboard.
 */

'use client'

import { useState } from 'react'
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
// Props for PoolCard: pool info and current user ID
interface PoolCardProps {
  pool: {
    id: string           // Unique pool identifier
    name: string         // Pool display name
    createdAt: string    // ISO timestamp of pool creation
    memberCount: number  // Number of members in the pool
    creatorId: string    // ID of the pool creator
  }
  userId: string         // ID of the current user
}

/**
 * Card component that displays a study pool's information
 * Includes pool stats, quick actions, and a dropdown menu
 * @component PoolCard
 * @param {PoolCardProps} props - Component props
 * @returns {JSX.Element} Card displaying pool information and actions
 */
export default function PoolCard({ pool, userId }: PoolCardProps) {
  // State to control dropdown menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // State to indicate loading for async actions
  const [isLoading, setIsLoading] = useState(false)
  // Router for navigation and refreshing
  const router = useRouter()
  // Context setters for updating pool lists in parent components
  const { setFilteredPools, setOriginalPools } = usePoolContext()

  // Handler for leaving a pool
  const handleLeavePool = async () => {
    if (isLoading) return // Prevent duplicate requests
    if (pool.creatorId === userId) {
      // Creator cannot leave their own pool
      alert('As the creator, you cannot leave the pool. You can delete it instead.')
      return
    }

    try {
      setIsLoading(true)
      // Send PATCH request to leave the pool
      const response = await fetch(`/api/pools/${pool.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave' })
      })

      if (!response.ok) throw new Error('Failed to leave pool')
      
      // Fetch updated pools data after leaving
      const poolsResponse = await fetch('/api/pools')
      if (poolsResponse.ok) {
        const updatedPools = await poolsResponse.json()
        setOriginalPools(updatedPools)
        setFilteredPools(updatedPools)
      }
      
      // Refresh the page to reflect changes
      router.refresh()
    } catch (error) {
      console.error('Error leaving pool:', error)
      alert('Failed to leave pool. Please try again.')
    } finally {
      setIsLoading(false)
      setIsMenuOpen(false)
    }
  }

  // Handler for deleting a pool (only creator can delete)
  const handleDeletePool = async () => {
    if (isLoading) return // Prevent duplicate requests
    if (pool.creatorId !== userId) {
      // Only creator can delete the pool
      alert('Only the pool creator can delete the pool')
      return
    }

    // Confirm deletion with user
    if (!confirm('Are you sure you want to delete this pool? This action cannot be undone.')) {
      return
    }

    try {
      setIsLoading(true)
      // Send DELETE request to API
      const response = await fetch(`/api/pools/${pool.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete pool')
      
      // Fetch updated pools data after deletion
      const poolsResponse = await fetch('/api/pools')
      if (poolsResponse.ok) {
        const updatedPools = await poolsResponse.json()
        setOriginalPools(updatedPools)
        setFilteredPools(updatedPools)
      }
      
      // Refresh the page to reflect changes
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
        {/* Pool title and menu button section */}
        <div className="flex justify-between items-start mb-4">
          {/* Pool name links to pool details page */}
          <Link href={`/pools/${pool.id}`}>
            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {pool.name}
            </h3>
          </Link>
          {/* Dropdown menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Open pool menu"
          >
            <FaEllipsisH />
          </button>
        </div>

        {/* Pool statistics: member count and creation date */}
        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <FaUsers className="w-4 h-4 mr-2" />  
            {/* Show singular/plural for member count */}
            {pool.memberCount === 1 ? '1 member' : `${pool.memberCount} members`}
          </div>
          <div className="flex items-center text-gray-600">
            <FaRegClock className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {/* Format creation date for readability */}
              Created {new Date(pool.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Main action: open pool details page */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <Link
            href={`/pools/${pool.id}`}
            className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Open Pool
          </Link>
        </div>
      </div>

      {/* Dropdown menu for leaving or deleting pool */}
      {isMenuOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {/* Button to leave pool (disabled for creator) */}
            <button
              onClick={handleLeavePool}
              className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              role="menuitem"
              disabled={isLoading || pool.creatorId === userId}
            >
              {isLoading ? 'Processing...' : 'Leave Pool'}
            </button>
            {/* Button to delete pool (only for creator) */}
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
