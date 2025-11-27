import React from 'react';
import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { Category as CategoryIcon } from '@mui/icons-material';
import type { Asset } from '@/types/domain';
import type { QuickSummonResult } from './types';
import { getDefaultAssetImage, getResourceUrl } from '@/utils/assetHelpers';

export interface QuickSummonResultsTableProps {
  results: QuickSummonResult[];
  selectedAsset: Asset | null;
  highlightedIndex: number;
  onSelect: (asset: Asset) => void;
  onHighlight: (index: number) => void;
  onDoubleClick: (asset: Asset) => void;
  tableRef?: React.RefObject<HTMLDivElement | null>;
}

export const QuickSummonResultsTable: React.FC<QuickSummonResultsTableProps> = ({
  results,
  selectedAsset,
  highlightedIndex,
  onSelect,
  onHighlight,
  onDoubleClick,
  tableRef,
}) => {
  const theme = useTheme();

  const handleRowClick = (result: QuickSummonResult, index: number) => {
    onHighlight(index);
    onSelect(result.asset);
  };

  if (results.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: theme.palette.text.secondary,
        }}
      >
        <Typography variant="body2">No assets found</Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      ref={tableRef}
      sx={{
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: 8,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: theme.palette.action.hover,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.action.disabled,
          borderRadius: 4,
        },
      }}
    >
      <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                width: 48,
                p: 0.5,
                backgroundColor: theme.palette.background.paper,
                borderBottom: `2px solid ${theme.palette.divider}`,
              }}
            />
            <TableCell
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                backgroundColor: theme.palette.background.paper,
                borderBottom: `2px solid ${theme.palette.divider}`,
              }}
            >
              Name
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                width: '30%',
                backgroundColor: theme.palette.background.paper,
                borderBottom: `2px solid ${theme.palette.divider}`,
              }}
            >
              Type
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                width: 100,
                backgroundColor: theme.palette.background.paper,
                borderBottom: `2px solid ${theme.palette.divider}`,
              }}
            >
              Stats
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result, index) => {
            const isSelected = selectedAsset?.id === result.asset.id;
            const isHighlighted = index === highlightedIndex;
            const image = getDefaultAssetImage(result.asset);

            return (
              <TableRow
                key={result.asset.id}
                data-index={index}
                onClick={() => handleRowClick(result, index)}
                onDoubleClick={() => onDoubleClick(result.asset)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: isHighlighted
                    ? theme.palette.action.selected
                    : isSelected
                      ? theme.palette.action.hover
                      : 'transparent',
                  '&:hover': {
                    backgroundColor: isHighlighted
                      ? theme.palette.action.selected
                      : theme.palette.action.hover,
                  },
                  transition: 'background-color 0.1s ease',
                }}
              >
                <TableCell sx={{ p: 0.5, width: 48 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 0.5,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.palette.action.hover,
                    }}
                  >
                    {image ? (
                      <Box
                        component="img"
                        src={getResourceUrl(image.id)}
                        alt={result.asset.name}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <CategoryIcon sx={{ fontSize: 18, color: theme.palette.text.disabled }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 0.75, overflow: 'hidden' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: '0.875rem',
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {result.displayName}
                  </Typography>
                  {result.asset.classification.subtype && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.7rem',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ({result.asset.classification.subtype})
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ py: 0.75, width: '30%', overflow: 'hidden' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                    }}
                  >
                    {result.typeInfo}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 0.75, width: 100 }}>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'nowrap' }}>
                    {result.stats.cr && (
                      <Chip
                        label={`CR ${result.stats.cr}`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          backgroundColor: theme.palette.warning.dark,
                          color: theme.palette.warning.contrastText,
                        }}
                      />
                    )}
                    {result.stats.ac && (
                      <Chip
                        label={`AC ${result.stats.ac}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                        }}
                      />
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default QuickSummonResultsTable;
