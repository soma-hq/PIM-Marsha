/**
 * Builds Default PIM Pages
 * @returns {Array<{ title: string, slug: string, type: string, isRequired: boolean, position: number, content: string }>} Pages List
 */

function defaultPimPages() {
	// Default content
	return [
		{
			title: "Notes générales",
			slug: "notes-generales",
			type: "notes_generales",
			isRequired: true,
			position: 1,
			content: "Espace de notes globales pour toute l'équipe de tutorat.",
		},
		{
			title: "Remarques",
			slug: "remarques",
			type: "remarques",
			isRequired: true,
			position: 2,
			content: "Remarques prioritaires à lire avant toute action.",
		},
		{
			title: "Suivi des formations",
			slug: "suivi-formations",
			type: "formations",
			isRequired: true,
			position: 3,
			content:
				"Formations obligatoires (rouge) et ateliers de perfectionnement.",
		},
		{
			title: "Guide opérationnel",
			slug: "guide-operationnel",
			type: "prelude",
			isRequired: true,
			position: 4,
			content:
				"Rôles, responsabilités, procédure de suivi, calendrier, bilans vocaux, et cadre Marsha Academy.",
		},
	];
}

/**
 * Builds Default Trainings
 * @returns {Array<{ title: string, description: string, category: string, isRequired: boolean }>} Trainings List
 */

function defaultTrainings() {
	return [
		{
			title: "Règles et procédures de modération",
			description:
				"Protocoles de modération, seuils, escalade et documentation.",
			category: "obligatoire",
			isRequired: true,
		},
		{
			title: "Culture Marsha Academy",
			description: "Valeurs, posture, autonomie et esprit d'équipe.",
			category: "obligatoire",
			isRequired: true,
		},
		{
			title: "Soft skills et communication",
			description:
				"Communication non violente, feedback et conduite d'entretien.",
			category: "obligatoire",
			isRequired: true,
		},
		{
			title: "Atelier de perfectionnement Live multi-plateforme",
			description:
				"Gestion pratique d'un live YouTube/Twitch avec incidents.",
			category: "perfectionnement",
			isRequired: false,
		},
	];
}

/**
 * Builds Default Event Templates
 * @returns {Array<{ title: string, eventType: string }>} Template List
 */

function defaultFeedEventTemplates() {
	return [
		{ title: "Live de prévu", eventType: "live_multi" },
		{ title: "Bilan RRJ", eventType: "entrevue_rrj" },
		{ title: "Bilan RJ", eventType: "entrevue_rj" },
		{ title: "Animation", eventType: "atelier" },
	];
}

/**
 * Builds Default Junior Data
 * @param {string} template Template Key
 * @returns {{ dispositif?: string, status?: string }} Junior Seed
 */

function juniorTemplate(template) {
	if (template === "ATRIA") {
		return {
			// ATRIA template
			dispositif: "ATRIA",
			status: "non_debutee",
		};
	}

	// PULSE template
	if (template === "PULSE") {
		return {
			dispositif: "PULSE",
			status: "non_debutee",
		};
	}

	return {};
}

module.exports = {
	defaultPimPages,
	defaultTrainings,
	defaultFeedEventTemplates,
	juniorTemplate,
};
