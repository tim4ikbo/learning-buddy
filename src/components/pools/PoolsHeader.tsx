'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { FaSearch, FaUserCircle } from 'react-icons/fa'

export default function PoolsHeader() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Search */}
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

          {/* Right side - User Profile */}
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
