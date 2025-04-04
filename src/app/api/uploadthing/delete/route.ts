import { UTApi } from "uploadthing/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Initialize the UTApi
const utapi = new UTApi();

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get file key from request
    const { fileKey } = await request.json();
    
    if (!fileKey) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 }
      );
    }
    
    // Delete the file using the key
    await utapi.deleteFiles(fileKey);
    
    return NextResponse.json({ 
      success: true,
      message: "File deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
