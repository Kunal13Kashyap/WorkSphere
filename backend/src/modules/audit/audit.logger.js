import AuditModel from "./audit.model.js"

export const logAudit = async ({ action, actor, target, metadata = {}, status, ip }) => {
    try{
        if(!action || !actor || !status){
            console.warn("Invalid audit log params");
            return ;
        }

        await AuditModel.create({
            action,
            actor,
            target,
            metadata,
            status,
            ip
        });
    } catch(error){
        console.error("Audit logging failed:", error.message);
    }
}