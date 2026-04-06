import { ChevronDown, Folder, Code2 } from "lucide-react";
import { cn } from "../../../lib/utils";

function isFolderNode(value) {
    return value !== null && typeof value === "object";
}

function sortTreeEntries(node) {
    return Object.entries(node).sort(([leftName, leftValue], [rightName, rightValue]) => {
        const leftIsFolder  = isFolderNode(leftValue)  ? 0 : 1;
        const rightIsFolder = isFolderNode(rightValue) ? 0 : 1;
        if (leftIsFolder !== rightIsFolder) return leftIsFolder - rightIsFolder;
        return leftName.localeCompare(rightName, undefined, { sensitivity: "base", numeric: true });
    });
}

function FileTree({ filetree, activeFile, expandedFolders, onToggleFolder, onSelectFile }) {
    const renderTree = (node, path = "", level = 0) => {
        return sortTreeEntries(node).map(([key, value]) => {
            const currentPath = path ? `${path}/${key}` : key;
            const isFolder = isFolderNode(value);

            if (isFolder) {
                const isOpen = expandedFolders[currentPath];
                return (
                    <div key={currentPath}>
                        <div
                            onClick={() => onToggleFolder(currentPath)}
                            className="flex items-center gap-1.5 py-1 text-xs text-neutral-500 cursor-pointer hover:text-neutral-300 hover:bg-white/[0.03] transition-colors"
                            style={{ paddingLeft: `${level * 12 + 8}px` }}
                        >
                            <ChevronDown
                                size={12}
                                className={cn("transition-transform shrink-0", !isOpen && "-rotate-90")}
                            />
                            <Folder size={12} className="text-amber-500/70 shrink-0" />
                            <span className="truncate">{key}</span>
                        </div>
                        {isOpen && <div>{renderTree(value, currentPath, level + 1)}</div>}
                    </div>
                );
            }

            return (
                <div
                    key={currentPath}
                    onClick={() => onSelectFile(currentPath)}
                    className={cn(
                        "flex items-center gap-1.5 py-1 text-xs cursor-pointer transition-colors",
                        activeFile === currentPath
                            ? "bg-violet-500/10 text-violet-300"
                            : "text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-300"
                    )}
                    style={{ paddingLeft: `${level * 12 + 22}px` }}
                >
                    <Code2 size={12} className="shrink-0 text-neutral-600" />
                    <span className="truncate">{key}</span>
                </div>
            );
        });
    };

    return (
        <div className="h-full flex flex-col bg-[hsl(240_8%_6%)]">
            <div className="px-3 py-2 border-b border-white/[0.06] shrink-0">
                <span className="text-[10px] uppercase tracking-[0.1em] text-neutral-600 font-semibold">Explorer</span>
            </div>
            <nav className="flex-1 overflow-y-auto py-1">
                {renderTree(filetree)}
            </nav>
        </div>
    );
}

export default FileTree;
