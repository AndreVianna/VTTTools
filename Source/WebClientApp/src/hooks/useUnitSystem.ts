import { useCallback, useState } from 'react';
import { UnitSystem } from '@/types/units';

const STORAGE_KEY = 'vtttools.unitSystem';

export function useUnitSystem(): [UnitSystem, (system: UnitSystem) => void] {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      if (parsed === UnitSystem.Imperial || parsed === UnitSystem.Metric) {
        return parsed;
      }
    }
    return UnitSystem.Imperial;
  });

  const setUnitSystem = useCallback((system: UnitSystem) => {
    setUnitSystemState(system);
    localStorage.setItem(STORAGE_KEY, system.toString());
  }, []);

  return [unitSystem, setUnitSystem];
}
