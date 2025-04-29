'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Button component for creating a new study pool
export default function CreatePoolButton() {
  // State for loading indicator during pool creation
  const [isCreating, setIsCreating] = useState(false)
  // Next.js router for navigation
  const router = useRouter()

  // Handler for creating a new pool
  const handleCreate = async () => {
    setIsCreating(true)
    try {
      // Send POST request to create a new pool
      const response = await fetch('/api/pools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Study Pool',
        }),
      })

      // Handle API errors
      if (!response.ok) {
        throw new Error('Failed to create pool')
      }

      // Redirect to the newly created pool page
      const data = await response.json()
      router.push(`/pools/${data.id}`)
    } catch (error) {
      // Log errors to the console
      console.error('Error creating pool:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Render the create pool button
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