import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const OFFSET_Y = 8;

function getMenuItems(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll('[role="menuitem"]:not([disabled])'));
}

function focusItem(items, index) {
  if (!items.length) return;
  const normalized = ((index % items.length) + items.length) % items.length;
  items[normalized].focus();
}

export default function DropdownPortal({ anchorRef, isOpen, onClose, children }) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!isOpen) return undefined;

    const updatePosition = () => {
      const anchor = anchorRef?.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      setPosition({
        top: rect.bottom + OFFSET_Y,
        left: rect.right,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorRef, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleOutsideClick = (event) => {
      const target = event.target;
      const anchor = anchorRef?.current;
      const menu = menuRef.current;

      if (menu?.contains(target)) return;
      if (anchor?.contains(target)) return;
      onClose();
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [anchorRef, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const raf = window.requestAnimationFrame(() => {
      const items = getMenuItems(menuRef.current);
      if (items.length) items[0].focus();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const onMenuKeyDown = (event) => {
    const items = getMenuItems(menuRef.current);
    if (!items.length) return;

    const currentIndex = items.findIndex((item) => item === document.activeElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusItem(items, currentIndex + 1);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusItem(items, currentIndex - 1);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusItem(items, 0);
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusItem(items, items.length - 1);
    }

    if (event.key === 'Tab') {
      onClose();
    }
  };

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-orientation="vertical"
      className="fixed z-[9999] w-44 rounded-md border border-white/15 bg-card opacity-100 p-1 shadow-[0_14px_36px_rgba(0,0,0,0.55)] origin-top-right animate-scale-in"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-100%)',
      }}
      onKeyDown={onMenuKeyDown}
    >
      {children}
    </div>,
    document.body
  );
}
