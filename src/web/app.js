let token = "";
let selectedPimId = "";
let calendar = null;
let currentRole = "";

const authStatus = document.getElementById("auth-status");

function setStatus(message, ok = true) {
	authStatus.textContent = message;
	authStatus.style.color = ok ? "var(--ok)" : "var(--danger)";
}

async function api(path, options = {}) {
	const headers = {
		"Content-Type": "application/json",
		...(options.headers || {}),
	};

	if (token) headers.Authorization = `Bearer ${token}`;

	const response = await fetch(`/api${path}`, {
		...options,
		headers,
		credentials: "include",
	});

	const text = await response.text();
	const data = text ? JSON.parse(text) : null;

	if (!response.ok) {
		const message = data?.message || `Erreur API ${response.status}`;
		throw new Error(message);
	}

	return data;
}

function requirePim() {
	if (!selectedPimId) throw new Error("Sélectionne d'abord une PIM");
}

function withActions(onEdit, onDelete) {
	return `<div class="actions"><button data-action="edit">Modifier</button><button data-action="delete" class="secondary">Supprimer</button></div>`;
}

async function refreshUsers() {
	if (currentRole !== "super_admin") return;
	const { users } = await api("/users");
	const list = document.getElementById("users-list");
	if (!list) return;
	list.innerHTML = "";

	users.forEach((user) => {
		const li = document.createElement("li");
		li.innerHTML = `<strong>${user.firstName || ""} ${user.lastName || ""}</strong><br><small>${user.email} - ${user.role}</small>${withActions()}`;

		li.querySelector('[data-action="edit"]').addEventListener(
			"click",
			async () => {
				const email = prompt("Email", user.email) || user.email;
				const firstName =
					prompt("Prénom", user.firstName || "") || user.firstName;
				const lastName =
					prompt("Nom", user.lastName || "") || user.lastName;
				const role = prompt("Role", user.role) || user.role;
				await api(`/users/${user.id}`, {
					method: "PATCH",
					body: JSON.stringify({ email, firstName, lastName, role }),
				});
				await refreshUsers();
			},
		);

		li.querySelector('[data-action="delete"]').addEventListener(
			"click",
			async () => {
				if (!confirm("Supprimer cet utilisateur ?")) return;
				await api(`/users/${user.id}`, { method: "DELETE" });
				await refreshUsers();
			},
		);

		list.appendChild(li);
	});
}

async function refreshPims() {
	const { pims } = await api("/pims");
	const list = document.getElementById("pims-list");
	list.innerHTML = "";

	pims.forEach((pim) => {
		const li = document.createElement("li");
		li.innerHTML = `<strong>${pim.title}</strong><br><small>${pim.code}</small>${withActions()}`;

		li.addEventListener("click", async () => {
			selectedPimId = pim.id;
			await refreshAllEntities();
		});

		li.querySelector('[data-action="edit"]').addEventListener(
			"click",
			async (event) => {
				event.stopPropagation();
				const title = prompt("Nouveau titre", pim.title);
				if (!title) return;
				await api(`/pims/${pim.id}`, {
					method: "PATCH",
					body: JSON.stringify({ title }),
				});
				await refreshPims();
			},
		);

		li.querySelector('[data-action="delete"]').addEventListener(
			"click",
			async (event) => {
				event.stopPropagation();
				if (!confirm("Supprimer cette PIM ?")) return;
				await api(`/pims/${pim.id}`, { method: "DELETE" });
				if (selectedPimId === pim.id) selectedPimId = "";
				await refreshAllEntities();
			},
		);

		list.appendChild(li);
	});

	if (!selectedPimId && pims[0]) selectedPimId = pims[0].id;
}

