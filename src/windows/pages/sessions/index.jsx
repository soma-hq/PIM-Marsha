import React, { useEffect, useMemo, useState } from "react";

import {
	createPim,
	fetchJuniors,
	createJunior,
	updateJunior,
	createFeedEvent,
	fetchNotes,
	createNote,
	apiRequest,
} from "../../utils/api/client.jsx";
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from "../../utils/icons.jsx";
import { FancyDateField, FancySelect } from "../../components/ui/Controls.jsx";

import {
	PIM_TABS,
	HUB_SECTIONS,
	PIM_TYPES,
	ROLE_CAN_EDIT_FSI,
	CUSTOMER_LOGO_BY_KEY,
	PERIODICITY_OPTIONS,
	parseSearchParams,
	syncPimUrl,
	formatDateOrFallback,
	parseFsiNotes,
	fsiEmptyState,
} from "./shared.js";
import { HubView } from "./HubView.jsx";
import { FsiView } from "./FsiView.jsx";
import { RemarquesView } from "./RemarquesView.jsx";
import { CalendarView } from "./CalendarView.jsx";
import { CascadeFilters } from "../../components/ui/CascadeFilters.jsx";

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
									onChange={(e) =>
										setForm((prev) => ({
											...prev,
											title: e.target.value,
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
									onChange={(e) =>
										setForm((prev) => ({
											...prev,
											code: e.target.value,
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
										logoUrl:
											CUSTOMER_LOGO_BY_KEY[org.logoKey] ||
											null,
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
	const [hubSection, setHubSection] = useState("notes");
	const [pendingPimTab, setPendingPimTab] = useState(initialFromUrl.tab);
	const [pendingHubSection, setPendingHubSection] = useState("notes");
	const [showCreatePim, setShowCreatePim] = useState(
		Boolean(initialCreateOrgId),
	);
	const [localPims, setLocalPims] = useState(pims || []);
	const [localEvents, setLocalEvents] = useState(events || []);
	const [pimJuniors, setPimJuniors] = useState([]);
	const [pimNotes, setPimNotes] = useState([]);
	const [pimRemarks, setPimRemarks] = useState([]);
	const [pimTrainings, setPimTrainings] = useState([]);
	const [selectedJuniorId, setSelectedJuniorId] = useState(null);
	const [fsiStateByJunior, setFsiStateByJunior] = useState({});
	const [fsiNoteIdByJunior, setFsiNoteIdByJunior] = useState({});
	const [workspaceLoading, setWorkspaceLoading] = useState(false);

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
		setPendingPimTab(activePimTab || "hub");
	}, [activePimTab]);

	useEffect(() => {
		setPendingHubSection(hubSection || "notes");
	}, [hubSection]);

	useEffect(() => {
		if (!selectedPimId) {
			setPimJuniors([]);
			setPimNotes([]);
			setPimRemarks([]);
			setPimTrainings([]);
			setSelectedJuniorId(null);
			setFsiStateByJunior({});
			setFsiNoteIdByJunior({});
			return;
		}
		setWorkspaceLoading(true);
		Promise.all([
			fetchJuniors(selectedPimId),
			fetchNotes(selectedPimId),
			apiRequest(`/remarks?pimId=${encodeURIComponent(selectedPimId)}`),
			apiRequest(`/trainings?pimId=${encodeURIComponent(selectedPimId)}`),
		])
			.then(([juniorsRes, notesRes, remarksRes, trainingsRes]) => {
				setPimJuniors(juniorsRes.juniors || []);
				setPimNotes(notesRes.notes || []);
				setPimRemarks(remarksRes.remarks || []);
				setPimTrainings(trainingsRes.trainings || []);

				const fsiParsed = parseFsiNotes(notesRes.notes || []);
				setFsiStateByJunior(fsiParsed.stateByJunior);
				setFsiNoteIdByJunior(fsiParsed.noteIdByJunior);

				if ((juniorsRes.juniors || []).length) {
					setSelectedJuniorId(
						(prev) => prev || juniorsRes.juniors[0].id,
					);
				}
			})
			.catch(() => {
				setPimJuniors([]);
				setPimNotes([]);
				setPimRemarks([]);
				setPimTrainings([]);
				setFsiStateByJunior({});
				setFsiNoteIdByJunior({});
			})
			.finally(() => setWorkspaceLoading(false));
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
	const selectedJunior =
		pimJuniors.find((j) => j.id === selectedJuniorId) ||
		pimJuniors[0] ||
		null;
	const role = String(user?.role || "").toLowerCase();
	const canEditFsi = ROLE_CAN_EDIT_FSI.includes(role);
	const canCreateCalendarEvent = [
		"super_admin",
		"responsable",
		"referent",
	].includes(role);
	const canCreate =
		user &&
		["responsable", "super_admin"].includes(
			String(user.role || "").toLowerCase(),
		);
	const secondarySessionFilters = pendingPimTab === "hub" ? HUB_SECTIONS : [];
	const hasPendingChanges =
		pendingPimTab !== activePimTab ||
		(pendingPimTab === "hub" && pendingHubSection !== hubSection);

	async function persistFsiState(juniorId, state) {
		const payload = {
			pimId: selectedPimId,
			title: "[FSI_JSON] Donnees FSI",
			content: JSON.stringify(state),
			scope: "junior",
			juniorIds: [juniorId],
		};

		const existingNoteId = fsiNoteIdByJunior[juniorId];
		if (existingNoteId) {
			const response = await apiRequest(`/notes/${existingNoteId}`, {
				method: "PATCH",
				body: JSON.stringify(payload),
			});
			setPimNotes((prev) =>
				prev.map((item) =>
					item.id === existingNoteId
						? { ...item, ...response.note }
						: item,
				),
			);
			return;
		}

		const created = await createNote(payload);
		setFsiNoteIdByJunior((prev) => ({
			...prev,
			[juniorId]: created.note.id,
		}));
		setPimNotes((prev) => [created.note, ...prev]);
	}

	return (
		<section className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 text-[13px] sm:px-6 sm:text-sm lg:px-8">
			{selectedPim ? (
				<>
					<div>
						<button
							type="button"
							onClick={() => setSelectedPimId(null)}
							className="mb-5 flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white/65">
							<ArrowLeftIcon className="h-3.5 w-3.5" />
							Retour aux sessions
						</button>
						<div className="flex flex-wrap items-start justify-between gap-4">
							<div className="flex min-w-0 flex-col gap-3">
								<div className="flex items-center gap-3">
									{selectedOrgLogoUrl ? (
										<img
											src={selectedOrgLogoUrl}
											alt=""
											className="h-9 w-auto object-contain"
											style={{
												transform: `scale(${selectedOrgLogoScale})`,
												transformOrigin: "left center",
											}}
										/>
									) : null}
									<div>
										<h2 className="text-xl font-semibold text-white sm:text-2xl">
											{selectedPim.title}
										</h2>
										<p className="mt-0.5 text-xs text-white/35">
											{selectedPim.code} ·{" "}
											{formatDateOrFallback(
												selectedPim.startDate,
											)}{" "}
											→{" "}
											{formatDateOrFallback(
												selectedPim.endDate,
											)}
										</p>
									</div>
								</div>
								<CascadeFilters
									primaryOptions={PIM_TABS.map((item) => ({
										value: item.key,
										label: item.label,
									}))}
									primaryValue={pendingPimTab}
									onPrimaryChange={(value) => {
										setPendingPimTab(value);
										if (value !== "hub") return;
										if (
											!HUB_SECTIONS.some(
												(item) =>
													item.key ===
													pendingHubSection,
											)
										) {
											setPendingHubSection("notes");
										}
									}}
									secondaryOptions={secondarySessionFilters.map(
										(item) => ({
											value: item.key,
											label: item.label,
										}),
									)}
									secondaryValue={pendingHubSection}
									onSecondaryChange={setPendingHubSection}
									onApply={() => {
										setActivePimTab(pendingPimTab);
										if (pendingPimTab === "hub") {
											setHubSection(
												pendingHubSection || "notes",
											);
										}
									}}
									canApply={hasPendingChanges}
								/>
							</div>
							{canCreate ? (
								<button
									type="button"
									onClick={() => setShowCreatePim(true)}
									className="flex items-center gap-1.5 rounded-md border border-white/15 bg-white px-3 py-2 text-xs font-semibold text-black">
									<PlusIcon className="h-3.5 w-3.5" />
									Nouvelle session
								</button>
							) : null}
						</div>
					</div>
					{workspaceLoading ? (
						<div className="flex items-center gap-2 text-xs text-white/40">
							<div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
							Chargement du workspace…
						</div>
					) : null}

					{activePimTab === "hub" ? (
						<HubView
							juniorRows={pimJuniors}
							events={displayedEvents}
							trainings={pimTrainings}
							referents={referents}
							canEditJuniors={canEditFsi}
							onCreateJunior={async (payload) => {
								const parts = String(payload.displayName || "")
									.trim()
									.split(/\s+/);
								const firstName =
									parts[0] || payload.displayName;
								const lastName =
									parts.slice(1).join(" ") || firstName;
								const response = await createJunior({
									pimId: selectedPim.id,
									displayName: payload.displayName,
									firstName,
									lastName,
									dispositif: payload.dispositif,
									referentId: payload.referentId || null,
								});
								setPimJuniors((prev) => [
									response.junior,
									...prev,
								]);
							}}
							onUpdateJunior={async (junior, changes) => {
								await updateJunior(junior.id, changes);
								setPimJuniors((prev) =>
									prev.map((item) =>
										item.id === junior.id
											? { ...item, ...changes }
											: item,
									),
								);
							}}
							hubSection={hubSection}
							onJuniorSelect={(id) => {
								setSelectedJuniorId(id);
								setActivePimTab("fsi");
							}}
							selectedJuniorId={selectedJunior?.id || null}
						/>
					) : null}

					{activePimTab === "fsi" ? (
						selectedJunior ? (
							<FsiView
								junior={selectedJunior}
								fsiState={
									fsiStateByJunior[selectedJunior.id] ||
									fsiEmptyState()
								}
								canEdit={canEditFsi}
								onSave={async (nextState) => {
									setFsiStateByJunior((prev) => ({
										...prev,
										[selectedJunior.id]: nextState,
									}));
									await persistFsiState(
										selectedJunior.id,
										nextState,
									);
								}}
							/>
						) : (
							<p className="text-sm text-white/40">
								Sélectionne un Junior depuis le Hub pour ouvrir
								sa fiche FSI.
							</p>
						)
					) : null}

					{activePimTab === "remarques" ? (
						<RemarquesView
							juniors={pimJuniors}
							remarks={pimRemarks}
							onCreateRemark={async (payload) => {
								const response = await apiRequest("/remarks", {
									method: "POST",
									body: JSON.stringify({
										pimId: selectedPim.id,
										...payload,
									}),
								});
								setPimRemarks((prev) => [
									response.remark,
									...prev,
								]);
							}}
						/>
					) : null}

					{activePimTab === "calendrier" ? (
						<CalendarView
							juniors={pimJuniors}
							events={displayedEvents}
							canCreateEvent={canCreateCalendarEvent}
							onCreateEvent={async (eventPayload) => {
								const response = await createFeedEvent({
									pimId: selectedPim.id,
									title: eventPayload.title,
									eventType: eventPayload.eventType,
									startAt: new Date(
										eventPayload.startAt,
									).toISOString(),
									endAt: eventPayload.endAt
										? new Date(
												eventPayload.endAt,
											).toISOString()
										: null,
									timelineSource: canCreateCalendarEvent
										? "responsable"
										: "referent",
									juniorIds: eventPayload.juniorIds,
								});
								setLocalEvents((prev) => [
									response.event,
									...prev,
								]);
							}}
						/>
					) : null}
				</>
			) : (
				<>
					<div className="flex flex-wrap items-end justify-between gap-4">
						<div>
							<p className="text-xs uppercase tracking-[0.22em] text-white/30">
								Sessions
							</p>
							<h2 className="mt-2 text-xl font-semibold sm:text-2xl">
								PIM en cours
							</h2>
						</div>
						{canCreate ? (
							<button
								type="button"
								onClick={() => setShowCreatePim(true)}
								className="flex items-center gap-1.5 rounded-md border border-white/15 bg-white px-3 py-2 text-xs font-semibold text-black">
								<PlusIcon className="h-3.5 w-3.5" />
								Nouvelle session
							</button>
						) : null}
					</div>

					<div className="divide-y divide-white/[0.05]">
						{localPims.map((pim) => (
							<button
								key={pim.id}
								type="button"
								onClick={() => setSelectedPimId(pim.id)}
								className="w-full py-4 text-left transition-colors hover:bg-white/[0.02]">
								<div className="flex items-center justify-between gap-3">
									<div>
										<p className="text-sm font-semibold text-white/90">
											{pim.title}
										</p>
										<p className="mt-0.5 text-xs text-white/35">
											{pim.code} ·{" "}
											{formatDateOrFallback(
												pim.startDate,
											)}{" "}
											→{" "}
											{formatDateOrFallback(pim.endDate)}
										</p>
									</div>
									<span className="shrink-0 rounded px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/40">
										{pim.type || "PIM"}
									</span>
								</div>
							</button>
						))}
						{localPims.length === 0 ? (
							<p className="py-8 text-sm text-white/35">
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
						setLocalPims((prev) => [pim, ...prev]);
						setShowCreatePim(false);
						onPimCreated?.(pim);
					}}
					onClose={() => setShowCreatePim(false)}
				/>
			) : null}
		</section>
	);
}
