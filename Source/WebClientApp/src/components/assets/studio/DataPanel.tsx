import React from 'react';
import { Box, Tab, Tabs, Typography, useTheme } from '@mui/material';
import { PropertyGrid, PropertyGridSection, PropertyGridItem } from './PropertyGrid';
import { StatValueType, type StatBlockValue } from '@/types/domain';

export interface DataPanelProps {
  statBlocks: Record<number, Record<string, StatBlockValue>>;
  onChange: (statBlocks: Record<number, Record<string, StatBlockValue>>) => void;
}

function statBlockToSections(statBlock: Record<string, StatBlockValue>): PropertyGridSection[] {
  const coreStats = ['HP', 'AC', 'CR', 'Speed', 'Initiative'];
  const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

  const coreProperties = coreStats
    .filter((key) => key in statBlock)
    .map((key) => ({
      key,
      value: statBlock[key]?.value?.toString() || '',
      type: 'number' as const,
    }));

  const abilityProperties = abilities
    .filter((key) => key in statBlock)
    .map((key) => ({
      key,
      value: statBlock[key]?.value?.toString() || '',
      type: 'number' as const,
    }));

  const otherKeys = Object.keys(statBlock).filter(
    (key) => !coreStats.includes(key) && !abilities.includes(key)
  );
  const otherProperties: PropertyGridItem[] = otherKeys.map((key) => ({
    key,
    value: statBlock[key]?.value?.toString() || '',
    type: statBlock[key]?.type === StatValueType.Number ? 'number' as const : 'text' as const,
  }));

  const sections: PropertyGridSection[] = [];
  if (coreProperties.length > 0) {
    sections.push({ title: 'Core Stats', properties: coreProperties });
  }
  if (abilityProperties.length > 0) {
    sections.push({ title: 'Ability Scores', properties: abilityProperties });
  }
  if (otherProperties.length > 0) {
    sections.push({ title: 'Other', properties: otherProperties });
  }
  if (sections.length === 0) {
    sections.push({ title: 'Stats', properties: [] });
  }

  return sections;
}

function sectionsToStatBlock(sections: PropertyGridSection[]): Record<string, StatBlockValue> {
  const result: Record<string, StatBlockValue> = {};
  for (const section of sections) {
    for (const prop of section.properties) {
      const numValue = parseFloat(prop.value);
      if (!isNaN(numValue) && prop.type === 'number') {
        result[prop.key] = { key: prop.key, value: prop.value, type: StatValueType.Number };
      } else {
        result[prop.key] = { key: prop.key, value: prop.value, type: StatValueType.Text };
      }
    }
  }
  return result;
}

export const DataPanel: React.FC<DataPanelProps> = ({ statBlocks, onChange }) => {
  const theme = useTheme();
  const levels = Object.keys(statBlocks).map(Number).sort((a, b) => a - b);
  const [activeLevel, setActiveLevel] = React.useState(levels[0] || 0);

  const currentStatBlock = statBlocks[activeLevel] || {};
  const sections = statBlockToSections(currentStatBlock);

  const handleSectionsChange = (newSections: PropertyGridSection[]) => {
    const newStatBlock = sectionsToStatBlock(newSections);
    onChange({
      ...statBlocks,
      [activeLevel]: newStatBlock,
    });
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          mb: 2,
          color: theme.palette.text.secondary,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        Stat Block
      </Typography>

      {levels.length > 1 && (
        <Tabs
          value={activeLevel}
          onChange={(_, v) => setActiveLevel(v)}
          sx={{ mb: 2 }}
        >
          {levels.map((level) => (
            <Tab key={level} label={`Level ${level}`} value={level} />
          ))}
        </Tabs>
      )}

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <PropertyGrid
          sections={sections}
          onChange={handleSectionsChange}
          allowAddProperty
          allowRemoveProperty
        />
      </Box>
    </Box>
  );
};

export default DataPanel;