async function refreshJuniors() {
	if (!selectedPimId) return;
	const { juniors } = await api(`/juniors?pimId=${selectedPimId}`);
	const list = document.getElementById("juniors-list");
	list.innerHTML = "";

	juniors.forEach((junior) => {
		const li = document.createElement("li");
		li.innerHTML = `<strong>${junior.displayName}</strong><br><small>${junior.dispositif} - ${junior.status}</small>${withActions()}`;

		li.querySelector('[data-action="edit"]').addEventListener(
			"click",
			async () => {
				const status = prompt("Nouveau statut", junior.status);
				if (!status) return;
				await api(`/juniors/${junior.id}`, {
					method: "PATCH",
					body: JSON.stringify({ status }),
				});
				await refreshJuniors();
			},
		);

		li.querySelector('[data-action="delete"]').addEventListener(
			"click",
			async () => {
				if (!confirm("Supprimer ce junior ?")) return;
				await api(`/juniors/${junior.id}`, { method: "DELETE" });
				await refreshJuniors();
			},
		);

		list.appendChild(li);
	});
}

async function refreshNotes() {
	if (!selectedPimId) return;
	const { notes } = await api(`/notes?pimId=${selectedPimId}`);
	const list = document.getElementById("notes-list");
	list.innerHTML = "";

	notes.forEach((note) => {
		const li = document.createElement("li");
		li.innerHTML = `<strong>${note.title}</strong><br><small>${note.content.slice(0, 150)}</small>${withActions()}`;

		li.querySelector('[data-action="edit"]').addEventListener(
			"click",
			async () => {
				const content = prompt("Nouveau contenu", note.content);
				if (!content) return;
				await api(`/notes/${note.id}`, {
					method: "PATCH",
					body: JSON.stringify({ content }),
				});
				await refreshNotes();
			},
		);

		li.querySelector('[data-action="delete"]').addEventListener(
			"click",
			async () => {
				if (!confirm("Supprimer cette note ?")) return;
				await api(`/notes/${note.id}`, { method: "DELETE" });
				await refreshNotes();
			},
		);

		list.appendChild(li);
	});
}

async function refreshRemarks() {
	if (!selectedPimId) return;
	const { remarks } = await api(`/remarks?pimId=${selectedPimId}`);
	const list = document.getElementById("remarks-list");
	list.innerHTML = "";

	remarks.forEach((remark) => {
		const li = document.createElement("li");
		li.innerHTML = `<strong>${remark.title}</strong><br><small>${remark.priority} - ${remark.content.slice(0, 150)}</small>${withActions()}`;

		li.querySelector('[data-action="edit"]').addEventListener(
			"click",
			async () => {
				const content = prompt("Nouveau contenu", remark.content);
				if (!content) return;
				await api(`/remarks/${remark.id}`, {
					method: "PATCH",
					body: JSON.stringify({ content }),
				});
				await refreshRemarks();
			},
		);

		li.querySelector('[data-action="delete"]').addEventListener(
			"click",
			async () => {
				if (!confirm("Supprimer cette remarque ?")) return;
				await api(`/remarks/${remark.id}`, { method: "DELETE" });
				await refreshRemarks();
			},
		);

		list.appendChild(li);
	});
}

async function refreshEvents() {
	if (!selectedPimId) return;
	const { events } = await api(`/feed-events?pimId=${selectedPimId}`);
	const list = document.getElementById("events-list");
	list.innerHTML = "";

	events.forEach((event) => {
		const li = document.createElement("li");
		li.innerHTML = `<strong>${event.title}</strong><br><small>${event.eventType} - ${new Date(event.startAt).toLocaleString()}</small>${withActions()}`;

		li.querySelector('[data-action="edit"]').addEventListener(
			"click",
			async () => {
				const title = prompt("Nouveau titre", event.title);
				if (!title) return;
				await api(`/feed-events/${event.id}`, {
					method: "PATCH",
					body: JSON.stringify({ title }),
				});
				await refreshEvents();
				await refreshCalendar();
			},
		);

		li.querySelector('[data-action="delete"]').addEventListener(
			"click",
			async () => {
				if (!confirm("Supprimer cet evenement ?")) return;
				await api(`/feed-events/${event.id}`, { method: "DELETE" });
				await refreshEvents();
				await refreshCalendar();
			},
		);

		list.appendChild(li);
	});
}

