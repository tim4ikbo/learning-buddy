"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'

type PoolMember = {
  id: string
  userId: string
  role: string
  joinedAt: string
  name: string | null
  email: string
  image: string | null
}

export function PoolMembersList() {
  const [members, setMembers] = useState<PoolMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const poolId = params.id as string

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/pools/${poolId}/members`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch pool members')
        }
        
        const data = await response.json()
        setMembers(data)
      } catch (err) {
        console.error('Error fetching pool members:', err)
        setError('Failed to load pool members')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMembers()
  }, [poolId])

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse">Loading members...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mt-6">
      <h2 className="text-xl font-semibold mb-4">Pool Members ({members.length})</h2>
      
      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {member.image ? (
                <Image 
                  src={member.image} 
                  alt={member.name || member.email} 
                  width={40} 
                  height={40} 
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 font-medium">
                    {member.name ? member.name[0].toUpperCase() : member.email[0].toUpperCase()}
                  </span>
                </div>
              )}
              
              <div>
                <div className="font-medium">{member.name || 'Unknown'}</div>
                <div className="text-sm text-gray-500">{member.email}</div>
              </div>
            </div>
            
            <div className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
              {member.role}
            </div>
          </div>
        ))}
        
        {members.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No members found in this pool.
          </div>
        )}
      </div>
    </div>
  )
}
