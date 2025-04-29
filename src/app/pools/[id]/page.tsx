'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PoolCanvas } from '@/components/pools/PoolCanvas';
import { AddPoolMemberButton } from '@/components/pools/AddPoolMemberButton';
import { PoolMembersList } from '@/components/pools/PoolMembersList';
import UploadThingProvider from '@/components/providers/UploadThingProvider';

// Pool page component for collaborative canvas and member management
export default function PoolPage() {
  // Get route parameters and router instance
  const params = useParams();
  const router = useRouter();
  // State for access check and loading indicator
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const poolId = params.id as string;

  // Check if the user has access to the pool on mount
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch(`/api/pools/${poolId}/access`);
        
        if (response.ok) {
          setHasAccess(true);
        } else {
          // Redirect to home page if access is denied
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking pool access:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [poolId, router]);

  // Show loading indicator while checking access
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Checking access...</div>
      </div>
    );
  }

  // If user has no access, nothing is rendered (redirect handled by useEffect)
  if (!hasAccess) {
    return null; // Will be redirected by the useEffect
  }

  return (
    <UploadThingProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Pool Canvas</h1>
            <AddPoolMemberButton />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <PoolCanvas />
          </div>
          
          <PoolMembersList />
        </div>
      </div>
    </UploadThingProvider>
  );
}
