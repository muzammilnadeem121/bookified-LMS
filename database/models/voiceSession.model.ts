import { IVoiceSession } from "@/types";
import { model, models, Schema } from "mongoose";

const voiceSessionSchema = new Schema<IVoiceSession>({
        clerkId: {type: String, required: true, index: true},
        bookId: {type: Schema.Types.ObjectId, ref: "Book", required: true},
        startedAt: {type: Date, required: true},
        endedAt: {type: Date},
        durationSeconds: {type: Number, default: 0},
        billingPeriodStart: {type: Date, required: true},
}, {timestamps: true});

voiceSessionSchema.index({clerkId: 1, billingPeriodStart: 1})

const voiceSession = models.voiceSession || model<IVoiceSession>("voiceSession", voiceSessionSchema);

export default voiceSession;