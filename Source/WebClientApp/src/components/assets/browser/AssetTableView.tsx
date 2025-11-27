import React, { useMemo } from 'react';
import { Box, Chip, useTheme } from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { Category as CategoryIcon } from '@mui/icons-material';
import type { Asset } from '@/types/domain';
import { getDefaultAssetImage, getResourceUrl } from '@/utils/assetHelpers';

export interface AssetTableViewProps {
  assets: Asset[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onRowClick: (asset: Asset) => void;
  onRowDoubleClick: (asset: Asset) => void;
  isLoading?: boolean;
}

export const AssetTableView: React.FC<AssetTableViewProps> = ({
  assets,
  selectedIds,
  onSelectionChange,
  onRowClick,
  onRowDoubleClick,
  isLoading = false,
}) => {
  const theme = useTheme();

  const columns: GridColDef<Asset>[] = useMemo(
    () => [
      {
        field: 'icon',
        headerName: '',
        width: 48,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => {
          const image = getDefaultAssetImage(params.row);
          return (
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
                  alt={params.row.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <CategoryIcon sx={{ fontSize: 18, color: theme.palette.text.disabled }} />
              )}
            </Box>
          );
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        flex: 1,
        minWidth: 150,
      },
      {
        field: 'classification',
        headerName: 'Classification',
        width: 200,
        valueGetter: (_, row) => {
          const { category, type } = row.classification;
          return type ? `${category} / ${type}` : category;
        },
      },
      {
        field: 'stats',
        headerName: 'Stats',
        width: 120,
        sortable: false,
        renderCell: (params) => {
          const statBlock = params.row.statBlocks[0];
          if (!statBlock) return null;

          const hp = statBlock['HP']?.value;
          const ac = statBlock['AC']?.value;
          const cr = statBlock['CR']?.value;

          if (cr) {
            return <Chip label={`CR ${cr}`} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />;
          }
          if (hp || ac) {
            return (
              <Box sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                {hp && `HP:${hp}`}
                {hp && ac && ' | '}
                {ac && `AC:${ac}`}
              </Box>
            );
          }
          return null;
        },
      },
      {
        field: 'tokens',
        headerName: 'Tokens',
        width: 70,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        valueGetter: (_, row) => row.tokens.length,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 100,
        renderCell: (params) => {
          const { isPublished, isPublic } = params.row;
          if (isPublished) {
            return (
              <Chip
                label={isPublic ? 'Public' : 'Published'}
                size="small"
                color={isPublic ? 'success' : 'primary'}
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            );
          }
          return (
            <Chip
              label="Draft"
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          );
        },
      },
    ],
    [theme]
  );

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    onSelectionChange(Array.from(newSelection.ids) as string[]);
  };

  return (
    <Box sx={{ flexGrow: 1, width: '100%' }}>
      <DataGrid
        rows={assets}
        columns={columns}
        loading={isLoading}
        checkboxSelection
        disableRowSelectionOnClick
        rowSelectionModel={{ type: 'include', ids: new Set(selectedIds) }}
        onRowSelectionModelChange={handleSelectionChange}
        onRowClick={(params) => onRowClick(params.row)}
        onRowDoubleClick={(params) => onRowDoubleClick(params.row)}
        rowHeight={40}
        columnHeaderHeight={40}
        pageSizeOptions={[25, 50, 100]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 50 },
          },
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${theme.palette.divider}`,
            py: 0.5,
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.background.default,
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '&.Mui-selected': {
              backgroundColor: theme.palette.action.selected,
              '&:hover': {
                backgroundColor: theme.palette.action.selected,
              },
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${theme.palette.divider}`,
          },
        }}
      />
    </Box>
  );
};

export default AssetTableView;
