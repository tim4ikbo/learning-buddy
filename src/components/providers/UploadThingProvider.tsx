import { Toaster } from 'react-hot-toast';

export default function UploadThingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
