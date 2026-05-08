import mongoose from "mongoose";

const Schema = mongoose.Schema;

const OrgSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{
    timestamps: true
}
)

const OrgModel = mongoose.model("Organization",OrgSchema);

export default OrgModel;