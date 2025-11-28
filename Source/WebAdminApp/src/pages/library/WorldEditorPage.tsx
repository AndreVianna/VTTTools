import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WorldDetailPage, type World, type Campaign } from '@vtttools/web-components';
import { libraryService, type LibraryContentResponse } from '@services/libraryService';

const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || '';

function mapToWorld(response: LibraryContentResponse): World {
  return {
    id: response.id,
    ownerId: response.ownerId,
    name: response.name,
    description: response.description,
    isPublished: response.isPublished,
    isPublic: response.isPublic,
    background: null,
    campaigns: [],
  };
}

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

export function WorldEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [world, setWorld] = useState<World | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingWorld, setIsLoadingWorld] = useState(true);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [worldError, setWorldError] = useState<unknown>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadWorld = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoadingWorld(true);
      setWorldError(null);
      const data = await libraryService.getWorldById(id);
      setWorld(mapToWorld(data));
    } catch (err) {
      setWorldError(err);
    } finally {
      setIsLoadingWorld(false);
    }
  }, [id]);

  const loadCampaigns = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoadingCampaigns(true);
      const data = await libraryService.getCampaignsByWorldId(id);
      setCampaigns(data.map(mapToCampaign));
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setIsLoadingCampaigns(false);
    }
  }, [id]);

  useEffect(() => {
    loadWorld();
    loadCampaigns();
  }, [loadWorld, loadCampaigns]);

  const handleBack = useCallback(() => {
    navigate('/admin/library');
  }, [navigate]);

  const handleUpdateWorld = useCallback(
    async (request: { name?: string; description?: string; isPublished?: boolean; backgroundId?: string }) => {
      if (!id) return;

      const updated = await libraryService.updateWorld(id, {
        name: request.name,
        description: request.description,
        isPublished: request.isPublished,
      });
      setWorld(mapToWorld(updated));
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

  const handleCreateCampaign = useCallback(
    async (request: { name: string; description: string }): Promise<{ id: string }> => {
      if (!id) throw new Error('World ID is required');

      const created = await libraryService.createCampaignForWorld(id, request);
      setCampaigns((prev) => [...prev, mapToCampaign(created)]);
      return { id: created.id };
    },
    [id]
  );

  const handleCloneCampaign = useCallback(
    async (campaignId: string): Promise<void> => {
      if (!id) return;

      const cloned = await libraryService.cloneCampaignInWorld(id, campaignId);
      setCampaigns((prev) => [...prev, mapToCampaign(cloned)]);
    },
    [id]
  );

  const handleRemoveCampaign = useCallback(
    async (campaignId: string): Promise<void> => {
      if (!id) return;

      setIsDeleting(true);
      try {
        await libraryService.removeCampaignFromWorld(id, campaignId);
        setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      } finally {
        setIsDeleting(false);
      }
    },
    [id]
  );

  const handleOpenCampaign = useCallback(
    (campaignId: string) => {
      navigate(`/admin/library/campaigns/${campaignId}`);
    },
    [navigate]
  );

  return (
    <WorldDetailPage
      worldId={id || ''}
      world={world}
      campaigns={campaigns}
      isLoadingWorld={isLoadingWorld}
      isLoadingCampaigns={isLoadingCampaigns}
      worldError={worldError}
      isUploading={isUploading}
      isDeleting={isDeleting}
      mediaBaseUrl={MEDIA_BASE_URL}
      onBack={handleBack}
      onUpdateWorld={handleUpdateWorld}
      onUploadFile={handleUploadFile}
      onCreateCampaign={handleCreateCampaign}
      onCloneCampaign={handleCloneCampaign}
      onRemoveCampaign={handleRemoveCampaign}
      onOpenCampaign={handleOpenCampaign}
    />
  );
}
