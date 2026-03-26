function formatFileSize(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const kb = bytes / 1024;
    if (kb < 1024) {
        return `${kb.toFixed(1)} KB`;
    }

    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
}

const PREVIEW_LIMIT = 120;

function CreatePlaygroundUploadPreview({
    files,
    isReading = false,
    detectedFileCount = 0,
}) {
    const previewFiles = files.slice(0, PREVIEW_LIMIT);
    const hiddenPreviewCount = files.length - previewFiles.length;

    if (isReading && !files.length) {
        return (
            <div className="rounded-2xl border border-dashed border-white/50 bg-[#141414] p-4 text-sm text-[#9fb1c8]">
                Reading selected files...
            </div>
        );
    }

    if (!files.length) {
        return (
            <div className="rounded-2xl border border-dashed border-white/50 bg-[#141414] p-4 text-sm text-[#9fb1c8]">
                No files selected yet. Choose one or more local files to preview.
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white bg-[#141414] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-[#9fb1c8]">
                Upload Preview ({files.length}{detectedFileCount > files.length ? `/${detectedFileCount}` : ""})
            </p>

            <div className="mt-3 grid gap-2">
                {previewFiles.map((file) => (
                    <article
                        key={file.id}
                        className="rounded-xl border border-white/20 bg-[#1a1a1a] px-3 py-2"
                    >
                        <p className="m-0 truncate text-sm font-semibold text-white" title={file.name}>
                            {file.name}
                        </p>
                        <p className="mt-1 mb-0 text-xs text-[#a8b8d0]">
                            {file.language} | {formatFileSize(file.size)}
                        </p>
                    </article>
                ))}

                {hiddenPreviewCount > 0 && (
                    <p className="m-0 rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-xs text-[#9fb1c8]">
                        Showing first {PREVIEW_LIMIT} files. {hiddenPreviewCount} more file(s) are included in upload.
                    </p>
                )}
            </div>
        </div>
    );
}

export default CreatePlaygroundUploadPreview;
