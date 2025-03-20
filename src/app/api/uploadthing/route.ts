import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Ensure environment variables are set
if (!process.env.UPLOADTHING_SECRET || !process.env.UPLOADTHING_TOKEN) {
  throw new Error('UploadThing credentials are not configured');
}

// Create route handlers for the Next.js API route
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter
});

// Configure UploadThing with environment variables
if (process.env.NODE_ENV === 'development') {
  console.log('UploadThing configured with:', {
    appId: process.env.UPLOADTHING_TOKEN?.slice(0, 8) + '...',
    secretKey: process.env.UPLOADTHING_SECRET?.slice(0, 8) + '...'
  });
}
