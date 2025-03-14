'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreatePoolButton() {
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/pools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Study Pool',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create pool')
      }

      const data = await response.json()
      router.push(`/pools/${data.id}`)
    } catch (error) {
      console.error('Error creating pool:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <button
      onClick={handleCreate}
      disabled={isCreating}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
    >
      {isCreating ? 'Creating...' : 'Create New Pool'}
    </button>
  )
} 