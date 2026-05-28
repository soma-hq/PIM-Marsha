import React, { useEffect, useMemo, useState } from "react";

import {
	createPim,
	fetchJuniors,
	createJunior,
	updateJunior,
	createFeedEvent,
	fetchNotes,
	createNote,
	seedPimDefaults,
} from "../utils/api/client.jsx";
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from "../utils/icons.jsx";
import { FancyDateField, FancySelect } from "../components/ui/Controls.jsx";
import { COMPETENCIES } from "../utils/competencies.js";

const PIM_TYPES = [
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

const STATUS_OPTIONS = [
	{ value: "non_debutee", label: "Non débutée" },
	{ value: "stand_by", label: "Stand-by" },
	{ value: "en_cours", label: "En cours" },
	{ value: "annulee", label: "Annulée" },
	{ value: "achevee", label: "Achevée" },
];

const PIM_TABS = [
	{ key: "juniors", label: "Juniors" },
	{ key: "timeline", label: "Timeline" },
];

const FSI_SUBTABS = [
	{ key: "bilans", label: "Bilans" },
	{ key: "competences", label: "Compétences" },
	{ key: "notes", label: "Notes" },
];

const TIMELINE_VIEWS = [
	{ key: "gantt", label: "Gantt" },
	{ key: "fresque", label: "Fresque" },
	{ key: "calendar", label: "Calendrier" },
];

const COMMENT_TYPES = ["Réprimande", "Félicitations", "Note", "Alerte", "Info"];

const CUSTOMER_LOGO_BY_KEY = {
	"michou.png": "/logos/customers/michou-logo.png",
	"doigby.png": "/logos/customers/doig-logo.png",
	"inoxtag.png": "/logos/customers/inoxtag-logo.png",
};

const SOURCE_COLORS = {
	planned: "border-rose-400/40 bg-rose-500/10 text-rose-200",
	responsable: "border-orange-400/40 bg-orange-500/10 text-orange-200",
	referent: "border-sky-400/40 bg-sky-500/10 text-sky-200",
};

const EVENT_TEMPLATE_OPTIONS = [
	{ title: "Live de prévu", eventType: "live_multi" },
	{ title: "Bilan RRJ", eventType: "entrevue_rrj" },
	{ title: "Bilan RJ", eventType: "entrevue_rj" },
	{ title: "Animation", eventType: "atelier" },
];

/**
 * Parses PIM URL Params
 * @returns {{ pim: string|null, tab: string }} Parsed Params
 */

function parseSearchParams() {
	// url restore
	if (typeof window === "undefined") return { pim: null, tab: "juniors" };
	const params = new URLSearchParams(window.location.search);
	return {
		pim: params.get("pim"),
		tab: PIM_TABS.some((tab) => tab.key === params.get("pimTab"))
			? params.get("pimTab")
			: "juniors",
	};
}

/**
 * Syncs PIM URL State
 * @param {string|null} pimId Selected PIM Id
 * @param {string} tabKey Selected Tab Key
 * @returns {void} Nothing
 */

function syncPimUrl(pimId, tabKey) {
	// url sync
	if (typeof window === "undefined") return;
	const url = new URL(window.location.href);
	if (pimId) {
		url.searchParams.set("pim", pimId);
		url.searchParams.set("pimTab", tabKey || "juniors");
	} else {
		url.searchParams.delete("pim");
		url.searchParams.delete("pimTab");
	}
	window.history.replaceState({}, "", `${url.pathname}${url.search}`);
}

/**
 * Resolves Timeline Source
 * @param {any} event Feed Event
 * @returns {"planned"|"responsable"|"referent"} Timeline Source
 */

function inferTimelineSource(event) {
	// Fallback source
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

/**
 * Maps Source To Label
 * @param {"planned"|"responsable"|"referent"} source Source Key
 * @returns {string} Display Label
 */

function sourceLabel(source) {
	// source label
	if (source === "planned") return "Prévu";
	if (source === "responsable") return "Ajout Responsable";
	return "Ajout Référent";
}

/**
 * Formats Date With Fallback
 * @param {string|null|undefined} value Date Value
 * @returns {string} Formatted Date
 */

function formatDateOrFallback(value) {
	if (!value) return "Non définie";
	return new Date(value).toLocaleDateString("fr-FR");
}

/**
 * Renders Create PIM Modal
 * @param {{ organizations: any[], onCreated: (pim: any) => void, onClose: () => void }} props Modal Props
 * @returns {JSX.Element} Modal View
 */

function CreatePimModal({ organizations, initialOrgId, onCreated, onClose }) {
	const [step, setStep] = useState(1);
	const [type, setType] = useState("");
	const [form, setForm] = useState({
		title: "",
		code: "",
		startDate: "",
		endDate: "",
		organizationId: initialOrgId || "",
	});
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	/**
	 * Submits PIM Creation
	 * @returns {Promise<void>} Async Done
	 */

	async function submit() {
		setSaving(true);
		setError("");
		try {
			const response = await createPim({
				...form,
				type,
				organizationId: form.organizationId || null,
				startDate: form.startDate || null,
				endDate: form.endDate || null,
			});
			onCreated(response.pim);
		} catch (err) {
			setError(err.message || "Impossible de créer la session.");
		} finally {
			setSaving(false);
		}
	}

	const orgLogoUrl = form.organizationId
		? CUSTOMER_LOGO_BY_KEY[
				(organizations.find((o) => o.id === form.organizationId) || {})
					.logoKey
			]
		: null;

	return (
		<div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
			<div className="modal-panel w-full max-w-2xl overflow-hidden rounded-md border border-white/10 bg-[#090909] shadow-2xl">
				<div className="border-b border-white/10 px-5 py-4">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							{orgLogoUrl ? (
								<img
									src={orgLogoUrl}
									alt=""
									className="h-8 w-auto object-contain"
								/>
							) : null}
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-white/35">
									Nouvelle session
								</p>
								<h3 className="mt-1 text-2xl font-semibold">
									Créer un PIM
								</h3>
							</div>
						</div>
						<button
							type="button"
							onClick={onClose}
							className="text-white/45 hover:text-white">
							<XMarkIcon className="h-5 w-5" />
						</button>
					</div>
				</div>

				<div className="p-5">
					{step === 1 ? (
						<div className="space-y-4">
							<p className="text-sm text-white/60">
								Choisis le type de session.
							</p>
							<div className="grid gap-3 sm:grid-cols-2">
								{PIM_TYPES.map((item) => (
									<button
										key={item.value}
										type="button"
										onClick={() => {
											setType(item.value);
											setStep(2);
										}}
										className="rounded-md border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-white/25 hover:bg-white/[0.06]">
										<div className="text-lg font-semibold">
											{item.label}
										</div>
										<div className="mt-1 text-xs text-white/50">
											{item.description}
										</div>
									</button>
								))}
							</div>
						</div>
					) : (
						<div className="space-y-4">
							<div className="flex items-center gap-3 text-sm text-white/60">
								<span>Type choisi :</span>
								<strong className="text-white">{type}</strong>
								<button
									type="button"
									onClick={() => setStep(1)}
									className="ml-auto text-xs underline opacity-70 hover:opacity-100">
									Changer
								</button>
							</div>
							<label className="block space-y-1 text-sm">
								<span className="text-white/70">Titre</span>
								<input
									value={form.title}
									onChange={(event) =>
										setForm((prev) => ({
											...prev,
											title: event.target.value,
										}))
									}
									className="h-12 w-full rounded-md border border-white/10 bg-black/45 px-4 text-white outline-none focus:border-white/30"
									placeholder="PIM Inoxtag S1"
								/>
							</label>
							<label className="block space-y-1 text-sm">
								<span className="text-white/70">
									Code unique
								</span>
								<input
									value={form.code}
									onChange={(event) =>
										setForm((prev) => ({
											...prev,
											code: event.target.value,
										}))
									}
									className="h-12 w-full rounded-md border border-white/10 bg-black/45 px-4 text-white outline-none focus:border-white/30"
									placeholder="PIMD-2026-01"
								/>
							</label>
							<FancyDateField
								label="Date de début"
								value={form.startDate}
								onChange={(value) =>
									setForm((prev) => ({
										...prev,
										startDate: value,
									}))
								}
							/>
							<FancyDateField
								label="Date de fin"
								value={form.endDate}
								onChange={(value) =>
									setForm((prev) => ({
										...prev,
										endDate: value,
									}))
								}
							/>
							<FancySelect
								label="Organisation"
								value={form.organizationId}
								placeholder="Aucune"
								options={[
									{ value: "", label: "Aucune" },
									...(organizations || []).map((org) => ({
										value: org.id,
										label: org.name,
										logoUrl: CUSTOMER_LOGO_BY_KEY[org.logoKey] || null,
									})),
								]}
								onChange={(value) =>
									setForm((prev) => ({
										...prev,
										organizationId: value,
									}))
								}
							/>
							{error ? (
								<p className="text-sm text-rose-300">{error}</p>
							) : null}
							<div className="flex gap-3 pt-2">
								<button
									type="button"
									onClick={() => setStep(1)}
									className="rounded-md border border-white/10 px-4 py-3 text-sm text-white/70 hover:bg-white/5">
									Retour
								</button>
								<button
									type="button"
									disabled={
										saving ||
										!form.title ||
										!form.code ||
										!type
									}
									onClick={submit}
									className="ml-auto rounded-md bg-white px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">
									{saving ? "Création..." : "Créer"}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

/**
 * Renders Add Junior Modal
 * @param {{ pimId: string, referents: any[], onCreated: (junior: any) => void, onClose: () => void }} props Modal Props
 * @returns {JSX.Element} Modal View
 */

function AddJuniorModal({ pimId, referents, orgLogoUrl, onCreated, onClose }) {
	const [form, setForm] = useState({
		displayName: "",
		discordId: "",
		dispositif: "ATRIA",
		referentId: referents[0]?.id || "",
	});
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	/**
	 * Submits Junior Creation
	 * @returns {Promise<void>} Async Done
	 */

	async function submit() {
		setSaving(true);
		setError("");
		try {
			const response = await createJunior({
				pimId,
				displayName: form.displayName,
				discordId: form.discordId || null,
				dispositif: form.dispositif,
				referentId: form.referentId || null,
			});
			onCreated(response.junior);
		} catch (err) {
			setError(err.message || "Impossible de créer le junior.");
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
			<div className="modal-panel w-full max-w-xl rounded-md border border-white/10 bg-[#090909] p-5 shadow-2xl">
				<div className="mb-4 flex items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						{orgLogoUrl ? (
							<img
								src={orgLogoUrl}
								alt=""
								className="h-8 w-auto object-contain"
							/>
						) : null}
						<h3 className="text-xl font-semibold">Ajouter un junior</h3>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="text-white/45 hover:text-white">
						<XMarkIcon className="h-5 w-5" />
					</button>
				</div>

				<div className="grid gap-4">
					<label className="block space-y-1 text-sm">
						<span className="text-white/70">Nom affiché</span>
						<input
							value={form.displayName}
							onChange={(event) =>
								setForm((prev) => ({
									...prev,
									displayName: event.target.value,
								}))
							}
							className="h-12 w-full rounded-md border border-white/10 bg-black/45 px-4 text-white outline-none focus:border-white/30"
						/>
					</label>
					<label className="block space-y-1 text-sm">
						<span className="text-white/70">Discord</span>
						<input
							value={form.discordId}
							onChange={(event) =>
								setForm((prev) => ({
									...prev,
									discordId: event.target.value,
								}))
							}
							className="h-12 w-full rounded-md border border-white/10 bg-black/45 px-4 text-white outline-none focus:border-white/30"
						/>
					</label>
					<FancySelect
						label="Dispositif"
						value={form.dispositif}
						options={[
							{ value: "ATRIA", label: "ATRIA" },
							{ value: "PULSE", label: "PULSE" },
						]}
						onChange={(value) =>
							setForm((prev) => ({ ...prev, dispositif: value }))
						}
					/>
					<FancySelect
						label="Référent"
						value={form.referentId}
						options={[
							{ value: "", label: "Aucun" },
							...referents.map((referent) => ({
								value: referent.id,
								label: referent.name || referent.email,
								description: referent.email,
							})),
						]}
						onChange={(value) =>
							setForm((prev) => ({ ...prev, referentId: value }))
						}
					/>
					{error ? (
						<p className="text-sm text-rose-300">{error}</p>
					) : null}
					<div className="flex justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							className="rounded-md border border-white/10 px-4 py-3 text-sm text-white/70 hover:bg-white/5">
							Annuler
						</button>
						<button
							type="button"
							disabled={saving || !form.displayName}
							onClick={submit}
							className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">
							{saving ? "Création..." : "Créer"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Renders Junior Note Modal
 * @param {{ pimId: string, junior: any, orgLogoUrl?: string|null, onCreated: (note: any) => void, onClose: () => void }} props Modal Props
 * @returns {JSX.Element} Modal View
 */

function JuniorNoteModal({ pimId, junior, orgLogoUrl, onCreated, onClose }) {
	const [category, setCategory] = useState("Note");
	const [content, setContent] = useState("");
	const [status, setStatus] = useState("");
	const [saving, setSaving] = useState(false);

	/**
	 * Submits Junior Note
	 * @returns {Promise<void>} Async Done
	 */

	async function submit() {
		if (!content.trim()) {
			setStatus("Le commentaire est requis.");
			return;
		}
		setSaving(true);
		setStatus("Enregistrement...");
		try {
			const response = await createNote({
				pimId,
				title: category,
				content,
				scope: "junior",
				juniorIds: [junior.id],
			});
			onCreated(response.note);
			onClose();
		} catch (error) {
			setStatus(error.message || "Impossible d'ajouter la note.");
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4">
			<div className="modal-panel w-full max-w-lg rounded-md border border-white/10 bg-[#090909] p-5">
				<div className="mb-3 flex items-start justify-between gap-3">
					<div className="flex items-center gap-3">
						{orgLogoUrl ? (
							<img
								src={orgLogoUrl}
								alt=""
								className="h-8 w-auto object-contain"
							/>
						) : null}
						<div>
							<h3 className="text-lg font-semibold">
								Ajouter un commentaire
							</h3>
							<p className="mt-1 text-sm text-white/55">
								{junior.displayName}
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="text-white/45 hover:text-white">
						<XMarkIcon className="h-5 w-5" />
					</button>
				</div>
				<div className="mt-4 space-y-3">
					<FancySelect
						label="Type"
						value={category}
						options={COMMENT_TYPES.map((item) => ({
							value: item,
							label: item,
						}))}
						onChange={setCategory}
					/>
					<label className="block space-y-2 text-sm">
						<span className="text-white/70">Commentaire</span>
						<textarea
							value={content}
							onChange={(event) => setContent(event.target.value)}
							rows={5}
							className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-white outline-none focus:border-white/30"
						/>
					</label>
					<p className="text-xs text-white/60">{status}</p>
					<div className="flex justify-end gap-2">
						<button
							type="button"
							onClick={onClose}
							className="rounded-md border border-white/10 px-4 py-2 text-sm text-white/70">
							Annuler
						</button>
						<button
							type="button"
							disabled={saving}
							onClick={submit}
							className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
							Ajouter
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Renders Junior FSI Panel
 * @param {{ junior: any, pimId: string, events: any[], notes: any[], orgLogoUrl?: string|null, onNoteCreated: (note: any) => void }} props Panel Props
 * @returns {JSX.Element} Panel View
 */

function JuniorFSI({
	junior,
	pimId,
	events,
	notes,
	orgLogoUrl,
	onNoteCreated,
}) {
	const [tab, setTab] = useState("bilans");
	const [showNoteModal, setShowNoteModal] = useState(false);

	const juniorEvents = useMemo(
		() =>
			(events || []).filter((event) =>
				(event.juniors || []).some((j) => j.id === junior.id),
			),
		[events, junior.id],
	);
	const juniorNotes = useMemo(
		() =>
			(notes || []).filter((note) =>
				(note.juniors || []).some((j) => j.id === junior.id),
			),
		[notes, junior.id],
	);
	const liveCount = juniorEvents.filter((event) =>
		String(event.eventType || "").startsWith("live"),
	).length;
	const trainingsCount = juniorEvents.filter(
		(event) => String(event.eventType || "") === "formation",
	).length;
	const atriaCompetencies = COMPETENCIES.filter(
		(item) => !item.atriaOnly || junior.dispositif === "ATRIA",
	);

	return (
		<div className="rounded-md border border-white/10 bg-[#090909] p-5">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<p className="text-xs uppercase tracking-[0.2em] text-white/35">
						Fiche de Suivi Individualisée
					</p>
					<h4 className="mt-1 text-2xl font-semibold text-white">
						{junior.displayName}
					</h4>
					<p className="mt-1 text-sm text-white/55">
						Discord: {junior.discordId || "—"} • Dispositif:{" "}
						{junior.dispositif}
					</p>
				</div>
				<span className="rounded-md border border-white/20 px-2 py-1 text-xs text-white/70">
					{STATUS_OPTIONS.find((item) => item.value === junior.status)
						?.label || junior.status}
				</span>
			</div>

			<div className="mt-4 grid gap-3 sm:grid-cols-2">
				<div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
					<p className="text-xs uppercase tracking-[0.15em] text-white/35">
						Lives participés
					</p>
					<p className="mt-1 text-2xl font-semibold">{liveCount}</p>
				</div>
				<div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
					<p className="text-xs uppercase tracking-[0.15em] text-white/35">
						Formations effectuées
					</p>
					<p className="mt-1 text-2xl font-semibold">
						{trainingsCount}
					</p>
				</div>
			</div>

			<div className="mt-5 flex flex-wrap gap-2">
				{FSI_SUBTABS.map((item) => (
					<button
						key={item.key}
						type="button"
						onClick={() => setTab(item.key)}
						className={`rounded-md border px-3 py-1.5 text-xs ${tab === item.key ? "border-white/20 bg-white text-black" : "border-white/15 text-white/75 hover:bg-white/5"}`}>
						{item.label}
					</button>
				))}
			</div>

			{tab === "bilans" ? (
				<div className="mt-4 grid gap-3 md:grid-cols-2">
					<div className="rounded-md border border-white/10 bg-black/35 p-3">
						<p className="text-sm font-semibold text-white">
							Période 1
						</p>
						<p className="mt-1 text-sm text-white/55">
							Bilan à compléter.
						</p>
					</div>
					<div className="rounded-md border border-white/10 bg-black/35 p-3">
						<p className="text-sm font-semibold text-white">
							Période 2
						</p>
						<p className="mt-1 text-sm text-white/55">
							Bilan à compléter.
						</p>
					</div>
				</div>
			) : null}

			{tab === "competences" ? (
				<div className="mt-4 space-y-3">
					<p className="text-sm text-white/60">
						Compétences{" "}
						{junior.dispositif === "ATRIA"
							? "ATRIA"
							: "PULSE (préparation en cours)"}
					</p>
					{atriaCompetencies.map((item) => (
						<div
							key={item.id}
							className="rounded-md border border-white/10 bg-black/35 p-3">
							<p className="text-sm font-semibold text-white">
								{item.title}
							</p>
							<p className="text-xs text-white/50">
								{item.subtitle}
							</p>
						</div>
					))}
				</div>
			) : null}

			{tab === "notes" ? (
				<div className="mt-4 space-y-3">
					{juniorNotes.map((note) => (
						<div key={note.id}>
							<div className="rounded-md border border-white/10 bg-black/35 px-3 py-2 text-sm">
								<p className="font-semibold text-white">
									{note.title}
								</p>
								<p className="mt-1 text-white/70">
									{note.content}
								</p>
								<p className="mt-1 text-xs text-white/45">
									{new Date(note.createdAt).toLocaleString(
										"fr-FR",
									)}
								</p>
							</div>
							<div className="mx-auto mt-2 h-px w-44 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
						</div>
					))}
					{juniorNotes.length === 0 ? (
						<p className="text-sm text-white/55">
							Aucune note pour ce junior.
						</p>
					) : null}
					<button
						type="button"
						onClick={() => setShowNoteModal(true)}
						className="rounded-md border border-white/20 px-3 py-2 text-xs text-white/80 hover:bg-white/5">
						Ajouter un commentaire
					</button>
				</div>
			) : null}

			<div className="mt-5 rounded-md border border-sky-400/20 bg-sky-500/5 p-3">
				<p className="text-xs uppercase tracking-[0.15em] text-sky-200/80">
					Événements liés au junior
				</p>
				<div className="mt-2 space-y-2">
					{juniorEvents.slice(0, 6).map((event) => (
						<div
							key={event.id}
							className="rounded-md border border-white/10 bg-black/35 px-3 py-2">
							<p className="text-sm font-medium text-white">
								{event.title}
							</p>
							<p className="text-xs text-white/45">
								{new Date(event.startAt).toLocaleString(
									"fr-FR",
								)}
							</p>
						</div>
					))}
					{juniorEvents.length === 0 ? (
						<p className="text-sm text-white/55">
							Aucun événement lié.
						</p>
					) : null}
				</div>
			</div>

			{showNoteModal ? (
				<JuniorNoteModal
					pimId={pimId}
					junior={junior}
					orgLogoUrl={orgLogoUrl}
					onCreated={onNoteCreated}
					onClose={() => setShowNoteModal(false)}
				/>
			) : null}
		</div>
	);
}

/**
 * Renders Juniors Pane
 * @param {{ pimId: string, referents: any[], events: any[], orgLogoUrl?: string|null }} props Pane Props
 * @returns {JSX.Element} Pane View
 */

function JuniorsPane({ pimId, referents, events, orgLogoUrl }) {
	const [juniors, setJuniors] = useState([]);
	const [notes, setNotes] = useState([]);
	const [selectedJuniorId, setSelectedJuniorId] = useState(null);
	const [loading, setLoading] = useState(true);
	const [showAdd, setShowAdd] = useState(false);

	useEffect(() => {
		if (!pimId) return;
		setLoading(true);
		Promise.all([fetchJuniors(pimId), fetchNotes(pimId)])
			.then(([juniorsRes, notesRes]) => {
				setJuniors(juniorsRes.juniors || []);
				setNotes(notesRes.notes || []);
			})
			.catch(() => {
				setJuniors([]);
				setNotes([]);
			})
			.finally(() => setLoading(false));
	}, [pimId]);

	const selectedJunior =
		juniors.find((junior) => junior.id === selectedJuniorId) || null;

	/**
	 * Updates Junior Status
	 * @param {any} junior Target Junior
	 * @param {string} status Next Status
	 * @returns {Promise<void>} Async Done
	 */

	async function updateStatus(junior, status) {
		try {
			await updateJunior(junior.id, { status });
			setJuniors((previous) =>
				previous.map((item) =>
					item.id === junior.id ? { ...item, status } : item,
				),
			);
		} catch {
			// Keep interface usable if API fails.
		}
	}

	return (
		<div className="space-y-4">
			<div className="rounded-md border border-white/10 bg-white/[0.03] p-5">
				<div className="mb-4 flex items-center justify-between gap-3">
					<h3 className="text-lg font-semibold">Liste des juniors</h3>
					<button
						type="button"
						onClick={() => setShowAdd(true)}
						className="rounded-md border border-white/15 bg-white px-4 py-2 text-xs font-semibold text-black">
						+ Ajouter
					</button>
				</div>

				{loading ? (
					<div className="flex items-center gap-2 py-4 text-sm text-white/50">
						<img
							src="/logos/loader.gif"
							alt=""
							className="h-4 w-4 rounded-full"
						/>
						Chargement...
					</div>
				) : juniors.length === 0 ? (
					<p className="py-4 text-sm text-white/50">
						Aucun junior dans cette session.
					</p>
				) : (
					<div className="overflow-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/40">
									<th className="pb-2 pr-3">Nom</th>
									<th className="pb-2 pr-3">Discord</th>
									<th className="pb-2 pr-3">Dispositif</th>
									<th className="pb-2 pr-3">Référent</th>
									<th className="pb-2 pr-3">Statut</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-white/5">
								{juniors.map((junior) => (
									<tr key={junior.id}>
										<td className="py-3 pr-3 font-medium text-white">
											<button
												type="button"
												onClick={() =>
													setSelectedJuniorId(
														junior.id,
													)
												}
												className="text-left underline decoration-white/20 underline-offset-4 hover:text-cyan-200">
												{junior.displayName}
											</button>
										</td>
										<td className="py-3 pr-3 text-xs text-white/55">
											{junior.discordId || "—"}
										</td>
										<td className="py-3 pr-3 text-xs text-white/55">
											{junior.dispositif || "—"}
										</td>
										<td className="py-3 pr-3 text-xs text-white/55">
											{(junior.referent &&
												(junior.referent.name ||
													junior.referent.email)) ||
												"—"}
										</td>
										<td className="py-3 pr-3">
											<FancySelect
												value={junior.status}
												options={STATUS_OPTIONS}
												onChange={(value) =>
													updateStatus(junior, value)
												}
											/>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{selectedJunior ? (
				<JuniorFSI
					junior={selectedJunior}
					pimId={pimId}
					events={events}
					notes={notes}
					orgLogoUrl={orgLogoUrl}
					onNoteCreated={(note) =>
						setNotes((prev) => [note, ...prev])
					}
				/>
			) : (
				<p className="rounded-md border border-dashed border-white/10 px-4 py-6 text-sm text-white/50">
					Clique sur un junior pour ouvrir sa Fiche de Suivi
					Individualisée.
				</p>
			)}

			{showAdd ? (
				<AddJuniorModal
					pimId={pimId}
					referents={referents}
					orgLogoUrl={orgLogoUrl}
					onCreated={(junior) => {
						setJuniors((previous) => [junior, ...previous]);
						setSelectedJuniorId(junior.id);
						setShowAdd(false);
					}}
					onClose={() => setShowAdd(false)}
				/>
			) : null}
		</div>
	);
}

/**
 * Renders Timeline Pane
 * @param {{ pim: any, events: any[], juniors: any[], user: any, onEventCreated: (event: any) => void }} props Pane Props
 * @returns {JSX.Element} Pane View
 */

function TimelinePane({ pim, events, juniors, user, onEventCreated }) {
	const [view, setView] = useState("gantt");
	const [creating, setCreating] = useState(false);
	const [status, setStatus] = useState("");
	const [eventForm, setEventForm] = useState({
		templateTitle: "Live de prévu",
		eventType: "live_multi",
		title: "",
		description: "",
		startAt: "",
		endAt: "",
		timelineSource: ["responsable", "super_admin"].includes(
			String(user?.role || "").toLowerCase(),
		)
			? "responsable"
			: "referent",
		juniorId: "",
	});

	const orderedEvents = useMemo(
		() =>
			(events || [])
				.slice()
				.sort(
					(a, b) =>
						new Date(a.startAt).getTime() -
						new Date(b.startAt).getTime(),
				),
		[events],
	);

	const startMin = useMemo(() => {
		if (!orderedEvents.length) return Date.now();
		return Math.min(
			...orderedEvents.map((item) => new Date(item.startAt).getTime()),
		);
	}, [orderedEvents]);
	const endMax = useMemo(() => {
		if (!orderedEvents.length) return Date.now() + 86400000;
		return Math.max(
			...orderedEvents.map((item) =>
				item.endAt
					? new Date(item.endAt).getTime()
					: new Date(item.startAt).getTime() + 3600000,
			),
		);
	}, [orderedEvents]);
	const totalRange = Math.max(endMax - startMin, 3600000);

	/**
	 * Creates Feed Event
	 * @returns {Promise<void>} Async Done
	 */

	async function createEventFromForm() {
		if (!eventForm.title || !eventForm.startAt) {
			setStatus("Titre et date de début requis.");
			return;
		}
		setCreating(true);
		setStatus("Création de l'événement...");
		try {
			const response = await createFeedEvent({
				pimId: pim.id,
				title: eventForm.title,
				eventType: eventForm.eventType,
				description: eventForm.description || null,
				startAt: new Date(eventForm.startAt).toISOString(),
				endAt: eventForm.endAt
					? new Date(eventForm.endAt).toISOString()
					: null,
				timelineSource: eventForm.timelineSource,
				juniorIds: eventForm.juniorId ? [eventForm.juniorId] : [],
			});
			onEventCreated(response.event);
			setStatus("Événement ajouté.");
			setEventForm((prev) => ({
				...prev,
				title: "",
				description: "",
				startAt: "",
				endAt: "",
				juniorId: "",
			}));
		} catch (error) {
			setStatus(error.message || "Impossible de créer l'événement.");
		} finally {
			setCreating(false);
		}
	}

	/**
	 * Applies PIM Templates
	 * @returns {Promise<void>} Async Done
	 */

	async function applyDefaults() {
		setStatus("Application des templates...");
		try {
			await seedPimDefaults(pim.id);
			setStatus("Templates ajoutés. Recharge les données pour les voir.");
		} catch (error) {
			setStatus(error.message || "Impossible d'ajouter les templates.");
		}
	}

	return (
		<div className="space-y-4">
			<div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex flex-wrap gap-2">
						{TIMELINE_VIEWS.map((item) => (
							<button
								key={item.key}
								type="button"
								onClick={() => setView(item.key)}
								className={`rounded-md border px-3 py-1.5 text-xs ${view === item.key ? "border-white/20 bg-white text-black" : "border-white/15 text-white/75 hover:bg-white/5"}`}>
								{item.label}
							</button>
						))}
					</div>
					<button
						type="button"
						onClick={applyDefaults}
						className="rounded-md border border-white/20 px-3 py-2 text-xs text-white/80 hover:bg-white/5">
						Appliquer les templates PIM
					</button>
				</div>

				<div className="mt-4 grid gap-3 sm:grid-cols-3">
					<div className="rounded-md border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
						Rouge: Timeline prévue (obligatoire)
					</div>
					<div className="rounded-md border border-orange-400/40 bg-orange-500/10 px-3 py-2 text-xs text-orange-200">
						Orange: Ajout responsable
					</div>
					<div className="rounded-md border border-sky-400/40 bg-sky-500/10 px-3 py-2 text-xs text-sky-200">
						Bleu: Ajout référent
					</div>
				</div>
			</div>

			<div className="rounded-md border border-white/10 bg-[#090909] p-4">
				<h4 className="text-base font-semibold">
					Ajouter un événement
				</h4>
				<div className="mt-3 grid gap-3 md:grid-cols-2">
					<FancySelect
						label="Template"
						value={eventForm.templateTitle}
						options={EVENT_TEMPLATE_OPTIONS.map((item) => ({
							value: item.title,
							label: item.title,
						}))}
						onChange={(value) => {
							const template = EVENT_TEMPLATE_OPTIONS.find(
								(item) => item.title === value,
							);
							setEventForm((prev) => ({
								...prev,
								templateTitle: value,
								title: value,
								eventType: template?.eventType || "autre",
							}));
						}}
					/>
					<FancySelect
						label="Source timeline"
						value={eventForm.timelineSource}
						options={[
							{ value: "planned", label: "Prévu" },
							{
								value: "responsable",
								label: "Ajout responsable",
							},
							{ value: "referent", label: "Ajout référent" },
						]}
						onChange={(value) =>
							setEventForm((prev) => ({
								...prev,
								timelineSource: value,
							}))
						}
					/>
					<label className="space-y-1 text-sm md:col-span-2">
						<span className="text-white/70">Titre</span>
						<input
							value={eventForm.title}
							onChange={(event) =>
								setEventForm((prev) => ({
									...prev,
									title: event.target.value,
								}))
							}
							className="h-11 w-full rounded-md border border-white/10 bg-black/45 px-3 text-white"
						/>
					</label>
					<label className="space-y-1 text-sm">
						<span className="text-white/70">Début</span>
						<input
							type="datetime-local"
							value={eventForm.startAt}
							onChange={(event) =>
								setEventForm((prev) => ({
									...prev,
									startAt: event.target.value,
								}))
							}
							className="h-11 w-full rounded-md border border-white/10 bg-black/45 px-3 text-white"
						/>
					</label>
					<label className="space-y-1 text-sm">
						<span className="text-white/70">Fin</span>
						<input
							type="datetime-local"
							value={eventForm.endAt}
							onChange={(event) =>
								setEventForm((prev) => ({
									...prev,
									endAt: event.target.value,
								}))
							}
							className="h-11 w-full rounded-md border border-white/10 bg-black/45 px-3 text-white"
						/>
					</label>
					<FancySelect
						label="Junior concerné"
						value={eventForm.juniorId}
						placeholder="Aucun"
						options={[
							{ value: "", label: "Aucun" },
							...juniors.map((junior) => ({
								value: junior.id,
								label: junior.displayName,
								description: junior.dispositif,
							})),
						]}
						onChange={(value) =>
							setEventForm((prev) => ({
								...prev,
								juniorId: value,
							}))
						}
					/>
					<label className="space-y-1 text-sm md:col-span-2">
						<span className="text-white/70">Description</span>
						<textarea
							rows={3}
							value={eventForm.description}
							onChange={(event) =>
								setEventForm((prev) => ({
									...prev,
									description: event.target.value,
								}))
							}
							className="w-full rounded-md border border-white/10 bg-black/45 px-3 py-2 text-white"
						/>
					</label>
				</div>
				<div className="mt-3 flex items-center justify-between">
					<p className="text-xs text-white/60">{status}</p>
					<button
						type="button"
						disabled={creating}
						onClick={createEventFromForm}
						className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
						Ajouter
					</button>
				</div>
			</div>

			<div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
				{view === "gantt" ? (
					<div className="space-y-3">
						<p className="text-sm text-white/65">Vue Gantt</p>
						{orderedEvents.map((event) => {
							const start = new Date(event.startAt).getTime();
							const end = event.endAt
								? new Date(event.endAt).getTime()
								: start + 3600000;
							const left =
								((start - startMin) / totalRange) * 100;
							const width = Math.max(
								((end - start) / totalRange) * 100,
								2,
							);
							const source = inferTimelineSource(event);
							return (
								<div
									key={event.id}
									className="rounded-md border border-white/10 bg-black/35 p-3">
									<div className="mb-2 flex items-center justify-between gap-2">
										<p className="text-sm font-semibold text-white">
											{event.title}
										</p>
										<span
											className={`rounded-md border px-2 py-1 text-[10px] ${SOURCE_COLORS[source] || SOURCE_COLORS.referent}`}>
											{sourceLabel(source)}
										</span>
									</div>
									<div className="relative h-7 rounded-md border border-white/10 bg-[#050505]">
										<div
											className={`absolute top-1 h-5 rounded-md border ${SOURCE_COLORS[source] || SOURCE_COLORS.referent}`}
											style={{
												left: `${left}%`,
												width: `${width}%`,
											}}
										/>
									</div>
									<p className="mt-2 text-xs text-white/45">
										{new Date(event.startAt).toLocaleString(
											"fr-FR",
										)}{" "}
										→{" "}
										{event.endAt
											? new Date(
													event.endAt,
												).toLocaleString("fr-FR")
											: "—"}
									</p>
								</div>
							);
						})}
						{orderedEvents.length === 0 ? (
							<p className="text-sm text-white/55">
								Aucun événement.
							</p>
						) : null}
					</div>
				) : null}

				{view === "fresque" ? (
					<div className="space-y-2">
						<p className="text-sm text-white/65">Vue Fresque</p>
						{orderedEvents.map((event) => {
							const source = inferTimelineSource(event);
							return (
								<div key={event.id} className="flex gap-3">
									<div className="flex flex-col items-center">
										<div
											className={`h-3 w-3 rounded-full border ${SOURCE_COLORS[source] || SOURCE_COLORS.referent}`}
										/>
										<div className="h-full w-px bg-white/10" />
									</div>
									<div className="mb-2 flex-1 rounded-md border border-white/10 bg-black/35 px-3 py-2">
										<p className="text-sm font-medium text-white">
											{event.title}
										</p>
										<p className="text-xs text-white/45">
											{new Date(
												event.startAt,
											).toLocaleString("fr-FR")}
										</p>
									</div>
								</div>
							);
						})}
						{orderedEvents.length === 0 ? (
							<p className="text-sm text-white/55">
								Aucun événement.
							</p>
						) : null}
					</div>
				) : null}

				{view === "calendar" ? (
					<div className="space-y-2">
						<p className="text-sm text-white/65">Vue Calendrier</p>
						<div className="grid gap-2 md:grid-cols-2">
							{orderedEvents.map((event) => {
								const source = inferTimelineSource(event);
								return (
									<div
										key={event.id}
										className="rounded-md border border-white/10 bg-black/35 px-3 py-2">
										<div className="flex items-center justify-between gap-2">
											<p className="text-sm font-medium text-white">
												{event.title}
											</p>
											<span
												className={`rounded-md border px-2 py-1 text-[10px] ${SOURCE_COLORS[source] || SOURCE_COLORS.referent}`}>
												{sourceLabel(source)}
											</span>
										</div>
										<p className="text-xs text-white/45">
											{new Date(
												event.startAt,
											).toLocaleString("fr-FR")}
										</p>
									</div>
								);
							})}
						</div>
						{orderedEvents.length === 0 ? (
							<p className="text-sm text-white/55">
								Aucun événement.
							</p>
						) : null}
					</div>
				) : null}
			</div>
		</div>
	);
}

/**
 * Renders Sessions Page
 * @param {{ pims: any[], events: any[], organizations: any[], users: any[], user: any }} props Page Props
 * @returns {JSX.Element} Page View
 */

export function SessionsPage({
	pims,
	events,
	organizations,
	users,
	user,
	prefs,
	onPimCreated,
	initialCreateOrgId,
	onCreateModalMounted,
}) {
	const initialFromUrl = parseSearchParams();
	const [selectedPimId, setSelectedPimId] = useState(initialFromUrl.pim);
	const [activePimTab, setActivePimTab] = useState(initialFromUrl.tab);
	const [showCreatePim, setShowCreatePim] = useState(Boolean(initialCreateOrgId));
	const [localPims, setLocalPims] = useState(pims || []);
	const [localEvents, setLocalEvents] = useState(events || []);
	const [pimJuniors, setPimJuniors] = useState([]);

	useEffect(() => {
		setLocalPims(pims || []);
	}, [pims]);

	useEffect(() => {
		setLocalEvents(events || []);
	}, [events]);

	useEffect(() => {
		if (!selectedPimId && initialFromUrl.pim) {
			setSelectedPimId(initialFromUrl.pim);
		}
	}, [initialFromUrl.pim, selectedPimId]);

	useEffect(() => {
		if (initialCreateOrgId) {
			setShowCreatePim(true);
			onCreateModalMounted?.();
		}
	}, [initialCreateOrgId]);

	useEffect(() => {
		syncPimUrl(selectedPimId, activePimTab);
	}, [selectedPimId, activePimTab]);

	useEffect(() => {
		if (!selectedPimId) {
			setPimJuniors([]);
			return;
		}
		fetchJuniors(selectedPimId)
			.then((response) => setPimJuniors(response.juniors || []))
			.catch(() => setPimJuniors([]));
	}, [selectedPimId, localEvents.length]);

	const selectedPim =
		localPims.find((pim) => pim.id === selectedPimId) || null;
	const displayedEvents = selectedPim
		? localEvents.filter((event) => event.pimId === selectedPim.id)
		: [];
	const selectedOrg = selectedPim
		? (organizations || []).find(
				(org) => org.id === selectedPim.organizationId,
			)
		: null;
	const selectedOrgLogoUrl = selectedOrg
		? (CUSTOMER_LOGO_BY_KEY[selectedOrg.logoKey] ?? null)
		: null;
	const selectedOrgLogoScale = selectedOrg?.logoKey
		? (prefs?.logoScales?.[selectedOrg.logoKey] ?? 1)
		: 1;
	const referents = useMemo(
		() =>
			(users || []).filter((u) =>
				["referent", "responsable", "super_admin"].includes(
					String(u.role || "").toLowerCase(),
				),
			),
		[users],
	);
	const canCreate =
		user &&
		["responsable", "super_admin"].includes(
			String(user.role || "").toLowerCase(),
		);

	return (
		<section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
			{selectedPim ? (
				<>
					<div className="flex flex-wrap items-end justify-between gap-4">
						<div>
							<button
								type="button"
								onClick={() => setSelectedPimId(null)}
								className="mb-3 flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5">
								<ArrowLeftIcon className="h-3.5 w-3.5" />
								Retour aux sessions
							</button>
							<div className="flex items-center gap-3">
								{selectedOrgLogoUrl ? (
									<img
										src={selectedOrgLogoUrl}
										alt=""
										className="h-10 w-auto object-contain"
										style={{ transform: `scale(${selectedOrgLogoScale})`, transformOrigin: "left center" }}
									/>
								) : null}
								<h2 className="text-3xl font-semibold">
									{selectedPim.title}
								</h2>
							</div>
							<p className="mt-1 text-sm text-white/55">
								{selectedPim.code} • URL liée: ?pim=
								{selectedPim.id}
							</p>
						</div>
						{canCreate ? (
							<button
								type="button"
								onClick={() => setShowCreatePim(true)}
								className="flex items-center gap-1.5 rounded-md border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-black">
								<PlusIcon className="h-4 w-4" />
								Nouvelle session
							</button>
						) : null}
					</div>

					<div className="grid gap-3 md:grid-cols-3">
						<div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
							<p className="text-xs uppercase tracking-[0.18em] text-white/35">
								Début
							</p>
							<p className="mt-2 text-sm text-white">
								{formatDateOrFallback(selectedPim.startDate)}
							</p>
						</div>
						<div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
							<p className="text-xs uppercase tracking-[0.18em] text-white/35">
								Fin
							</p>
							<p className="mt-2 text-sm text-white">
								{formatDateOrFallback(selectedPim.endDate)}
							</p>
						</div>
						<div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
							<p className="text-xs uppercase tracking-[0.18em] text-white/35">
								Organisation
							</p>
							<p className="mt-2 text-sm text-white">
								{organizations.find(
									(org) =>
										org.id === selectedPim.organizationId,
								)?.name || "Aucune"}
							</p>
						</div>
					</div>

					<div className="flex flex-wrap gap-2">
						{PIM_TABS.map((item) => (
							<button
								key={item.key}
								type="button"
								onClick={() => setActivePimTab(item.key)}
								className={`rounded-md border px-4 py-2 text-sm ${activePimTab === item.key ? "border-white/20 bg-white text-black" : "border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/[0.06]"}`}>
								{item.label}
							</button>
						))}
					</div>

					{activePimTab === "juniors" ? (
						<JuniorsPane
							pimId={selectedPim.id}
							referents={referents}
							events={displayedEvents}
							orgLogoUrl={selectedOrgLogoUrl}
						/>
					) : (
						<TimelinePane
							pim={selectedPim}
							events={displayedEvents}
							juniors={pimJuniors}
							user={user}
							onEventCreated={(createdEvent) => {
								setLocalEvents((prev) => [
									createdEvent,
									...prev,
								]);
							}}
						/>
					)}
				</>
			) : (
				<>
					<div className="flex flex-wrap items-end justify-between gap-4">
						<div>
							<p className="text-xs uppercase tracking-[0.22em] text-white/35">
								Sessions
							</p>
							<h2 className="mt-2 text-3xl font-semibold">
								PIM en cours
							</h2>
						</div>
						{canCreate ? (
							<button
								type="button"
								onClick={() => setShowCreatePim(true)}
								className="flex items-center gap-1.5 rounded-md border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-black">
								<PlusIcon className="h-4 w-4" />
								Nouvelle session
							</button>
						) : null}
					</div>

					<div className="space-y-2 rounded-md border border-white/10 bg-[#090909] p-4">
						{localPims.map((pim) => (
							<button
								key={pim.id}
								type="button"
								onClick={() => setSelectedPimId(pim.id)}
								className="w-full rounded-md border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition hover:bg-white/[0.05]">
								<div className="flex items-center justify-between gap-3">
									<div>
										<p className="text-base font-semibold text-white">
											{pim.title}
										</p>
										<p className="text-xs text-white/45">
											{pim.code}
										</p>
										<p className="text-[10px] text-white/30">
											{formatDateOrFallback(pim.startDate)} → {formatDateOrFallback(pim.endDate)}
										</p>
									</div>
									<span className="rounded-md border border-white/10 bg-black/35 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60">
										{pim.type || "PIM"}
									</span>
								</div>
							</button>
						))}
						{localPims.length === 0 ? (
							<p className="rounded-md border border-dashed border-white/10 px-4 py-6 text-sm text-white/50">
								Aucune session disponible.
							</p>
						) : null}
					</div>
				</>
			)}

			{showCreatePim ? (
				<CreatePimModal
					organizations={organizations || []}
					initialOrgId={initialCreateOrgId || null}
					onCreated={(pim) => {
						setLocalPims((previous) => [pim, ...previous]);
						setSelectedPimId(pim.id);
						setShowCreatePim(false);
						onPimCreated?.(pim);
					}}
					onClose={() => setShowCreatePim(false)}
				/>
			) : null}
		</section>
	);
}
