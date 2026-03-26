import { useEffect, useRef } from "react";

function CardOptionsMenu({ isOpen, onClose, onDelete, isLoading = false }) {
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={menuRef}
            className="absolute right-2 top-8 z-50 w-32 rounded-md border border-white/10 bg-[#111] shadow-lg overflow-hidden "
            >
            <button
                type="button"
                onClick={()=>{
                    onDelete();
                    onClose();
                }}
                disabled={isLoading}
                className="w-full px-3 py-2 text-left text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                {isLoading ? "Deleting..." : "Delete"}
            </button>
        </div>
    );
}

export default CardOptionsMenu;
