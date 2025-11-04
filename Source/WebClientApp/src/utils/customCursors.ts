export const getCrosshairPlusCursor = (): string => {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <line x1="12" y1="0" x2="12" y2="24" stroke="white" stroke-width="1.5" />
            <line x1="0" y1="12" x2="24" y2="12" stroke="white" stroke-width="1.5" />
            <line x1="12" y1="0" x2="12" y2="24" stroke="black" stroke-width="1" />
            <line x1="0" y1="12" x2="24" y2="12" stroke="black" stroke-width="1" />
            <circle cx="18" cy="18" r="5" fill="white" stroke="black" stroke-width="1" />
            <line x1="18" y1="15" x2="18" y2="21" stroke="black" stroke-width="1.5" />
            <line x1="15" y1="18" x2="21" y2="18" stroke="black" stroke-width="1.5" />
        </svg>
    `;

    const encoded = btoa(svg);
    return `url('data:image/svg+xml;base64,${encoded}') 12 12, crosshair`;
};

export const getDefaultCursor = (): string => 'default';
export const getMoveCursor = (): string => 'move';
export const getGrabbingCursor = (): string => 'grabbing';
export const getCrosshairCursor = (): string => 'crosshair';
export const getPointerCursor = (): string => 'pointer';
