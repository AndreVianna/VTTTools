import { createContext, useContext, useMemo, type ReactNode } from 'react';

export interface LibraryContextValue {
    masterUserId: string | null;
    isAdminMode: boolean;
    currentUserId: string;
    canEdit: (ownerId: string) => boolean;
    canDelete: (ownerId: string) => boolean;
    canModerate: (ownerId: string) => boolean;
    canTransferOwnership: (ownerId: string) => boolean;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export interface LibraryProviderProps {
    children: ReactNode;
    masterUserId: string | null;
    currentUserId: string;
    isAdminMode?: boolean;
}

export const LibraryProvider = ({
    children,
    masterUserId,
    currentUserId,
    isAdminMode = false,
}: LibraryProviderProps) => {
    const value = useMemo<LibraryContextValue>(() => {
        const isMasterContent = (ownerId: string) => masterUserId !== null && ownerId === masterUserId;
        const isOwnContent = (ownerId: string) => ownerId === currentUserId;

        return {
            masterUserId,
            isAdminMode,
            currentUserId,
            canEdit: (ownerId: string) => {
                if (isAdminMode) {
                    return isMasterContent(ownerId);
                }
                return isOwnContent(ownerId);
            },
            canDelete: (ownerId: string) => {
                if (isAdminMode) {
                    return isMasterContent(ownerId);
                }
                return isOwnContent(ownerId);
            },
            canModerate: (_ownerId: string) => {
                return isAdminMode;
            },
            canTransferOwnership: (_ownerId: string) => {
                return isAdminMode;
            },
        };
    }, [masterUserId, currentUserId, isAdminMode]);

    return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLibrary = (): LibraryContextValue => {
    const context = useContext(LibraryContext);
    if (!context) {
        throw new Error('useLibrary must be used within a LibraryProvider');
    }
    return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLibraryOptional = (): LibraryContextValue | null => {
    return useContext(LibraryContext);
};
