'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

/**
 * Represents a study pool with its basic information
 * @interface Pool
 * @property {string} id - Unique identifier for the pool
 * @property {string} name - Display name of the pool
 * @property {string} createdAt - ISO timestamp of pool creation
 * @property {number} memberCount - Number of members in the pool
 * @property {string} creatorId - ID of the user who created the pool
 */
interface Pool {
  id: string
  name: string
  createdAt: string
  memberCount: number
  creatorId: string
}

/**
 * Type definition for the Pool context state and methods
 * @interface PoolContextType
 * @property {string} searchQuery - Current search term for filtering pools
 * @property {function} setSearchQuery - Updates the search query
 * @property {Pool[]} filteredPools - List of pools filtered by search query
 * @property {function} setFilteredPools - Updates the filtered pools list
 * @property {Pool[]} originalPools - Complete list of unfiltered pools
 * @property {function} setOriginalPools - Updates the original pools list
 */
interface PoolContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredPools: Pool[]
  setFilteredPools: (pools: Pool[]) => void
  originalPools: Pool[]
  setOriginalPools: (pools: Pool[]) => void
}

// Create the context with undefined as initial value
const PoolContext = createContext<PoolContextType | undefined>(undefined)

/**
 * Provider component that wraps parts of the app that need access to the pool context
 * @component PoolProvider
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components that will have access to the context
 * @returns {JSX.Element} Provider component with the pool context
 */
export function PoolProvider({ children }: { children: ReactNode }) {
  // State for the search functionality
  const [searchQuery, setSearchQuery] = useState('')
  
  // State for pools that match the search criteria
  const [filteredPools, setFilteredPools] = useState<Pool[]>([])
  
  // State for the complete list of pools before filtering
  const [originalPools, setOriginalPools] = useState<Pool[]>([])

  return (
    <PoolContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        filteredPools,
        setFilteredPools,
        originalPools,
        setOriginalPools,
      }}
    >
      {children}
    </PoolContext.Provider>
  )
}

/**
 * Custom hook to access the pool context
 * @function usePoolContext
 * @returns {PoolContextType} The pool context object containing state and methods
 * @throws {Error} If used outside of PoolProvider
 */
export function usePoolContext() {
  const context = useContext(PoolContext)
  
  // Ensure the hook is used within a provider
  if (context === undefined) {
    throw new Error('usePoolContext must be used within a PoolProvider')
  }
  
  return context
}
