'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isInAppBrowser } from '@/_lib/utils/external-browser';

interface InAppBrowserContextType {
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

const InAppBrowserContext = createContext<InAppBrowserContextType | undefined>(undefined);

export function InAppBrowserProvider({ children }: { children: ReactNode }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Check on mount
        if (isInAppBrowser()) {
            setIsModalOpen(true);
        }
    }, []);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <InAppBrowserContext.Provider value={{ isModalOpen, openModal, closeModal }}>
            {children}
        </InAppBrowserContext.Provider>
    );
}

export function useInAppBrowser() {
    const context = useContext(InAppBrowserContext);
    if (context === undefined) {
        throw new Error('useInAppBrowser must be used within an InAppBrowserProvider');
    }
    return context;
}
