import { ChevronDown, Folder, Code2, FolderPlus } from "lucide-react";
import { cn } from "../../../lib/utils";

function isFolderNode(value) {
    return value !== null && typeof value === "object";
}

function FileTree({
    filetree,
    activeFile,
    expandedFolders,
    onToggleFolder,
    onSelectFile,
}) {
    const renderTree = (node, path = "", level = 0) => {
        return Object.entries(node).map(([key, value]) => {
            const currentPath = path ? `${path}/${key}` : key;
            const isFolder = isFolderNode(value);

            if (isFolder) {
                const isOpen = expandedFolders[currentPath];

                return (
                    <div key={currentPath}>
                        <div
                            onClick={() => onToggleFolder(currentPath)}
                            className="flex items-center gap-2 px-2 py-1 text-sm text-[#94a3b8] cursor-pointer hover:bg-[#1a1a1a]"
                            style={{ paddingLeft: `${level * 12 + 8}px` }}
                        >
                            <ChevronDown
                                size={14}
                                className={cn(
                                    "transition-transform",
                                    !isOpen && "-rotate-90",
                                )}
                            />

                            <Folder size={14} className="text-yellow-400" />
                            {key}
                        </div>

                        {isOpen && (
                            <div>
                                {renderTree(value, currentPath, level + 1)}
                            </div>
                        )}
                    </div>
                );
            }

            return (
                <div
                    key={currentPath}
                    onClick={() => onSelectFile(currentPath)}
                    className={cn(
                        "flex items-center gap-2 py-1 text-sm cursor-pointer transition",
                        activeFile === currentPath
                            ? "bg-[#1a1a1a] text-amber-400"
                            : "text-[#94a3b8] hover:bg-[#1a1a1a] hover:text-white",
                    )}
                    style={{ paddingLeft: `${level * 12 + 24}px` }}
                >
                    <Code2 size={14} className="text-[#f0db4f]" />
                    {key}
                </div>
            );
        });
    };

    return (
        <aside className="w-64 border-r border-white/10 bg-[#0b1219] flex flex-col">
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
                <span className="text-xs uppercase tracking-wide text-[#64748b] font-bold">
                    Explorer
                </span>
                <FolderPlus
                    size={16}
                    className="text-[#94a3b8] cursor-pointer mx-5"
                />
            </div>
            {/* Load files with folder if no parent folder its palyground name */}
            <nav className="flex-1 overflow-y-auto p-2">
                {renderTree(filetree)}
            </nav>
        </aside>
    );
}

export default FileTree;
