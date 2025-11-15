export const getCrosshairPlusCursor = (): string => {
  const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
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
  return `url('data:image/svg+xml;base64,${encoded}') 9 9, crosshair`;
};

export const getBucketFillCursor = (): string => {
  const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path d="M 7 10 L 5 19 C 5 19 5 20 6 20 L 18 20 C 19 20 19 19 19 19 L 17 10 Z"
                  fill="lightblue" stroke="black" stroke-width="1.5" />
            <path d="M 7.5 10 Q 12 5 16.5 10"
                  fill="none" stroke="black" stroke-width="1.5" stroke-linecap="round" />
            <ellipse cx="12" cy="22" rx="1.5" ry="1" fill="lightblue" stroke="black" stroke-width="0.5" />
        </svg>
    `;

  const encoded = btoa(svg);
  return `url('data:image/svg+xml;base64,${encoded}') 9 9, auto`;
};

export const getDefaultCursor = (): string => 'default';
export const getMoveCursor = (): string => 'move';
export const getGrabbingCursor = (): string => 'grabbing';
export const getCrosshairCursor = (): string => 'crosshair';
export const getPointerCursor = (): string => 'pointer';
