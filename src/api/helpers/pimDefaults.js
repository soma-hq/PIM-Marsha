const config = require("../../config");
const {
	PAGE_TYPES,
	EVENT_TYPE,
	TRAINING_CATEGORY,
} = require("../../utils/constants");

/**
 * Builds the default PIM pages list
 * @returns {Array<{ title: string, slug: string, type: string, isRequired: boolean, position: number, content: string }>} Pages list
 */

function defaultPimPages() {
	return [
		{
			title: "Notes générales",
			slug: "notes-generales",
			type: PAGE_TYPES.NOTES_GENERALES,
			isRequired: true,
			position: 1,
			content: "Espace de notes globales pour toute l'équipe de tutorat.",
		},
		{
			title: "Remarques",
			slug: "remarques",
			type: PAGE_TYPES.REMARQUES,
			isRequired: true,
			position: 2,
			content: "Remarques prioritaires à lire avant toute action.",
		},
		{
			title: "Suivi des formations",
			slug: "suivi-formations",
			type: PAGE_TYPES.FORMATIONS,
			isRequired: true,
			position: 3,
			content:
				"Formations obligatoires (rouge) et ateliers de perfectionnement.",
		},
		{
			title: "Guide opérationnel",
			slug: "guide-operationnel",
			type: PAGE_TYPES.PRELUDE,
			isRequired: true,
			position: 4,
			content:
				"Rôles, responsabilités, procédure de suivi, calendrier, bilans vocaux, et cadre Marsha Academy.",
		},
	];
}

/**
 * Builds the default trainings list
 * @returns {Array<{ title: string, description: string, category: string, isRequired: boolean }>} Trainings list
 */

function defaultTrainings() {
	return [
		{
			title: "Règles et procédures de modération",
			description:
				"Protocoles de modération, seuils, escalade et documentation.",
			category: TRAINING_CATEGORY.OBLIGATOIRE,
			isRequired: true,
		},
		{
			title: "Culture Marsha Academy",
			description: "Valeurs, posture, autonomie et esprit d'équipe.",
			category: TRAINING_CATEGORY.OBLIGATOIRE,
			isRequired: true,
		},
		{
			title: "Soft skills et communication",
			description:
				"Communication non violente, feedback et conduite d'entretien.",
			category: TRAINING_CATEGORY.OBLIGATOIRE,
			isRequired: true,
		},
		{
			title: "Atelier de perfectionnement Live multi-plateforme",
			description:
				"Gestion pratique d'un live YouTube/Twitch avec incidents.",
			category: TRAINING_CATEGORY.PERFECTIONNEMENT,
			isRequired: false,
		},
	];
}

/**
 * Builds the default feed event template list
 * @returns {Array<{ title: string, eventType: string }>} Template list
 */

function defaultFeedEventTemplates() {
	return [
		{ title: "Live de prévu", eventType: EVENT_TYPE.LIVE_MULTI },
		{ title: "Bilan RRJ", eventType: EVENT_TYPE.ENTREVUE_RRJ },
		{ title: "Bilan RJ", eventType: EVENT_TYPE.ENTREVUE_RJ },
		{ title: "Animation", eventType: EVENT_TYPE.ATELIER },
	];
}

/**
 * Returns seed data for a junior based on template key
 * @param {string} template Template key
 * @returns {{ dispositif?: string, status?: string }} Junior seed data
 */

function juniorTemplate(template) {
	if (template === "ATRIA") {
		return { dispositif: "ATRIA", status: config.pim.juniorDefaultStatus };
	}

	if (template === "PULSE") {
		return { dispositif: "PULSE", status: config.pim.juniorDefaultStatus };
	}

	return {};
}

module.exports = {
	defaultPimPages,
	defaultTrainings,
	defaultFeedEventTemplates,
	juniorTemplate,
};
