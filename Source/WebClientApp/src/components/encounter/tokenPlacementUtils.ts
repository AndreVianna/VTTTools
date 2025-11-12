const LABEL_FONT_SIZE = 12;
const LABEL_FONT_FAMILY = 'Arial';

let measurementCanvas: HTMLCanvasElement | null = null;
let measurementCtx: CanvasRenderingContext2D | null = null;

const getMeasurementContext = (): CanvasRenderingContext2D | null => {
  if (!measurementCanvas) {
    measurementCanvas = document.createElement('canvas');
    measurementCtx = measurementCanvas.getContext('2d');
  }
  return measurementCtx;
};

const measureTextWidth = (
  text: string,
  fontSize: number = LABEL_FONT_SIZE,
  fontFamily: string = LABEL_FONT_FAMILY,
): number => {
  const ctx = getMeasurementContext();
  if (!ctx) {
    return text.length * fontSize * 0.6;
  }
  ctx.font = `${fontSize}px ${fontFamily}`;
  return ctx.measureText(text).width;
};

export const formatCreatureLabel = (
  name: string,
  maxWidth: number,
): {
  displayText: string;
  isTruncated: boolean;
  fullText: string;
  displayWidth: number;
  displayHeight: number;
  fullWidth: number;
} => {
  const measureTextHeight = (fontSize: number): number => {
    return fontSize * 1.2;
  };

  const fullWidth = measureTextWidth(name, LABEL_FONT_SIZE, LABEL_FONT_FAMILY);

  if (fullWidth <= maxWidth) {
    const displayHeight = measureTextHeight(LABEL_FONT_SIZE);
    return {
      displayText: name,
      isTruncated: false,
      fullText: name,
      displayWidth: fullWidth,
      displayHeight,
      fullWidth,
    };
  }

  const numberPattern = /^(.+?)\s+(#\d+)$/;
  const match = name.match(numberPattern);

  if (match) {
    const baseName = match[1];
    const numberSuffix = match[2];

    if (!baseName || !numberSuffix) {
      const ellipsis = '\u2026';
      let truncatedName = name;

      for (let i = name.length - 1; i > 0; i--) {
        const testText = name.substring(0, i) + ellipsis;
        const testWidth = measureTextWidth(testText, LABEL_FONT_SIZE, LABEL_FONT_FAMILY);

        if (testWidth <= maxWidth) {
          truncatedName = testText;
          break;
        }
      }

      const displayWidth = measureTextWidth(truncatedName, LABEL_FONT_SIZE, LABEL_FONT_FAMILY);
      const displayHeight = measureTextHeight(LABEL_FONT_SIZE);

      return {
        displayText: truncatedName,
        isTruncated: truncatedName !== name,
        fullText: name,
        displayWidth,
        displayHeight,
        fullWidth,
      };
    }

    const numberWidth = measureTextWidth(numberSuffix, LABEL_FONT_SIZE, LABEL_FONT_FAMILY);
    const ellipsis = '\u2026';
    const ellipsisWidth = measureTextWidth(ellipsis, LABEL_FONT_SIZE, LABEL_FONT_FAMILY);
    const spaceWidth = measureTextWidth(' ', LABEL_FONT_SIZE, LABEL_FONT_FAMILY);

    const availableForBaseName = maxWidth - numberWidth - ellipsisWidth - spaceWidth;

    let truncatedBaseName = baseName;
    for (let i = baseName.length - 1; i > 0; i--) {
      const testWidth = measureTextWidth(baseName.substring(0, i), LABEL_FONT_SIZE, LABEL_FONT_FAMILY);

      if (testWidth <= availableForBaseName) {
        truncatedBaseName = baseName.substring(0, i);
        break;
      }
    }

    const displayText = `${truncatedBaseName}${ellipsis} ${numberSuffix}`;
    const displayWidth = measureTextWidth(displayText, LABEL_FONT_SIZE, LABEL_FONT_FAMILY);
    const displayHeight = measureTextHeight(LABEL_FONT_SIZE);

    return {
      displayText,
      isTruncated: true,
      fullText: name,
      displayWidth,
      displayHeight,
      fullWidth,
    };
  }

  const ellipsis = '\u2026';
  let truncatedName = name;

  for (let i = name.length - 1; i > 0; i--) {
    const testText = name.substring(0, i) + ellipsis;
    const testWidth = measureTextWidth(testText, LABEL_FONT_SIZE, LABEL_FONT_FAMILY);

    if (testWidth <= maxWidth) {
      truncatedName = testText;
      break;
    }
  }

  const displayWidth = measureTextWidth(truncatedName, LABEL_FONT_SIZE, LABEL_FONT_FAMILY);
  const displayHeight = measureTextHeight(LABEL_FONT_SIZE);

  return {
    displayText: truncatedName,
    isTruncated: truncatedName !== name,
    fullText: name,
    displayWidth,
    displayHeight,
    fullWidth,
  };
};
