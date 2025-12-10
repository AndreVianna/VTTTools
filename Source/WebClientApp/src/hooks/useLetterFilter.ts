import { useMemo } from 'react';

export const ALPHABET_LETTERS = ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export function getFirstLetter(name: string): string {
  const firstChar = name.charAt(0).toUpperCase();
  if (firstChar >= '0' && firstChar <= '9') {
    return '#';
  }
  if (firstChar >= 'A' && firstChar <= 'Z') {
    return firstChar;
  }
  return '#';
}

export interface UseLetterFilterOptions<T> {
  items: T[] | undefined;
  getName: (item: T) => string;
}

export interface UseLetterFilterReturn {
  availableLetters: Set<string>;
  filterByLetter: <T>(items: T[], letter: string | null, getName: (item: T) => string) => T[];
}

export function useLetterFilter<T>({ items, getName }: UseLetterFilterOptions<T>): UseLetterFilterReturn {
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    if (items) {
      items.forEach((item) => {
        letters.add(getFirstLetter(getName(item)));
      });
    }
    return letters;
  }, [items, getName]);

  const filterByLetter = <U>(itemsToFilter: U[], letter: string | null, getItemName: (item: U) => string): U[] => {
    if (!letter) return itemsToFilter;
    return itemsToFilter.filter((item) => getFirstLetter(getItemName(item)) === letter);
  };

  return {
    availableLetters,
    filterByLetter,
  };
}
