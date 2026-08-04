import { useState, useCallback } from 'react';

function toKeyArray(key) {
    if (Array.isArray(key)) return key;
    return key ? [key] : [];
}

// Tracks every eventKey that has ever been opened so Accordion.Body content
// can be rendered lazily (and stay mounted once first opened).
export function useLazyAccordion(defaultActiveKey = []) {
    const initialKeys = toKeyArray(defaultActiveKey);

    const [activeKey, setActiveKey] = useState(defaultActiveKey);
    const [openedKeys, setOpenedKeys] = useState(new Set(initialKeys));

    const onSelect = useCallback((key) => {
        setActiveKey(key);
        const keys = toKeyArray(key);
        setOpenedKeys((prev) => {
            if (keys.every((k) => prev.has(k))) return prev;
            const next = new Set(prev);
            keys.forEach((k) => next.add(k));
            return next;
        });
    }, []);

    const isOpened = useCallback((key) => openedKeys.has(key), [openedKeys]);

    return { activeKey, onSelect, isOpened };
}
