'use client';

import { PoolCanvas } from '@/components/pools/PoolCanvas';
import UploadThingProvider from '@/components/providers/UploadThingProvider';

export default function PoolPage({ params }: { params: { id: string } }) {
  return (
    <UploadThingProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Pool Canvas</h1>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <PoolCanvas />
          </div>
        </div>
      </div>
    </UploadThingProvider>
  );
}
