'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PoolCanvas } from '@/components/pools/PoolCanvas';
import { AddPoolMemberButton } from '@/components/pools/AddPoolMemberButton';
import { PoolMembersList } from '@/components/pools/PoolMembersList';
import UploadThingProvider from '@/components/providers/UploadThingProvider';

export default function PoolPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const poolId = params.id as string;

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Checking access...</div>
      </div>
    );
  }

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
