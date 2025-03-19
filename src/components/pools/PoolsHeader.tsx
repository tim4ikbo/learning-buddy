'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { FaSearch, FaUserCircle } from 'react-icons/fa'
import { usePoolContext } from '@/context/PoolContext'

/**
 * Header component for the pools page that includes search functionality and user profile
 * @component PoolsHeader
 * @returns {JSX.Element} Header with search bar and user information
 */
export default function PoolsHeader() {
  // Get user session data for profile display
  const { data: session } = useSession()
  
  // Access pool context for search functionality
  const { searchQuery, setSearchQuery, originalPools, setFilteredPools } = usePoolContext()

  /**
   * Effect hook to filter pools based on search query
   * Runs whenever the search query or pool list changes
   */
  useEffect(() => {
    /**
     * Filters pools based on the current search query
     * Case-insensitive search on pool names
     */
    const filterPools = () => {
      const query = searchQuery.toLowerCase().trim()
      // If query is empty, show all pools
      if (!query) {
        setFilteredPools(originalPools)
        return
      }

      // Filter pools by name match
      const filtered = originalPools.filter((pool) =>
        pool.name.toLowerCase().includes(query)
      )
      setFilteredPools(filtered)
    }

    filterPools()
  }, [searchQuery, originalPools, setFilteredPools])

  return (
    <div className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Search input with icon */}
          <div className="relative flex-1 max-w-lg">
            <input
              type="text"
              placeholder="Search pools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* User profile section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <FaUserCircle className="w-8 h-8 text-gray-400" />
              )}
              <span className="text-sm font-medium">{session?.user?.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
