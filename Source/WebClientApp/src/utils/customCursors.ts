export const getCrosshairPlusCursor = (): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
      <line x1="9" y1="0" x2="9" y2="18" stroke="black" stroke-width="3" />
      <line x1="0" y1="9" x2="18" y2="9" stroke="black" stroke-width="3" />
      <line x1="9" y1="0" x2="9" y2="18" stroke="white" stroke-width="1.5" />
      <line x1="0" y1="9" x2="18" y2="9" stroke="white" stroke-width="1.5" />
      <circle cx="14" cy="14" r="3.5" fill="blue" stroke="black" stroke-width="1" />
      <line x1="14" y1="12" x2="14" y2="16" stroke="white" stroke-width="1.2" />
      <line x1="12" y1="14" x2="16" y2="14" stroke="white" stroke-width="1.2" />
    </svg>
    `;

  const encoded = btoa(svg);
  return `url('data:image/svg+xml;base64,${encoded}') 9 9, crosshair`;
};

export const getCrosshairMinusCursor = (): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
      <line x1="9" y1="0" x2="9" y2="18" stroke="black" stroke-width="3" />
      <line x1="0" y1="9" x2="18" y2="9" stroke="black" stroke-width="3" />
      <line x1="9" y1="0" x2="9" y2="18" stroke="white" stroke-width="1.5" />
      <line x1="0" y1="9" x2="18" y2="9" stroke="white" stroke-width="1.5" />
      <circle cx="14" cy="14" r="3.5" fill="red" stroke="black" stroke-width="1" />
      <line x1="12" y1="14" x2="16" y2="14" stroke="black" stroke-width="1.2" />
    </svg>
    `;

  const encoded = btoa(svg);
  return `url('data:image/svg+xml;base64,${encoded}') 9 9, crosshair`;
};

export const getBucketPlusCursor = (): string => {
  const svg = `
    <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.25C12 1.83579 11.6642 1.5 11.25 1.5C10.8358 1.5 10.5 1.83579 10.5 2.25V3.49946C10.1929 3.60776 9.90465 3.78472 9.65903 4.03035L2.78035 10.909C1.90167 11.7877 1.90167 13.2123 2.78035 14.091L7.65903 18.9697C8.53771 19.8484 9.96233 19.8484 10.841 18.9697L17.7197 12.091C18.5984 11.2123 18.5984 9.78771 17.7197 8.90903L12.841 4.03035C12.5954 3.78473 12.3071 3.60777 12 3.49947V2.25ZM10.5 5.31067V6.75C10.5 7.16421 10.8358 7.5 11.25 7.5C11.6642 7.5 12 7.16421 12 6.75V5.31069L16.659 9.96969C16.9519 10.2626 16.9519 10.7375 16.659 11.0303L15.6894 12H3.81231C3.82154 11.9897 3.83111 11.9796 3.84101 11.9697L10.5 5.31067Z" fill="#ffffff"/>
      <path d="M19.5212 13.6022C19.1922 12.9853 18.3079 12.9853 17.9788 13.6022L15.9706 17.3677C14.8516 19.4659 16.372 22 18.75 22C21.128 22 22.6485 19.4659 21.5294 17.3677L19.5212 13.6022Z" fill="#ffffff"/>
      <circle cx="18" cy="18" r="3.5" fill="blue" stroke="black" stroke-width="1" />
      <line x1="18" y1="16" x2="18" y2="20" stroke="white" stroke-width="1.2" />
      <line x1="16" y1="18" x2="20" y2="18" stroke="white" stroke-width="1.2" />
    </svg>
    `;

  const encoded = btoa(svg);
  return `url('data:image/svg+xml;base64,${encoded}') 12 12, auto`;
};

export const getBucketMinusCursor = (): string => {
  const svg = `
    <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.25C12 1.83579 11.6642 1.5 11.25 1.5C10.8358 1.5 10.5 1.83579 10.5 2.25V3.49946C10.1929 3.60776 9.90465 3.78472 9.65903 4.03035L2.78035 10.909C1.90167 11.7877 1.90167 13.2123 2.78035 14.091L7.65903 18.9697C8.53771 19.8484 9.96233 19.8484 10.841 18.9697L17.7197 12.091C18.5984 11.2123 18.5984 9.78771 17.7197 8.90903L12.841 4.03035C12.5954 3.78473 12.3071 3.60777 12 3.49947V2.25ZM10.5 5.31067V6.75C10.5 7.16421 10.8358 7.5 11.25 7.5C11.6642 7.5 12 7.16421 12 6.75V5.31069L16.659 9.96969C16.9519 10.2626 16.9519 10.7375 16.659 11.0303L15.6894 12H3.81231C3.82154 11.9897 3.83111 11.9796 3.84101 11.9697L10.5 5.31067Z" fill="#ffffff"/>
      <path d="M19.5212 13.6022C19.1922 12.9853 18.3079 12.9853 17.9788 13.6022L15.9706 17.3677C14.8516 19.4659 16.372 22 18.75 22C21.128 22 22.6485 19.4659 21.5294 17.3677L19.5212 13.6022Z" fill="#ffffff"/>
      <circle cx="18" cy="18" r="3.5" fill="blue" stroke="black" stroke-width="1" />
      <line x1="18" y1="16" x2="18" y2="20" stroke="white" stroke-width="1.2" />
      <line x1="16" y1="18" x2="20" y2="18" stroke="white" stroke-width="1.2" />
    </svg>
    `;

  const encoded = btoa(svg);
  return `url('data:image/svg+xml;base64,${encoded}') 12 12, auto`;
};

export const getDefaultCursor = (): string => 'default';
export const getMoveCursor = (): string => 'move';
export const getGrabbingCursor = (): string => 'grabbing';
// export const getCrosshairPlusCursor = (): string => 'crosshair';
export const getPointerCursor = (): string => 'pointer';
