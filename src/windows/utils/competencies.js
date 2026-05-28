export const COMPETENCIES = [
	{
		id: "outils",
		emoji: "⚙️",
		title: "Maîtrise des outils",
		subtitle: "Twitch / YouTube / Discord",
		description:
			"Connaissance et utilisation efficace des plateformes et outils de modération.",
		criteria: [
			"Utilise correctement les outils de modération Twitch/YouTube/Discord",
			"Connaît les raccourcis et fonctionnalités avancées",
			"S'adapte rapidement aux mises à jour des plateformes",
		],
	},
	{
		id: "reactivite",
		emoji: "🚀",
		title: "Réactivité",
		subtitle: "Rapidité d'action",
		description:
			"Capacité à agir vite et de façon appropriée face aux situations urgentes.",
		criteria: [
			"Intervient dans les délais attendus face aux infractions",
			"Priorise les situations critiques",
			"Reste disponible et attentif pendant son service",
		],
	},
	{
		id: "redaction",
		emoji: "✍️",
		title: "Capacité rédactionnelle",
		subtitle: "Écriture et communication écrite",
		description:
			"Qualité des écrits produits : rapports, avertissements, communications internes.",
		criteria: [
			"Rédige des rapports clairs et complets",
			"Formule des avertissements polis et précis",
			"Écrit sans fautes et de façon professionnelle",
		],
	},
	{
		id: "vitesse_moderation",
		emoji: "⚔️",
		title: "Vitesse de Modération",
		subtitle: "Rapidité d'exécution",
		description:
			"Temps de réaction et d'exécution lors des actions de modération en direct.",
		criteria: [
			"Modère rapidement sans nuire à la qualité",
			"Gère plusieurs incidents simultanément",
			"Maintient un rythme soutenu pendant les lives",
		],
	},
	{
		id: "travail_equipe",
		emoji: "🧑‍🧑‍🧒‍🧒",
		title: "Travail en équipe",
		subtitle: "Collaboration",
		description:
			"Aptitude à travailler efficacement avec les autres membres de l'équipe.",
		criteria: [
			"Communique avec ses collègues en temps réel",
			"Soutient les autres membres en difficulté",
			"Respecte les décisions collectives",
		],
	},
	{
		id: "communication",
		emoji: "🗣️",
		title: "Communication",
		subtitle: "Expression orale et écrite",
		description:
			"Clarté et efficacité dans les échanges avec l'équipe et la hiérarchie.",
		criteria: [
			"S'exprime clairement à l'oral comme à l'écrit",
			"Remonte les informations importantes en temps utile",
			"Adapte son registre au contexte",
		],
	},
	{
		id: "neutralite",
		emoji: "⚖️",
		title: "Neutralité",
		subtitle: "Impartialité",
		description:
			"Capacité à agir sans favoritisme ni biais, en toute équité.",
		criteria: [
			"Applique les règles de façon égale pour tous",
			"Ne laisse pas ses préférences personnelles influencer ses décisions",
			"Documente ses actions pour garantir la traçabilité",
		],
	},
	{
		id: "gestion_conflits",
		emoji: "🧯",
		title: "Gestion des conflits",
		subtitle: "Désamorçage",
		description:
			"Compétence à désamorcer les tensions et résoudre les conflits de façon constructive.",
		criteria: [
			"Identifie et désamorce les tensions avant escalade",
			"Utilise la communication non violente",
			"Sait quand escalader vers un supérieur",
		],
	},
	{
		id: "veille",
		emoji: "⏬",
		title: "Veille & anticipation",
		subtitle: "Proactivité",
		description:
			"Capacité à surveiller l'environnement et anticiper les problèmes avant qu'ils ne surviennent.",
		criteria: [
			"Surveille activement le chat entre les incidents",
			"Anticipe les comportements à risque",
			"Propose des améliorations aux procédures existantes",
		],
	},

	// ── ATRIA uniquement ──────────────────────────────────────────────────────
	{
		id: "respect_hierarchique",
		emoji: "🧑‍🧒",
		title: "Respect hiérarchique",
		subtitle: "Posture et limites",
		atriaOnly: true,
		description:
			"Le respect de la hiérarchie garantit une modération cohérente et harmonieuse. Chacun a un rôle précis, et il est important de connaître ses limites.",
		criteria: [
			"Garde les formes de politesse dans tous les échanges",
			"Écoute avant de répondre, sans interrompre",
			"Accepte les retours et corrections comme opportunité d'apprendre",
			"Ne prend pas d'initiatives dépassant ses responsabilités",
		],
	},
	{
		id: "assiduite",
		emoji: "⏰",
		title: "Assiduité et présences",
		subtitle: "Engagement et disponibilité",
		atriaOnly: true,
		description:
			"La réactivité aux annonces, le suivi des consignes et la présence pendant les lives sont essentiels pour une modération efficace.",
		criteria: [
			"Lit et réagit aux annonces en temps utile",
			"Annote le salon absence si nécessaire",
			"Signale rapidement toute absence ou indisponibilité",
			"Est présent et attentif pendant les lives",
		],
	},
	{
		id: "suivi_consignes",
		emoji: "👌",
		title: "Suivi des consignes",
		subtitle: "Discipline opérationnelle",
		atriaOnly: true,
		description:
			"Comprendre et appliquer correctement les directives données par les référents ou modérateurs expérimentés, sans improviser.",
		criteria: [
			"Applique les directives des référents et modérateurs expérimentés",
			"Ne prend pas d'initiatives non clairement autorisées",
			"Pose des questions si certaines instructions ne sont pas claires",
			"Respecte l'ordre hiérarchique dans toutes les actions",
		],
	},
	{
		id: "connaissance_regles",
		emoji: "📜",
		title: "Connaissance des règles",
		subtitle: "Maîtrise du cadre",
		atriaOnly: true,
		description:
			"La connaissance des règles est fondamentale pour assurer une modération juste et efficace.",
		criteria: [
			"Connaît, comprend et suit les règles mises en place",
			"Se réfère aux règles avant de prendre toute décision",
			"Applique les sanctions conformément aux directives établies",
			"Met à jour ses connaissances lorsque les règles évoluent",
		],
	},
	{
		id: "attitude_situations",
		emoji: "‼️",
		title: "Attitude face aux situations problématiques",
		subtitle: "Gestion de l'imprévu",
		atriaOnly: true,
		description:
			"Adopter la bonne attitude face aux situations problématiques démontre le professionnalisme et la maturité du Junior.",
		criteria: [
			"Reste calme et neutre, même dans des situations tendues",
			"Connaît et respecte ses propres limites",
			"Ne réagit pas de manière impulsive ou émotionnelle",
			"Suit les procédures établies pour la résolution de conflits ou les sanctions",
		],
	},
];
