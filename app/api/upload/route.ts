import { MAX_FILE_SIZE } from "@/lib/constants";
import { auth } from "@clerk/nextjs/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
    console.log("🚀 Upload API Route Hit");
    
    try {
        // Check environment
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) {
            console.error("❌ BLOB_READ_WRITE_TOKEN is missing!");
            return NextResponse.json(
                { error: "Server configuration error: BLOB_READ_WRITE_TOKEN not set" },
                { status: 500 }
            );
        }
        console.log("✅ Token exists, prefix:", token.substring(0, 20));

        // Parse request body
        console.log("creating body as HandleUploadBody");
        const body = await request.json() as HandleUploadBody;
        console.log("✅ Body parsed:", JSON.stringify(body).substring(0, 100));

        // Call handleUpload
        console.log("now handleUpload");
        const jsonResponse = await handleUpload({
            body,
            request,
            token, // Explicitly pass token
            onBeforeGenerateToken: async (pathname) => {
                console.log("📝 onBeforeGenerateToken called for:", pathname);
                
                const { userId } = await auth();
                console.log("👤 User ID:", userId);

                if (!userId) {
                    console.error("❌ User not authenticated");
                    throw new Error("Unauthorized: User not authenticated");
                }

                const config = {
                    allowedContentTypes: [
                        "application/pdf",
                        "image/jpeg",
                        "image/png",
                        "image/webp"
                    ],
                    addRandomSuffix: true,
                    maximumSizeInBytes: MAX_FILE_SIZE,
                    tokenPayload: JSON.stringify({ userId })
                };
                
                console.log("✅ Returning config:", config);
                return config;
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log("✅ Upload completed successfully!");
                console.log("📁 Blob URL:", blob.url);
                console.log("📁 Blob pathname:", blob.pathname);
            }
        });

        console.log("✅ handleUpload succeeded");
        console.log("📤 Returning response:", JSON.stringify(jsonResponse).substring(0, 200));
        
        return NextResponse.json(jsonResponse);
        
    } catch (error) {
        console.error("❌❌❌ API Route Error ❌❌❌");
        console.error("Error type:", error?.constructor?.name);
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        console.error("Error stack:", error instanceof Error ? error.stack : 'No stack');
        console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        const status = message.includes("Unauthorized") ? 401 : 500;
        
        return NextResponse.json(
            { 
                error: message,
                type: error?.constructor?.name,
                details: error instanceof Error ? error.stack : undefined
            },
            { status }
        );
    }
}