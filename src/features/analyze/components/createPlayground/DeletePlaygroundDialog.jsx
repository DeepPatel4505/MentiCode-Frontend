function DeletePlaygroundDialog({
    playgroundName,
    isLoading = false,
    onConfirm,
    onDismiss,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-sm rounded-3xl border-2 border-white bg-[#141414] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
                <h2 className="m-0 text-lg font-heading font-bold text-white">
                    Delete Playground?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#a8b8d0]">
                    You're about to delete <span className="font-semibold text-white">{playgroundName}</span>. This action cannot be undone.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={onDismiss}
                        disabled={isLoading}
                        className="h-11 rounded-full border-2 border-white bg-transparent px-4 text-sm font-semibold text-white transition-all duration-200 hover:border-accent-amber hover:text-accent-amber disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="h-11 rounded-full border-2 border-red-500 bg-red-500 px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-red-600 hover:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeletePlaygroundDialog;
