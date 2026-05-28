import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { XMarkIcon } from "../../utils/icons.jsx";

const ToastContext = createContext(null);

let _nextId = 0;

const TOAST_TYPE_STYLES = {
	success: "border-emerald-400/30 bg-emerald-900/60 text-emerald-200",
	error: "border-rose-400/30 bg-rose-900/60 text-rose-200",
	warning: "border-amber-400/30 bg-amber-900/60 text-amber-200",
	info: "border-sky-400/30 bg-sky-900/60 text-sky-200",
};

/**
 * Individual Toast Item
 * @param {{ toast: any, onRemove: (id: number) => void, durationMs: number }} props
 * @returns {JSX.Element}
 */
function ToastItem({ toast, onRemove, durationMs }) {
	const [visible, setVisible] = useState(false);
	const [leaving, setLeaving] = useState(false);

	useEffect(() => {
		// Trigger enter animation
		const enterFrame = requestAnimationFrame(() => setVisible(true));

		const leaveTimer = setTimeout(() => {
			setLeaving(true);
			setTimeout(() => onRemove(toast.id), 300);
		}, durationMs);

		return () => {
			cancelAnimationFrame(enterFrame);
			clearTimeout(leaveTimer);
		};
	}, []);

	function dismiss() {
		setLeaving(true);
		setTimeout(() => onRemove(toast.id), 300);
	}

	const typeStyle = TOAST_TYPE_STYLES[toast.type] || TOAST_TYPE_STYLES.info;

	return (
		<div
			className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-all duration-300 ${typeStyle} ${
				visible && !leaving
					? "translate-x-0 opacity-100"
					: "translate-x-8 opacity-0"
			}`}>
			<p className="flex-1 text-sm leading-snug">{toast.message}</p>
			<button
				onClick={dismiss}
				className="mt-0.5 shrink-0 opacity-60 transition-opacity hover:opacity-100">
				<XMarkIcon className="h-4 w-4" />
			</button>
		</div>
	);
}

/**
 * Toast Provider — wrap around app to enable toast notifications
 * @param {{ children: React.ReactNode, durationMs?: number }} props
 * @returns {JSX.Element}
 */
export function ToastProvider({ children, durationMs = 4000 }) {
	const [toasts, setToasts] = useState([]);
	const durationRef = useRef(durationMs);

	useEffect(() => {
		durationRef.current = durationMs;
	}, [durationMs]);

	const addToast = useCallback((message, type = "info") => {
		const id = ++_nextId;
		setToasts((prev) => [...prev, { id, message, type }]);
	}, []);

	const removeToast = useCallback((id) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	return (
		<ToastContext.Provider value={{ addToast, removeToast }}>
			{children}
			<div className="pointer-events-none fixed bottom-5 right-5 z-[9999] flex flex-col gap-2">
				{toasts.map((t) => (
					<div
						key={t.id}
						className="pointer-events-auto w-80 max-w-full">
						<ToastItem
							toast={t}
							onRemove={removeToast}
							durationMs={durationRef.current}
						/>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}

/**
 * Hook to trigger toasts from anywhere inside ToastProvider
 * @returns {{ toast: (message: string, type?: string) => void }}
 */
export function useToast() {
	const ctx = useContext(ToastContext);
	if (!ctx) {
		// Graceful fallback if used outside provider
		return { toast: () => {} };
	}
	return { toast: ctx.addToast };
}
