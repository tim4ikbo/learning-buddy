import { Toaster } from 'react-hot-toast';

// Provides toast notification context for file uploads and other actions
export default function UploadThingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Wrap children with Toaster for global toast notifications
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
