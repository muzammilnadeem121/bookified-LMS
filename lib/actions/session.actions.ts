"use server";

import voiceSession from "@/database/models/voiceSession.model";
import { connectToDatabase } from "@/database/mongoose";
import { EndSessionResult, StartSessionResult } from "@/types";

export const createVoiceSession = async(clerkId : string, bookId : string) : Promise<StartSessionResult> =>{
    try {
        await connectToDatabase();
        const { getUserPlan } = await import("@/lib/subscription.server");
        const { PLAN_LIMITS, getCurrentBillingPeriodStart } = await import("@/lib/subscription-constants");

        const plan = await getUserPlan();
        const limits = PLAN_LIMITS[plan];
        const billingPeriodStart = getCurrentBillingPeriodStart();

        const sessionCount = await voiceSession.countDocuments({
            clerkId,
            billingPeriodStart
        });

        if (sessionCount >= limits.maxSessionsPerMonth) {
            const { revalidatePath } = await import("next/cache");
            revalidatePath("/");

            return {
                success: false,
                error: `You have reached the monthly session limit for your ${plan} plan (${limits.maxSessionsPerMonth}). Please upgrade for more sessions.`,
                isBillingError: true,
            };
        }
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