import mongoose from "mongoose"

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const TaskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    description: {
        type: String,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ["todo","in_progress","done"],
        default: "todo"
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    assignedTo: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    projectId: {
        type: ObjectId,
        ref: "Project",
        required: true
    },
    orgId: {
        type: ObjectId,
        ref: "Organization",
        required: true
    },
    createdBy: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    startedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    }
},{
    timestamps: true
});

TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ createdBy: 1 });
TaskSchema.index({ orgId: 1, assignedTo: 1 });
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ orgId: 1, projectId: 1, isArchived: 1 });

const TaskModel = mongoose.model("Task",TaskSchema);

export default TaskModel;