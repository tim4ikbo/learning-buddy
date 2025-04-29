import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { UserPlus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useParams } from 'next/navigation'

// Button and dialog component for adding a new member to a pool
export function AddPoolMemberButton() {
  // State for email input, loading indicator, and dialog open/close
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  // Get pool ID from route parameters
  const params = useParams()
  const poolId = params.id as string

  // Handle form submission to add a new member
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate email format
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Send POST request to add member to the pool
      const response = await fetch(`/api/pools/${poolId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      // Handle API errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || response.statusText)
      }
      
      // Show success notification and reset state
      toast.success(`Successfully added ${email} to the pool`)
      setEmail('')
      setIsOpen(false)
    } catch (error: any) {
      // Handle specific error messages and show notifications
      console.error('Error adding member:', error)
      
      if (error.message === 'User not found') {
        toast.error(`No user found with email ${email}`)
      } else if (error.message === 'User is already a member of this pool') {
        toast.error(`${email} is already a member of this pool`)
      } else {
        toast.error('Failed to add member. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          <span>Add Member</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Pool Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Input
              id="email"
              placeholder="Enter email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full"
              required
            />
          </div>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
