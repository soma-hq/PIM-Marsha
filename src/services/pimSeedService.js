const { Op } = require("sequelize");
const {
	defaultPimPages,
	defaultTrainings,
	defaultFeedEventTemplates,
} = require("../api/helpers/pimDefaults");

/**
 * Seeds Default Pages, Trainings, And Timeline Templates For A PIM
 * @param {Record<string, any>} models Sequelize Models Map
 * @param {string} pimId Target PIM Identifier
 * @returns {Promise<{ pim: any | null }>} Seed Result With Resolved PIM
 */

async function seedPimDefaults(models, pimId) {
	// load target
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
		const baseDate = new Date("2025-12-01T09:00:00.000Z");
		await models.feed_events.bulkCreate(
			templates.map((template, index) => ({
				pimId: pim.id,
				title: template.title,
				eventType: template.eventType,
				description: "Template evenement PIM",
				timelineSource: "planned",
				startAt: new Date(baseDate.getTime() + index * 60 * 60 * 1000),
				endAt: new Date(
					baseDate.getTime() + (index + 1) * 60 * 60 * 1000,
				),
			})),
		);
	}

	return { pim };
}

module.exports = {
	seedPimDefaults,
};
