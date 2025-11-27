import React from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import type { Asset } from '../../../types/domain';
import { getResourceUrl } from '../../../utils/assetHelpers';
import { TokenCarousel } from './TokenCarousel';

export interface AssetInspectorPanelProps {
  asset: Asset;
  onEdit: () => void;
  onDelete: () => void;
}

export const AssetInspectorPanel: React.FC<AssetInspectorPanelProps> = ({
  asset,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();

  const portraitUrl = asset.portrait ? getResourceUrl(asset.portrait.id) : null;

  const statBlock = asset.statBlocks[0];
  const stats = statBlock
    ? Object.entries(statBlock)
        .filter(([_, v]) => v.value !== null)
        .slice(0, 6)
    : [];

  const classificationPath = [
    asset.classification.kind,
    asset.classification.category,
    asset.classification.type,
    asset.classification.subtype,
  ]
    .filter(Boolean)
    .join(' / ');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          width: '100%',
          aspectRatio: '1',
          backgroundColor: theme.palette.action.hover,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {portraitUrl ? (
          <Box
            component="img"
            src={portraitUrl}
            alt={asset.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <CategoryIcon
            sx={{
              fontSize: 80,
              color: theme.palette.text.disabled,
            }}
          />
        )}
      </Box>

      <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          {asset.name}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            display: 'block',
            mb: 2,
          }}
        >
          {classificationPath}
        </Typography>

        {asset.tokens.length > 0 && (
          <>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1,
                color: theme.palette.text.secondary,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Tokens ({asset.tokens.length})
            </Typography>
            <TokenCarousel tokens={asset.tokens} size="small" showNavigation={false} />
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {stats.length > 0 && (
          <>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1,
                color: theme.palette.text.secondary,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Stats
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1,
                mb: 2,
              }}
            >
              {stats.map(([key, value]) => (
                <Box
                  key={key}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 1,
                    py: 0.5,
                    backgroundColor: theme.palette.action.hover,
                    borderRadius: 0.5,
                  }}
                >
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {key}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {value.value}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {asset.description && asset.description.length < 200 && (
          <>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1,
                color: theme.palette.text.secondary,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Description
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                mb: 2,
                fontSize: '0.8rem',
              }}
            >
              {asset.description}
            </Typography>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip
            label={asset.isPublished ? 'Published' : 'Draft'}
            size="small"
            color={asset.isPublished ? 'success' : 'default'}
            variant={asset.isPublished ? 'filled' : 'outlined'}
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
          <Chip
            label={asset.isPublic ? 'Public' : 'Private'}
            size="small"
            color={asset.isPublic ? 'info' : 'default'}
            variant={asset.isPublic ? 'filled' : 'outlined'}
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
          <Chip
            label={`${asset.tokenSize.width}x${asset.tokenSize.height}`}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          p: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          size="small"
          startIcon={<EditIcon />}
          onClick={onEdit}
          sx={{ flexGrow: 1 }}
        >
          Edit Asset
        </Button>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default AssetInspectorPanel;
