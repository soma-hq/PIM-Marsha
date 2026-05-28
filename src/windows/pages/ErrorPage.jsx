import React from "react";

/**
 * Renders Error Screen
 * @param {{ message?: string, onRetry: () => void }} props Error Props
 * @returns {JSX.Element} Error View
 */

export function ErrorPage({ message, onRetry }) {
	return (
		<section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 sm:p-8">
				<p className="text-xs font-bold uppercase tracking-[0.22em] text-red-200/90">
					Erreur
				</p>
				<h2 className="mt-3 text-2xl font-bold text-red-100">
					Impossible de charger les données.
				</h2>
				<p className="mt-3 text-sm text-red-100/90">
					{message ||
						"Une erreur est survenue pendant le chargement."}
				</p>
				<button
					type="button"
					onClick={onRetry}
					className="mt-5 rounded-xl border border-red-100/30 bg-red-100/10 px-4 py-2 text-sm font-semibold text-red-50 transition hover:bg-red-100/20">
					Relancer le chargement
				</button>
			</div>
		</section>
	);
}
