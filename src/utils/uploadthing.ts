import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Generate Uploadthing React hooks for file uploads, typed to the app's file router
// - useUploadThing: React hook for uploading files from components
// - uploadFiles: utility for uploading files programmatically
export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();
