import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CampaignDetailPage, type Campaign, type Adventure } from '@vtttools/web-components';
import { libraryService, type LibraryContentResponse } from '@services/libraryService';

const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || '';

function mapToCampaign(response: LibraryContentResponse): Campaign {
  return {
    id: response.id,
    ownerId: response.ownerId,
    name: response.name,
    description: response.description,
    isPublished: response.isPublished,
    isPublic: response.isPublic,
    background: null,
    adventures: [],
  };
}

function mapToAdventure(response: LibraryContentResponse): Adventure {
  return {
    id: response.id,
    type: 0,
    ownerId: response.ownerId,
    name: response.name,
    description: response.description,
    isPublished: response.isPublished,
    background: null,
    style: null,
    isOneShot: false,
  };
}

export function CampaignEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);
  const [isLoadingAdventures, setIsLoadingAdventures] = useState(false);
  const [campaignError, setCampaignError] = useState<unknown>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCampaign = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoadingCampaign(true);
      setCampaignError(null);
      const data = await libraryService.getCampaignById(id);
      setCampaign(mapToCampaign(data));
    } catch (err) {
      setCampaignError(err);
    } finally {
      setIsLoadingCampaign(false);
    }
  }, [id]);

  const loadAdventures = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoadingAdventures(true);
      const data = await libraryService.getAdventuresByCampaignId(id);
      setAdventures(data.map(mapToAdventure));
    } catch (err) {
      console.error('Failed to load adventures:', err);
    } finally {
      setIsLoadingAdventures(false);
    }
  }, [id]);

  useEffect(() => {
    loadCampaign();
    loadAdventures();
  }, [loadCampaign, loadAdventures]);

  const handleBack = useCallback(() => {
    navigate('/admin/library');
  }, [navigate]);

  const handleUpdateCampaign = useCallback(
    async (request: { name?: string; description?: string; isPublished?: boolean; backgroundId?: string }) => {
      if (!id) return;

      const updateRequest: { name?: string; description?: string; isPublished?: boolean } = {};
      if (request.name !== undefined) updateRequest.name = request.name;
      if (request.description !== undefined) updateRequest.description = request.description;
      if (request.isPublished !== undefined) updateRequest.isPublished = request.isPublished;

      const updated = await libraryService.updateCampaign(id, updateRequest);
      setCampaign(mapToCampaign(updated));
    },
    [id]
  );

  const handleUploadFile = useCallback(
    async (_file: File, _type: string, _resource: string, _entityId: string): Promise<{ id: string }> => {
      setIsUploading(true);
      try {
        console.warn('File upload not yet implemented in Admin');
        return { id: '' };
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const handleCreateAdventure = useCallback(
    async (request: { name: string; description: string; style: number }): Promise<{ id: string }> => {
      if (!id) throw new Error('Campaign ID is required');

      const created = await libraryService.createAdventureForCampaign(id, {
        name: request.name,
        description: request.description,
      });
      setAdventures((prev) => [...prev, mapToAdventure(created)]);
      return { id: created.id };
    },
    [id]
  );

  const handleCloneAdventure = useCallback(
    async (adventureId: string): Promise<void> => {
      if (!id) return;

      const cloned = await libraryService.cloneAdventureInCampaign(id, adventureId);
      setAdventures((prev) => [...prev, mapToAdventure(cloned)]);
    },
    [id]
  );

  const handleRemoveAdventure = useCallback(
    async (adventureId: string): Promise<void> => {
      if (!id) return;

      setIsDeleting(true);
      try {
        await libraryService.removeAdventureFromCampaign(id, adventureId);
        setAdventures((prev) => prev.filter((a) => a.id !== adventureId));
      } finally {
        setIsDeleting(false);
      }
    },
    [id]
  );

  const handleOpenAdventure = useCallback(
    (adventureId: string) => {
      navigate(`/admin/library/adventures/${adventureId}`);
    },
    [navigate]
  );

  return (
    <CampaignDetailPage
      campaignId={id || ''}
      campaign={campaign}
      adventures={adventures}
      isLoadingCampaign={isLoadingCampaign}
      isLoadingAdventures={isLoadingAdventures}
      campaignError={campaignError}
      isUploading={isUploading}
      isDeleting={isDeleting}
      mediaBaseUrl={MEDIA_BASE_URL}
      onBack={handleBack}
      onUpdateCampaign={handleUpdateCampaign}
      onUploadFile={handleUploadFile}
      onCreateAdventure={handleCreateAdventure}
      onCloneAdventure={handleCloneAdventure}
      onRemoveAdventure={handleRemoveAdventure}
      onOpenAdventure={handleOpenAdventure}
    />
  );
}
