function CreatePlaygroundCancelDialog({ onConfirm, onDismiss }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
                <h2 className="text-base font-semibold text-white mb-2">Leave Playground Setup?</h2>
                <p className="text-sm text-neutral-400 leading-relaxed">
                    Your current setup choices will be discarded.
                </p>
                <div className="mt-5 flex gap-2 justify-end">
                    <button
                        type="button"
                        onClick={onDismiss}
                        className="h-8 px-4 rounded-md border border-neutral-700 text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 transition-colors"
                    >
                        Stay
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="h-8 px-4 rounded-md border border-violet-500/50 bg-violet-500/10 text-sm font-medium text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/70 transition-colors"
                    >
                        Leave
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreatePlaygroundCancelDialog;
