import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";
import { db } from "@/db";
import { files, poolMembers } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ 
    image: { 
      maxFileSize: "4MB",
      maxFileCount: 1
    } 
  })
    .input(
      z.object({
        poolId: z.string().min(1, "Pool ID is required"),
      })
    )
    .middleware(async ({ input, req }) => {
      try {
        // Get the session first to ensure user is authenticated
        const session = await auth();
        if (!session?.user?.id) {
          console.error('No authenticated user found');
          throw new Error("Please sign in to upload images");
        }

        const userId = session.user.id;
        console.log('Authenticated user:', userId);
        console.log('Uploading to pool:', input.poolId);

        // Verify pool exists and user has access
        const poolMember = await db.query.poolMembers.findFirst({
          where: and(
            eq(poolMembers.poolId, input.poolId),
            eq(poolMembers.userId, userId)
          )
        });

        if (!poolMember) {
          console.error('Pool access denied for user:', userId, 'pool:', input.poolId);
          throw new Error("You do not have access to this pool");
        }

        console.log('User has access to pool, proceeding with upload');
        return { 
          userId, 
          poolId: input.poolId,
          uploadedAt: new Date().toISOString()
        };
      } catch (error: any) {
        console.error('Upload middleware error:', error);
        throw new Error(error.message || 'Upload authorization failed');
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      if (!metadata?.userId || !metadata?.poolId) {
        console.error('Missing metadata:', metadata);
        throw new Error('Missing required upload metadata');
      }

      try {
        // Validate file data
        if (!file?.url || !file?.name || !file?.size || !file?.type) {
          console.error('Invalid file data:', file);
          throw new Error('Invalid file data received');
        }

        // Track the file in our database
        const fileId = createId();
        const fileData = {
          id: fileId,
          name: file.name,
          url: file.url,
          size: file.size,
          type: file.type,
          poolId: metadata.poolId,
          uploaderId: metadata.userId,
          uploadedAt: new Date(),
        } as const;

        await db.insert(files).values(fileData);
        console.log('File tracked in database:', fileId);
        
        // Return data in the expected format
        return { 
          name: file.name,
          size: file.size,
          url: file.url,
          key: fileId
        };
      } catch (error: any) {
        console.error('Upload completion error:', error);
        throw new Error(error.message || 'Failed to process upload');
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
