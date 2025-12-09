import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdventureDetailPage, type Adventure, type Encounter, Weather } from '@vtttools/web-components';
import { libraryService, type LibraryContentResponse } from '@services/libraryService';

const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || '';

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

function mapToEncounter(response: LibraryContentResponse): Encounter {
  return {
    id: response.id,
    adventure: null,
    name: response.name,
    description: response.description,
    isPublished: response.isPublished,
    light: 0,
    weather: Weather.Clear,
    elevation: 0,
    grid: {
      type: 1,
      cellSize: { width: 50, height: 50 },
      offset: { left: 0, top: 0 },
      snap: true,
    },
    stage: {
      background: null,
      zoomLevel: 1,
      panning: { x: 0, y: 0 },
    },
    assets: [],
    walls: [],
    openings: [],
    regions: [],
    sources: [],
  };
}

export function AdventureEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [isLoadingAdventure, setIsLoadingAdventure] = useState(true);
  const [isLoadingEncounters, setIsLoadingEncounters] = useState(false);
  const [adventureError, setAdventureError] = useState<unknown>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAdventure = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoadingAdventure(true);
      setAdventureError(null);
      const data = await libraryService.getAdventureById(id);
      setAdventure(mapToAdventure(data));
    } catch (err) {
      setAdventureError(err);
    } finally {
      setIsLoadingAdventure(false);
    }
  }, [id]);

  const loadEncounters = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoadingEncounters(true);
      const data = await libraryService.getEncountersByAdventureId(id);
      setEncounters(data.map(mapToEncounter));
    } catch (err) {
      console.error('Failed to load encounters:', err);
    } finally {
      setIsLoadingEncounters(false);
    }
  }, [id]);

  useEffect(() => {
    loadAdventure();
    loadEncounters();
  }, [loadAdventure, loadEncounters]);

  const handleBack = useCallback(() => {
    navigate('/admin/library');
  }, [navigate]);

  const handleNavigateToCampaign = useCallback(
    (campaignId: string) => {
      navigate(`/admin/library/campaigns/${campaignId}`);
    },
    [navigate]
  );

  const handleUpdateAdventure = useCallback(
    async (request: { name?: string; description?: string; isPublished?: boolean; backgroundId?: string }) => {
      if (!id) return;

      const updateRequest: { name?: string; description?: string; isPublished?: boolean } = {};
      if (request.name !== undefined) updateRequest.name = request.name;
      if (request.description !== undefined) updateRequest.description = request.description;
      if (request.isPublished !== undefined) updateRequest.isPublished = request.isPublished;

      const updated = await libraryService.updateAdventure(id, updateRequest);
      setAdventure(mapToAdventure(updated));
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

  const handleCreateEncounter = useCallback(
    async (request: { name: string; description: string }): Promise<{ id: string }> => {
      if (!id) throw new Error('Adventure ID is required');

      const created = await libraryService.createEncounterForAdventure(id, {
        name: request.name,
        description: request.description,
      });
      setEncounters((prev) => [...prev, mapToEncounter(created)]);
      return { id: created.id };
    },
    [id]
  );

  const handleCloneEncounter = useCallback(
    async (encounterId: string): Promise<void> => {
      if (!id) return;

      const cloned = await libraryService.cloneEncounterInAdventure(id, encounterId);
      setEncounters((prev) => [...prev, mapToEncounter(cloned)]);
    },
    [id]
  );

  const handleRemoveEncounter = useCallback(
    async (encounterId: string): Promise<void> => {
      if (!id) return;

      setIsDeleting(true);
      try {
        await libraryService.removeEncounterFromAdventure(id, encounterId);
        setEncounters((prev) => prev.filter((e) => e.id !== encounterId));
      } finally {
        setIsDeleting(false);
      }
    },
    [id]
  );

  const handleOpenEncounter = useCallback(
    (encounterId: string) => {
      navigate(`/admin/library/encounters/${encounterId}`);
    },
    [navigate]
  );

  return (
    <AdventureDetailPage
      adventureId={id || ''}
      adventure={adventure}
      campaign={null}
      encounters={encounters}
      isLoadingAdventure={isLoadingAdventure}
      isLoadingEncounters={isLoadingEncounters}
      adventureError={adventureError}
      isUploading={isUploading}
      isDeleting={isDeleting}
      mediaBaseUrl={MEDIA_BASE_URL}
      onBack={handleBack}
      onNavigateToCampaign={handleNavigateToCampaign}
      onUpdateAdventure={handleUpdateAdventure}
      onUploadFile={handleUploadFile}
      onCreateEncounter={handleCreateEncounter}
      onCloneEncounter={handleCloneEncounter}
      onRemoveEncounter={handleRemoveEncounter}
      onOpenEncounter={handleOpenEncounter}
    />
  );
}
