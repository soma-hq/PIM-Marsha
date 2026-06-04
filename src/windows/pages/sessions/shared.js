export const PIM_TYPES = [
	{
		value: "PIMD",
		label: "Discord",
		description: "Session axée sur Discord",
	},
	{
		value: "PIMY",
		label: "YouTube",
		description: "Session axée sur YouTube",
	},
	{ value: "PIMT", label: "Twitch", description: "Session axée sur Twitch" },
	{
		value: "PIMP",
		label: "Polyvalent",
		description: "Session multi-plateforme",
	},
];

export const STATUS_OPTIONS = [
	{ value: "non_debutee", label: "Non débutée" },
	{ value: "stand_by", label: "Stand-by" },
	{ value: "en_cours", label: "En cours" },
	{ value: "annulee", label: "Annulée" },
	{ value: "achevee", label: "Achevée" },
];

export const PIM_TABS = [
	{ key: "hub", label: "Hub Session" },
	{ key: "fsi", label: "FSI Junior" },
	{ key: "remarques", label: "Remarques" },
	{ key: "calendrier", label: "Calendrier" },
];

export const HUB_SECTIONS = [
	{ key: "notes", label: "Notes générales" },
	{ key: "formations", label: "Formations" },
	{ key: "prelude", label: "Prélude" },
];

export const FSI_PERIODS = ["1ere_periode", "2eme_periode", "periode_bonus"];

export const FSI_PERIOD_LABELS = {
	"1ere_periode": "1ère période",
	"2eme_periode": "2ème période",
	periode_bonus: "Période bonus",
};

export const FSI_PERIOD_COLORS = {
	"1ere_periode": "bg-teal-900/50 text-teal-300",
	"2eme_periode": "bg-sky-900/50 text-sky-300",
	periode_bonus: "bg-purple-900/50 text-purple-300",
};

export const COMPETENCE_TYPES = [
	"Communication",
	"Animation",
	"Technique",
	"Organisation",
	"Leadership",
];

export const COMPETENCE_TYPE_COLORS = {
	Communication: "bg-blue-900/40 text-blue-300",
	Animation: "bg-orange-900/40 text-orange-300",
	Technique: "bg-emerald-900/40 text-emerald-300",
	Organisation: "bg-yellow-900/40 text-yellow-300",
	Leadership: "bg-pink-900/40 text-pink-300",
};

export const REFERENT_REVIEWS = ["excellent", "bon", "moyen", "a_renforcer"];

export const OBJECTIVE_STATUS = ["a_faire", "en_cours", "termine"];

export const OBJECTIVE_STATUS_LABELS = {
	a_faire: "À faire",
	en_cours: "En cours",
	termine: "Terminé",
};

export const CALENDAR_EVENT_TYPE_FILTERS = [
	"all",
	"live_multi",
	"vocal",
	"vocal_bilan",
	"entrevue_rj",
	"entrevue_rrj",
	"live_youtube",
	"live_twitch",
	"formation",
	"atelier",
	"autre",
];

export const ROLE_CAN_EDIT_FSI = ["responsable", "super_admin", "referent"];

export const PERIODICITY_OPTIONS = [
	{ value: "", label: "Non définie" },
	{ value: "1ere_periode", label: "1ère période" },
	{ value: "2eme_periode", label: "2ème période" },
	{ value: "periode_bonus", label: "Période bonus" },
];

export const EVENT_TEMPLATE_OPTIONS = [
	{ title: "Vocal bilan", eventType: "vocal_bilan" },
	{ title: "Vocal RRJ", eventType: "entrevue_rrj" },
	{ title: "Formation", eventType: "formation" },
	{ title: "Animation", eventType: "atelier" },
	{ title: "Live Twitch", eventType: "live_twitch" },
	{ title: "Live YouTube", eventType: "live_youtube" },
	{ title: "Libre Antenne", eventType: "vocal" },
];

export const CUSTOMER_LOGO_BY_KEY = {
	"michou.png": "/logos/customers/michou-logo.png",
	"doigby.png": "/logos/customers/doig-logo.png",
	"inoxtag.png": "/logos/customers/inoxtag-logo.png",
};

export const SOURCE_COLORS = {
	planned: "border-rose-400/40 bg-rose-500/10 text-rose-200",
	responsable: "border-orange-400/40 bg-orange-500/10 text-orange-200",
	referent: "border-sky-400/40 bg-sky-500/10 text-sky-200",
};

