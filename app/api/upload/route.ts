import { MAX_FILE_SIZE } from "@/lib/constants";
import { auth } from "@clerk/nextjs/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
    console.log("🚀 Upload API Route Hit");
    
    try {

        // Parse request body
        const body = await request.json() as HandleUploadBody;

        // Call handleUpload
        console.log("now handleUpload");
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                const { userId } = await auth();

                if (!userId) {
                    console.error(" User not authenticated");
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
                
                return config;
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log('File uploaded to blob: ', blob.url)

                const payload = tokenPayload ? JSON.parse(tokenPayload): null
                const userId = payload?.userId;
            }
        });
        
        return NextResponse.json(jsonResponse);
        
    } catch (error) {
        // console.error("Error type:", error?.constructor?.name);
        // console.error("Error message:", error instanceof Error ? error.message : String(error));
        // console.error("Error stack:", error instanceof Error ? error.stack : 'No stack');
        // console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        const status = message.includes("Unauthorized") ? 401 : 500;
        const clientMessage = status == 401 ? "Unauthorized" : "Upload Failed"
        return NextResponse.json(
            { 
                error: clientMessage,
                type: error?.constructor?.name,
                details: error instanceof Error ? error.stack : undefined
            },
            { status }
        );
    }
}