async function refreshCalendar() {
	if (!selectedPimId || !calendar) return;
	const { events } = await api(`/feed-events?pimId=${selectedPimId}`);
	const mapped = events.map((event) => ({
		id: event.id,
		title: event.title,
		start: event.startAt,
		end: event.endAt,
		extendedProps: {
			type: event.eventType,
			responsable: event.responsable?.name || "N/A",
			juniors: (event.juniors || []).map((j) => j.displayName).join(", "),
		},
	}));

	calendar.removeAllEvents();
	calendar.addEventSource(mapped);
}

async function refreshAllEntities() {
	await refreshPims();
	await refreshUsers();
	if (!selectedPimId) return;
	await Promise.all([
		refreshJuniors(),
		refreshNotes(),
		refreshRemarks(),
		refreshEvents(),
		refreshCalendar(),
	]);
}

document.getElementById("auth-form").addEventListener("submit", async (e) => {
	e.preventDefault();
	try {
		const email = document.getElementById("email").value;
		const password = document.getElementById("password").value;
		const response = await api("/auth/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		});
		token = response.token;
		currentRole = response.user.role;
		setStatus(`Connecté : ${response.user.name} (${response.user.role})`);
		await refreshAllEntities();
	} catch (error) {
		setStatus(error.message, false);
	}
});

document.getElementById("logout-btn").addEventListener("click", async () => {
	try {
		await api("/auth/logout", { method: "POST" });
		token = "";
		currentRole = "";
		selectedPimId = "";
		setStatus("Session fermée");
	} catch (error) {
		setStatus(error.message, false);
	}
});

document.getElementById("refresh-all").addEventListener("click", async () => {
	try {
		await refreshAllEntities();
		setStatus("Donnees rafraichies");
	} catch (error) {
		setStatus(error.message, false);
	}
});

document
	.getElementById("bootstrap-owner")
	.addEventListener("click", async () => {
		try {
			const email = prompt("Email owner:");
			const name = prompt("Nom owner:");
			const password = prompt("Mot de passe owner:");
			if (!email || !name || !password) return;

			await api("/auth/register", {
				method: "POST",
				body: JSON.stringify({
					email,
					name,
					password,
					role: "super_admin",
				}),
			});

			setStatus("Super Admin créé, connecte-toi maintenant.");
		} catch (error) {
			setStatus(error.message, false);
		}
	});

document.getElementById("pim-form").addEventListener("submit", async (e) => {
	e.preventDefault();
	try {
		const title = document.getElementById("pim-title").value;
		const code = document.getElementById("pim-code").value;
		await api("/pims", {
			method: "POST",
			body: JSON.stringify({
				title,
				code,
				startDate: new Date().toISOString().slice(0, 10),
				isPrivate: true,
			}),
		});
		document.getElementById("pim-form").reset();
		await refreshAllEntities();
	} catch (error) {
		setStatus(error.message, false);
	}
});

document.getElementById("user-form")?.addEventListener("submit", async (e) => {
	e.preventDefault();
	try {
		if (currentRole !== "super_admin")
			throw new Error("Réservé au Super Admin");
		const email = document.getElementById("user-email").value;
		const name = document.getElementById("user-name").value;
		const firstName = document.getElementById("user-firstname").value;
		const lastName = document.getElementById("user-lastname").value;
		const password = document.getElementById("user-password").value;
		const role = document.getElementById("user-role").value;
		await api("/users", {
			method: "POST",
			body: JSON.stringify({
				email,
				name,
				firstName,
				lastName,
				password,
				role,
			}),
		});
		document.getElementById("user-form").reset();
		await refreshUsers();
	} catch (error) {
		setStatus(error.message, false);
	}
});

document.getElementById("seed-pim-btn").addEventListener("click", async () => {
	try {
		requirePim();
		await api(`/pims/${selectedPimId}/seed-defaults`, { method: "POST" });
		await refreshAllEntities();
		setStatus("Seed de la PIM terminé");
	} catch (error) {
		setStatus(error.message, false);
	}
});

document.getElementById("junior-form").addEventListener("submit", async (e) => {
	e.preventDefault();
	try {
		requirePim();
		const firstName = document.getElementById("junior-firstname").value;
		const lastName = document.getElementById("junior-lastname").value;
		const template = document.getElementById("junior-template").value;
		await api("/juniors", {
			method: "POST",
			body: JSON.stringify({
				pimId: selectedPimId,
				firstName,
				lastName,
				displayName: `${firstName} ${lastName}`,
				template,
				startDate: new Date().toISOString().slice(0, 10),
			}),
		});
		document.getElementById("junior-form").reset();
		await refreshJuniors();
	} catch (error) {
		setStatus(error.message, false);
	}
});

document.getElementById("note-form").addEventListener("submit", async (e) => {
	e.preventDefault();
	try {
		requirePim();
		const title = document.getElementById("note-title").value;
		const content = document.getElementById("note-content").value;
		await api("/notes", {
			method: "POST",
			body: JSON.stringify({
				pimId: selectedPimId,
				title,
				content,
				scope: "general",
			}),
		});
		document.getElementById("note-form").reset();
		await refreshNotes();
	} catch (error) {
		setStatus(error.message, false);
	}
});

document.getElementById("remark-form").addEventListener("submit", async (e) => {
	e.preventDefault();
	try {
		requirePim();
		const title = document.getElementById("remark-title").value;
		const content = document.getElementById("remark-content").value;
		const priority = document.getElementById("remark-priority").value;
		await api("/remarks", {
			method: "POST",
			body: JSON.stringify({
				pimId: selectedPimId,
				title,
				content,
				priority,
				scope: "general",
			}),
		});
		document.getElementById("remark-form").reset();
		await refreshRemarks();
	} catch (error) {
		setStatus(error.message, false);
	}
});

document.getElementById("event-form").addEventListener("submit", async (e) => {
	e.preventDefault();
	try {
		requirePim();
		const title = document.getElementById("event-title").value;
		const eventType = document.getElementById("event-type").value;
		const startAt = document.getElementById("event-start").value;
		const endAt = document.getElementById("event-end").value;

		await api("/feed-events", {
			method: "POST",
			body: JSON.stringify({
				pimId: selectedPimId,
				title,
				eventType,
				startAt,
				endAt: endAt || null,
			}),
		});

		document.getElementById("event-form").reset();
		await refreshEvents();
		await refreshCalendar();
	} catch (error) {
		setStatus(error.message, false);
	}
});

function initCalendar() {
	const calendarElement = document.getElementById("calendar");

	calendar = new FullCalendar.Calendar(calendarElement, {
		plugins: [
			FullCalendar.dayGridPlugin,
			FullCalendar.timeGridPlugin,
			FullCalendar.interactionPlugin,
		],
		initialView: "timeGridWeek",
		locale: "fr",
		height: "auto",
		nowIndicator: true,
		editable: false,
		eventDidMount(info) {
			const { type, responsable, juniors } = info.event.extendedProps;
			info.el.title = `${type}\nResponsable: ${responsable}\nJuniors: ${juniors || "Aucun"}`;
		},
	});

	calendar.render();
}

async function bootstrap() {
	initCalendar();
	try {
		const { user } = await api("/auth/me");
		currentRole = user.role;
		setStatus(`Session active: ${user.name} (${user.role})`);
		await refreshAllEntities();
	} catch {
		setStatus("Connecte-toi pour charger les donnees.", false);
	}
}

bootstrap();
