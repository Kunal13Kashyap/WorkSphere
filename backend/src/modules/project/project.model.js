import mongoose from "mongoose"

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const ProjectSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    description: {
        type: String,
        default: "",
        maxlength: 500,
        trim: true
    },
    orgId: {
        type: ObjectId,
        ref: "Organization",
        required: true
    },
    status: {
        type: String,
        enum: ["active", "archived"],
        default: "active"
    },
    ownerId: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    createdBy: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null
    }
},{
    timestamps: true
});

ProjectSchema.index({ orgId: 1, isDeleted: 1, createdAt: -1 });
ProjectSchema.index({ orgId: 1, name: 1 },{ unique: true, partialFilterExpression: { isDeleted: false } });

const ProjectModel = mongoose.model("Project",ProjectSchema);

export default ProjectModel;