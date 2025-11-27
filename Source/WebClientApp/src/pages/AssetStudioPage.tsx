import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, CircularProgress } from '@mui/material';
import {
  AssetStudioLayout,
  StudioToolbar,
  VisualIdentityPanel,
  DataPanel,
  MetadataPanel,
} from '@/components/assets/studio';
import {
  useGetAssetQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
} from '@/services/assetsApi';
import { AssetKind, type AssetClassification, type MediaResource, type NamedSize, type StatBlockValue } from '@/types/domain';

interface AssetFormState {
  name: string;
  description: string;
  classification: AssetClassification;
  portrait: MediaResource | null;
  tokens: MediaResource[];
  tokenSize: NamedSize;
  statBlocks: Record<number, Record<string, StatBlockValue>>;
  isPublic: boolean;
  isPublished: boolean;
}

const defaultClassification: AssetClassification = {
  kind: AssetKind.Creature,
  category: '',
  type: '',
  subtype: null,
};

const defaultFormState: AssetFormState = {
  name: '',
  description: '',
  classification: defaultClassification,
  portrait: null,
  tokens: [],
  tokenSize: { width: 1, height: 1 },
  statBlocks: { 0: {} },
  isPublic: false,
  isPublished: false,
};

export const AssetStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';

  const { data: existingAsset, isLoading, error } = useGetAssetQuery(id!, { skip: isNew });
  const [createAsset, { isLoading: isCreating }] = useCreateAssetMutation();
  const [updateAsset, { isLoading: isUpdating }] = useUpdateAssetMutation();
  const [deleteAsset] = useDeleteAssetMutation();

  const [formState, setFormState] = useState<AssetFormState>(defaultFormState);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (existingAsset && !isNew) {
      setFormState({
        name: existingAsset.name,
        description: existingAsset.description,
        classification: existingAsset.classification,
        portrait: existingAsset.portrait || null,
        tokens: existingAsset.tokens || [],
        tokenSize: existingAsset.tokenSize,
        statBlocks: existingAsset.statBlocks || { 0: {} },
        isPublic: existingAsset.isPublic,
        isPublished: existingAsset.isPublished,
      });
      setIsDirty(false);
    }
  }, [existingAsset, isNew]);

  const updateField = useCallback(<K extends keyof AssetFormState>(
    field: K,
    value: AssetFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const handleBack = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard them?')) {
      return;
    }
    navigate('/assets');
  };

  const handleSave = async () => {
    try {
      if (isNew) {
        const createRequest = {
          kind: formState.classification.kind,
          category: formState.classification.category,
          type: formState.classification.type,
          name: formState.name,
          description: formState.description,
          tokenSize: formState.tokenSize,
          ...(formState.classification.subtype && { subtype: formState.classification.subtype }),
          ...(formState.portrait?.id && { portraitId: formState.portrait.id }),
          ...(formState.tokens[0]?.id && { tokenId: formState.tokens[0].id }),
        };
        const result = await createAsset(createRequest).unwrap();
        navigate(`/assets/${result.id}/edit`, { replace: true });
      } else {
        const updateRequest = {
          kind: formState.classification.kind,
          category: formState.classification.category,
          type: formState.classification.type,
          subtype: formState.classification.subtype,
          name: formState.name,
          description: formState.description,
          portraitId: formState.portrait?.id ?? null,
          tokenSize: formState.tokenSize,
          isPublic: formState.isPublic,
          isPublished: formState.isPublished,
        };
        await updateAsset({ id: id!, request: updateRequest }).unwrap();
      }
      setIsDirty(false);
    } catch (err) {
      console.error('Failed to save asset:', err);
    }
  };

  const handleDelete = async () => {
    if (!id || isNew) return;
    if (window.confirm(`Are you sure you want to delete "${formState.name}"?`)) {
      await deleteAsset(id);
      navigate('/assets');
    }
  };

  const handlePublish = async () => {
    updateField('isPublished', true);
    setIsDirty(true);
  };

  const handleUnpublish = async () => {
    updateField('isPublished', false);
    setIsDirty(true);
  };

  const handleSelectPortrait = () => {
    // TODO: Open Smart Resource Picker modal
    console.log('Open portrait picker');
  };

  const handleSelectToken = () => {
    // TODO: Open Smart Resource Picker modal
    console.log('Open token picker');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !isNew) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Failed to load asset. Please try again.</Alert>
      </Box>
    );
  }

  return (
    <AssetStudioLayout
      toolbar={
        <StudioToolbar
          title={formState.name || 'Untitled'}
          isNew={isNew}
          isDirty={isDirty}
          isPublished={formState.isPublished}
          isSaving={isCreating || isUpdating}
          onBack={handleBack}
          onSave={handleSave}
          onDelete={!isNew ? handleDelete : null}
          onPublish={!isNew && !formState.isPublished ? handlePublish : null}
          onUnpublish={!isNew && formState.isPublished ? handleUnpublish : null}
        />
      }
      visualPanel={
        <VisualIdentityPanel
          portrait={formState.portrait}
          tokens={formState.tokens}
          onPortraitChange={(p) => updateField('portrait', p)}
          onTokensChange={(t) => updateField('tokens', t)}
          onSelectPortrait={handleSelectPortrait}
          onSelectToken={handleSelectToken}
        />
      }
      dataPanel={
        <DataPanel
          statBlocks={formState.statBlocks}
          onChange={(s) => updateField('statBlocks', s)}
        />
      }
      metadataPanel={
        <MetadataPanel
          name={formState.name}
          description={formState.description}
          classification={formState.classification}
          tokenSize={formState.tokenSize}
          isPublic={formState.isPublic}
          isPublished={formState.isPublished}
          onNameChange={(n) => updateField('name', n)}
          onDescriptionChange={(d) => updateField('description', d)}
          onClassificationChange={(c) => updateField('classification', c)}
          onTokenSizeChange={(s) => updateField('tokenSize', s)}
          onIsPublicChange={(p) => updateField('isPublic', p)}
        />
      }
    />
  );
};

export default AssetStudioPage;
