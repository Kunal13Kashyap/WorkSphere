import mongoose from "mongoose";

const Schema = mongoose.Schema;

const InviteSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    orgId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Organization"
    },
    invitedBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    status: {
        type: String,
        enum: ["pending","accepted"],
        default: "pending"
    }
},{
    timestamps: true
});

InviteSchema.index({ orgId: 1, email: 1, status: 1 });
InviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const InviteModel = mongoose.model("Invite",InviteSchema);

export default InviteModel;