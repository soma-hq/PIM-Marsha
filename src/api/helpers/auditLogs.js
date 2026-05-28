/**
 * Writes Audit Log Entry
 * @param {any} app App Container
 * @param {{ actorId?: string|null, actorEmail?: string|null, actionType: string, resourceType: string, resourceId?: string|null, status?: string, metadata?: any }} payload Log Payload
 * @returns {Promise<void>} Async Done
 */

async function writeAuditLog(app, payload) {
	const model = app.database.models.audit_logs;
	if (!model) return;

	try {
		await model.create({
			actorId: payload.actorId || null,
			actorEmail: payload.actorEmail || null,
			actionType: payload.actionType,
			resourceType: payload.resourceType,
			resourceId: payload.resourceId || null,
			status: payload.status || "SUCCESS",
			metadata: payload.metadata || null,
		});
	} catch (error) {
		app.logger.warn(`Audit log skipped: ${error.message}`);
	}
}

module.exports = {
	writeAuditLog,
};
