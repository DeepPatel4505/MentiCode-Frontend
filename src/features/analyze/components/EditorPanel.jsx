import { Editor } from "@monaco-editor/react";

export const EditorPanel = ({
    editorKey,
    value,
    onChange,
    beforeMount,
    onMount,
    language = "javascript",
}) => {
    return (
        <Editor
            key={editorKey}
            height="100%"
            language={language}
            theme="vs-dark"
            value={value}
            onChange={onChange}
            beforeMount={beforeMount}
            onMount={onMount}
            options={{
                fontSize: 13,
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                minimap: { enabled: false },
                smoothScrolling: true,
                scrollBeyondLastLine: false,
                wordWrap: "on",
                padding: { top: 16 },
                showUnused: false,
                renderLineHighlight: "line",
                lineNumbersMinChars: 3,
            }}
        />
    );
};
