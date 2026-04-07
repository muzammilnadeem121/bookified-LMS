"use server";

import voiceSession from "@/database/models/voiceSession.model";
import { connectToDatabase } from "@/database/mongoose";
import { EndSessionResult, StartSessionResult } from "@/types";
import { getCurrentBillingPeriodStart } from "../subscription-constants";

export const createVoiceSession = async(clerkId : string, bookId : string) : Promise<StartSessionResult> =>{
    try {
        await connectToDatabase();

        const session = await voiceSession.create({clerkId, bookId, startedAt: new Date(), billingPeriodStart: getCurrentBillingPeriodStart(), durationSeconds: 0})
        return {
            success: true,
            sessionId: session._id.toString()
        }
    } catch (error) {
        console.error("error starting a voice session: "+ error);
        return {success: false, error: "Failed to satrt voice session. Please try again later"}
    }
}

export const endVoiceSession = async (sessionId : string, durationSeconds : number) : Promise<EndSessionResult>=>{
    try {
        await connectToDatabase();


        const result = await voiceSession.findByIdAndUpdate(
            sessionId,
            {
                endedAt: new Date(),
                durationSeconds
            }
        );

        if(!result) return { success: false, error: "Voice Session not found"}

        return { success: true }
    } catch (error) {
        console.error("Error ending voice session: " + error);
        return { success: false, error: "Failed to end Voice session. Please try again later." }
    }
}