export function parseSearchParams() {
	if (typeof window === "undefined") return { pim: null, tab: "hub" };
	const params = new URLSearchParams(window.location.search);
	return {
		pim: params.get("pim"),
		tab: PIM_TABS.some((t) => t.key === params.get("pimTab"))
			? params.get("pimTab")
			: "hub",
	};
}

export function syncPimUrl(pimId, tabKey) {
	if (typeof window === "undefined") return;
	const url = new URL(window.location.href);
	if (pimId) {
		url.searchParams.set("pim", pimId);
		url.searchParams.set("pimTab", tabKey || "hub");
	} else {
		url.searchParams.delete("pim");
		url.searchParams.delete("pimTab");
	}
	window.history.replaceState({}, "", `${url.pathname}${url.search}`);
}

export function formatDateOrFallback(value) {
	if (!value) return "Non définie";
	return new Date(value).toLocaleDateString("fr-FR");
}

export function dayKey(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toISOString().slice(0, 10);
}

export function startOfWeek(date) {
	const d = new Date(date);
	const shift = (d.getDay() + 6) % 7;
	d.setDate(d.getDate() - shift);
	d.setHours(0, 0, 0, 0);
	return d;
}

export function weekDays(base) {
	const start = startOfWeek(base);
	return Array.from({ length: 7 }, (_, idx) => {
		const day = new Date(start);
		day.setDate(start.getDate() + idx);
		return day;
	});
}

export function fsiEmptyState() {
	return {
		note: "",
		competences: [],
		objectifs: [],
		bilans: {
			"1ere_periode": {
				ressentis: [],
				finalText: "",
				validation: {
					presence: false,
					engagement: false,
					communication: false,
					autonomie: false,
				},
			},
			"2eme_periode": {
				ressentis: [],
				finalText: "",
				validation: {
					presence: false,
					engagement: false,
					communication: false,
					autonomie: false,
				},
			},
			periode_bonus: {
				ressentis: [],
				finalText: "",
				validation: {
					presence: false,
					engagement: false,
					communication: false,
					autonomie: false,
				},
			},
		},
	};
}

export function parseFsiNotes(notes) {
	const stateByJunior = {};
	const noteIdByJunior = {};
	for (const note of notes || []) {
		if (!String(note.title || "").startsWith("[FSI_JSON]")) continue;
		const juniorId = note.juniors?.[0]?.id;
		if (!juniorId || stateByJunior[juniorId]) continue;
		try {
			const parsed = JSON.parse(note.content || "{}");
			stateByJunior[juniorId] = {
				...fsiEmptyState(),
				...parsed,
				bilans: { ...fsiEmptyState().bilans, ...(parsed.bilans || {}) },
			};
			noteIdByJunior[juniorId] = note.id;
		} catch {
			stateByJunior[juniorId] = fsiEmptyState();
		}
	}
	return { stateByJunior, noteIdByJunior };
}

export function inferTimelineSource(event) {
	if (event.timelineSource) return event.timelineSource;
	if (
		String(event.title || "")
			.toLowerCase()
			.includes("template")
	)
		return "planned";
	const role = String(event.responsable?.role || "").toLowerCase();
	if (role === "responsable" || role === "super_admin") return "responsable";
	return "referent";
}

export function sourceLabel(source) {
	if (source === "planned") return "Prévu";
	if (source === "responsable") return "Ajout Responsable";
	return "Ajout Référent";
}

export function periodicityLabel(value) {
	return (
		PERIODICITY_OPTIONS.find((item) => item.value === value)?.label ||
		"Non définie"
	);
}

export function getActivityState(status) {
	if (status === "stand_by") return "stand_by";
	if (status === "en_cours") return "actif";
	return "inactif";
}

export function buildMonthMatrix(cursorDate) {
	const year = cursorDate.getFullYear();
	const month = cursorDate.getMonth();
	const firstDay = new Date(year, month, 1);
	const offset = (firstDay.getDay() + 6) % 7;
	const totalDays = new Date(year, month + 1, 0).getDate();
	const cells = [];
	for (let i = 0; i < offset; i += 1) cells.push(null);
	for (let day = 1; day <= totalDays; day += 1)
		cells.push(new Date(year, month, day));
	while (cells.length % 7 !== 0) cells.push(null);
	return cells;
}
