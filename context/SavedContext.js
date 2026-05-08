'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const SavedContext = createContext();

export function SavedProvider({ children }) {
    const [savedIds, setSavedIds] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem('bharat_saved');
        if (stored) setSavedIds(JSON.parse(stored));
    }, []);

    const toggleSave = (productId) => {
        setSavedIds(prev => {
            const newSet = prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId];
            localStorage.setItem('bharat_saved', JSON.stringify(newSet));
            return newSet;
        });
    };

    const isSaved = (productId) => savedIds.includes(productId);

    return (
        <SavedContext.Provider value={{ savedIds, toggleSave, isSaved }}>
            {children}
        </SavedContext.Provider>
    );
}

export function useSaved() {
    return useContext(SavedContext);
}