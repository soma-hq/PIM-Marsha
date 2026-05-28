const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const config = require("../src/config");

const prisma = new PrismaClient();

async function main() {
	const organizations = config.organizations;
	const users = config.users;
	const organizationMap = new Map();

	for (const organization of organizations) {
		const row = await prisma.organization.upsert({
			where: { name: organization.name },
			update: { logoKey: organization.logoKey },
			create: organization,
		});
		organizationMap.set(row.name, row.id);
	}

	for (const user of users) {
		const passwordHash = await bcrypt.hash(user.password, 10);
		const organizationId = user.organizationName
			? organizationMap.get(user.organizationName) || null
			: null;
		const role = user.role.toUpperCase();
		await prisma.user.upsert({
			where: { email: user.email },
			update: {
				name: user.name,
				firstName: user.firstName,
				lastName: user.lastName,
				organizationId,
				role,
			},
			create: {
				email: user.email,
				name: user.name,
				firstName: user.firstName,
				lastName: user.lastName,
				organizationId,
				role,
				passwordHash,
			},
		});
	}

	let pim = await prisma.pim.findUnique({
		where: { code: "PIMY-01-12-2025" },
	});
	if (!pim) {
		pim = await prisma.pim.create({
			data: {
				title: "PIMY : 01/12/2025",
				code: "PIMY-01-12-2025",
				organizationId: organizationMap.get("Michou") || null,
				confidentialityText:
					"Session privée et confidentielle. Le partage externe est strictement interdit et peut entraîner une révocation immédiate.",
				startDate: new Date("2025-12-01T00:00:00.000Z"),
				isPrivate: true,
			},
		});
	}

	const pages = [
		{
			title: "Notes générales",
			slug: "notes-generales",
			type: "NOTES_GENERALES",
			content: "Espace de notes globales pour toute l'équipe de tutorat.",
			isRequired: true,
			position: 1,
		},
		{
			title: "Remarques",
			slug: "remarques",
			type: "REMARQUES",
			content: "Remarques prioritaires à lire avant toute action.",
			isRequired: true,
			position: 2,
		},
		{
			title: "Suivi des formations",
			slug: "suivi-formations",
			type: "FORMATIONS",
			content:
				"Formations obligatoires (rouge) et ateliers de perfectionnement.",
			isRequired: true,
			position: 3,
		},
		{
			title: "Guide opérationnel",
			slug: "guide-operationnel",
			type: "GUIDE_OPERATIONNEL",
			content:
				"Rôles, responsabilités, procédure de suivi, calendrier, bilans vocaux, et cadre Marsha Academy.",
			isRequired: true,
			position: 4,
		},
	];

	for (const page of pages) {
		await prisma.page.upsert({
			where: {
				pimId_slug: {
					pimId: pim.id,
					slug: page.slug,
				},
			},
			update: page,
			create: { ...page, pimId: pim.id },
		});
	}

	const trainings = [
		{
			title: "Règles et procédures de modération",
			description:
				"Protocoles de modération, seuils, escalade et documentation.",
			category: "OBLIGATOIRE",
			isRequired: true,
		},
		{
			title: "Culture Marsha Academy",
			description: "Valeurs, posture, autonomie et esprit d'équipe.",
			category: "OBLIGATOIRE",
			isRequired: true,
		},
		{
			title: "Soft skills et communication",
			description:
				"Communication non violente, feedback et conduite d'entretien.",
			category: "OBLIGATOIRE",
			isRequired: true,
		},
		{
			title: "Atelier de perfectionnement Live multi-plateforme",
			description:
				"Gestion pratique d'un live YouTube/Twitch avec incidents.",
			category: "PERFECTIONNEMENT",
			isRequired: false,
		},
	];

	for (const training of trainings) {
		await prisma.training.upsert({
			where: {
				pimId_title: {
					pimId: pim.id,
					title: training.title,
				},
			},
			update: training,
			create: { ...training, pimId: pim.id },
		});
	}

	const events = [
		{
			title: "Template - Zone vocaux",
			eventType: "VOCAL",
			startAt: "2025-12-01T09:00:00.000Z",
			endAt: "2025-12-01T10:00:00.000Z",
		},
		{
			title: "Template - Vocal de bilan",
			eventType: "VOCAL_BILAN",
			startAt: "2025-12-01T10:00:00.000Z",
			endAt: "2025-12-01T11:00:00.000Z",
		},
		{
			title: "Template - Entrevue RJ",
			eventType: "ENTREVUE_RJ",
			startAt: "2025-12-01T11:00:00.000Z",
			endAt: "2025-12-01T12:00:00.000Z",
		},
		{
			title: "Template - Entrevue RRJ",
			eventType: "ENTREVUE_RRJ",
			startAt: "2025-12-01T13:00:00.000Z",
			endAt: "2025-12-01T14:00:00.000Z",
		},
		{
			title: "Template - Live YouTube",
			eventType: "LIVE_YOUTUBE",
			startAt: "2025-12-01T14:00:00.000Z",
			endAt: "2025-12-01T15:00:00.000Z",
		},
		{
			title: "Template - Live Twitch",
			eventType: "LIVE_TWITCH",
			startAt: "2025-12-01T15:00:00.000Z",
			endAt: "2025-12-01T16:00:00.000Z",
		},
		{
			title: "Template - Live multi-plateforme",
			eventType: "LIVE_MULTI",
			startAt: "2025-12-01T16:00:00.000Z",
			endAt: "2025-12-01T17:00:00.000Z",
		},
	];

	for (const event of events) {
		await prisma.feedEvent.upsert({
			where: {
				pimId_title: {
					pimId: pim.id,
					title: event.title,
				},
			},
			update: event,
			create: { ...event, pimId: pim.id },
		});
	}
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (error) => {
		console.error(error);
		await prisma.$disconnect();
		process.exit(1);
	});
