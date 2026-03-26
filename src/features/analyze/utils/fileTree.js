function isFolderNode(value) {
    return value !== null && typeof value === "object";
}

export function getNodeByPath(tree, path) {
    if (!path) {
        return undefined;
    }

    return path.split("/").reduce((current, part) => {
        if (!isFolderNode(current) || !(part in current)) {
            return undefined;
        }

        return current[part];
    }, tree);
}

export function updateFileNode(tree, path, content) {
    const parts = path.split("/");
    const nextTree = { ...tree };
    let currentOld = tree;
    let currentNew = nextTree;

    for (let i = 0; i < parts.length - 1; i += 1) {
        const part = parts[i];

        if (!isFolderNode(currentOld) || !isFolderNode(currentOld[part])) {
            return tree;
        }

        currentNew[part] = { ...currentOld[part] };
        currentOld = currentOld[part];
        currentNew = currentNew[part];
    }

    const leaf = parts[parts.length - 1];
    if (!isFolderNode(currentOld) || typeof currentOld[leaf] !== "string") {
        return tree;
    }

    currentNew[leaf] = content;
    return nextTree;
}