const { Op } = require("sequelize");
const {
	defaultPimPages,
	defaultTrainings,
	defaultFeedEventTemplates,
} = require("../api/helpers/pimDefaults");
const { TIMELINE_SOURCE } = require("../utils/constants");
const config = require("../config");

/**
 * Seeds default pages, trainings, and timeline templates for a PIM
 * @param {Record<string, any>} models Sequelize models map
 * @param {string} pimId Target PIM identifier
 * @returns {Promise<{ pim: any | null }>} Seed result with resolved PIM
 */

async function seedPimDefaults(models, pimId) {
	const pim = await models.pims.findByPk(pimId);
	if (!pim) return { pim: null };

	const existingPagesCount = await models.pages.count({
		where: { pimId: pim.id },
	});
	if (existingPagesCount === 0) {
		await models.pages.bulkCreate(
			defaultPimPages().map((page) => ({ ...page, pimId: pim.id })),
		);
	}

	const existingTrainingsCount = await models.trainings.count({
		where: { pimId: pim.id },
	});
	if (existingTrainingsCount === 0) {
		await models.trainings.bulkCreate(
			defaultTrainings().map((training) => ({
				...training,
				pimId: pim.id,
			})),
		);
	}

	const templates = defaultFeedEventTemplates();
	const existingTemplateCount = await models.feed_events.count({
		where: {
			pimId: pim.id,
			title: { [Op.in]: templates.map((item) => item.title) },
		},
	});

	if (existingTemplateCount === 0) {
		const baseDate = new Date(config.pim.templateEventBaseDate);
		await models.feed_events.bulkCreate(
			templates.map((template, index) => ({
				pimId: pim.id,
				title: template.title,
				eventType: template.eventType,
				description: config.pim.templateEventDescription,
				timelineSource: TIMELINE_SOURCE.PLANNED,
				startAt: new Date(
					baseDate.getTime() +
						index * config.pim.templateEventDurationMs,
				),
				endAt: new Date(
					baseDate.getTime() +
						(index + 1) * config.pim.templateEventDurationMs,
				),
			})),
		);
	}

	return { pim };
}

module.exports = {
	seedPimDefaults,
};
