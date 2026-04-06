function DeletePlaygroundDialog({ playgroundName, isLoading = false, onConfirm, onDismiss }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
                <h2 className="text-base font-semibold text-white mb-2">Delete Playground?</h2>
                <p className="text-sm text-neutral-400 leading-relaxed">
                    You're about to delete <span className="font-medium text-neutral-200">{playgroundName}</span>. This cannot be undone.
                </p>
                <div className="mt-5 flex gap-2 justify-end">
                    <button
                        type="button"
                        onClick={onDismiss}
                        disabled={isLoading}
                        className="h-8 px-4 rounded-md border border-neutral-700 text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="h-8 px-4 rounded-md border border-red-500/50 bg-red-500/10 text-sm font-medium text-red-400 hover:bg-red-500/20 hover:border-red-500/70 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Deleting…" : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeletePlaygroundDialog;
