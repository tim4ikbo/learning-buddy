'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FaUsers, FaRegClock, FaEllipsisH } from 'react-icons/fa'

interface PoolCardProps {
  pool: {
    id: string
    name: string
    createdAt: string
    memberCount: number
  }
}

export default function PoolCard({ pool }: PoolCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 relative">
      <div className="p-6">
        {/* Header with title and menu */}
        <div className="flex justify-between items-start mb-4">
          <Link href={`/pools/${pool.id}`}>
            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {pool.name}
            </h3>
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaEllipsisH />
          </button>
        </div>

        {/* Pool Stats */}
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

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <Link
            href={`/pools/${pool.id}`}
            className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Open Pool
          </Link>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1">
            <button
              onClick={() => {/* Handle leave pool */}}
              className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
            >
              Leave Pool
            </button>
            <button
              onClick={() => {/* Handle delete pool */}}
              className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
            >
              Delete Pool
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
