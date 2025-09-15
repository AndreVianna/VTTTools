# UC056 - Scene State Persistence

## Use Case Information
- **Use Case ID**: UC056
- **Use Case Name**: Scene State Persistence
- **User Story**: As a GM, I want to save and load scene configurations so that I can preserve my work and reuse battle maps
- **Actor(s)**: Game Master
- **System**: VTTTools React Frontend Application - Scene Builder

## Preconditions
- User is authenticated as a GM
- Scene Builder is initialized with content to save (UC047-UC055)
- Backend API services are available and responsive
- User has appropriate permissions to save/load scenes
- Scene contains saveable content (background, grid, assets, or layer configurations)

## Postconditions
- Scene data is persistently stored with complete state information
- Scene can be accurately restored to exact previous configuration
- Scene versioning and revision history are maintained
- Auto-save functionality protects against data loss
- Saved scenes are accessible across different sessions and devices

## Main Flow
1. **GM creates or modifies scene** using Scene Builder tools and features
2. **System tracks scene changes** and maintains current state information
3. **GM initiates save operation** through save button, keyboard shortcut, or auto-save trigger
4. **System collects complete scene state** including all layers, assets, and configurations
5. **System validates scene data** for completeness and integrity
6. **System sends scene data to backend** via API with appropriate metadata
7. **Backend processes and stores scene** with versioning and backup information
8. **System confirms successful save** and updates UI with save status
9. **Scene state is marked as clean** (no unsaved changes) with timestamp
10. **Auto-save schedule resets** for next automatic save interval

## Alternative Flows
### A1: Scene Load Operation
1a. GM selects "Load Scene" or opens existing scene from library
2a. System requests scene data from backend API
3a. Backend returns complete scene configuration data
4a. System validates loaded data integrity
5a. System reconstructs canvas state with all layers and assets
6a. Scene Builder displays loaded scene ready for editing

### A2: Auto-Save Operation
At regular intervals or after significant changes:
2a. System detects changes since last save
3a. Auto-save triggers without user intervention
4a. System performs save operation in background
5a. Save completes without interrupting user workflow
6a. Subtle notification confirms auto-save completion

### A3: Scene Versioning
3a. GM saves scene that already has saved versions
4a. System creates new version while preserving previous versions
5a. Version history tracking maintains chronological record
6a. GM can access previous versions through version history interface

### A4: Export Scene for Sharing
3a. GM selects "Export Scene" for external sharing
4a. System packages scene data with embedded assets
5a. Exported file includes all necessary resources for import
6a. System provides downloadable package or shareable link

### A5: Save Conflict Resolution
7a. Backend detects simultaneous save from multiple users
7b. System presents conflict resolution interface
7c. GM chooses conflict resolution strategy (merge, overwrite, create copy)
7d. System applies chosen resolution and completes save

### A6: Offline Save Capability
6a. Network connection unavailable during save attempt
6b. System queues save operation for later transmission
6c. Local storage maintains scene data temporarily
6d. System retries save when connection restored

## Technical Implementation Notes

### Scene State Data Structure
```typescript
interface SceneConfiguration {
  id: string;
  name: string;
  description?: string;
  version: number;
  created: Date;
  lastModified: Date;
  
  // Canvas configuration
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  
  // Layer configurations
  layers: {
    background: BackgroundLayerData;
    grid: GridLayerData;
    assets: AssetLayerData;
    ui: UILayerData;
    effects?: EffectLayerData;
  };
  
  // Scene metadata
  metadata: {
    adventureId?: string;
    tags: string[];
    isPublic: boolean;
    thumbnailUrl?: string;
  };
  
  // Collaborative settings
  collaboration: {
    allowCollaborators: boolean;
    collaboratorPermissions: CollaboratorPermission[];
  };
}

interface BackgroundLayerData {
  imageUrl?: string;
  imageDimensions?: { width: number; height: number };
  visible: boolean;
  opacity: number;
  position: { x: number; y: number };
  scale: { x: number; y: number };
}

interface AssetLayerData {
  assets: PlacedAssetData[];
  visible: boolean;
  opacity: number;
  locked: boolean;
}

interface PlacedAssetData {
  id: string;
  assetId: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  customProperties?: Record<string, any>;
}
```

### Save/Load Service Implementation
```typescript
class ScenePersistenceService {
  async saveScene(sceneConfig: SceneConfiguration): Promise<SaveResult> {
    try {
      // Validate scene data
      const validationResult = this.validateSceneData(sceneConfig);
      if (!validationResult.isValid) {
        throw new ValidationError(validationResult.errors);
      }

      // Create save payload
      const savePayload = await this.prepareSavePayload(sceneConfig);
      
      // Send to backend
      const response = await this.apiClient.post('/api/scenes', savePayload);
      
      // Update local state
      this.updateLocalSceneState(response.data);
      
      return { success: true, sceneId: response.data.id, version: response.data.version };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loadScene(sceneId: string): Promise<LoadResult> {
    try {
      const response = await this.apiClient.get(`/api/scenes/${sceneId}`);
      const sceneConfig = this.validateAndParseSceneData(response.data);
      
      return { success: true, scene: sceneConfig };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listSceneVersions(sceneId: string): Promise<SceneVersion[]> {
    const response = await this.apiClient.get(`/api/scenes/${sceneId}/versions`);
    return response.data;
  }
}
```

### Auto-Save System
```typescript
class AutoSaveManager {
  private autoSaveInterval: number = 30000; // 30 seconds
  private changeDetectionThreshold: number = 5000; // 5 seconds
  private lastSaveTime: number = 0;
  private pendingChanges: boolean = false;

  startAutoSave(sceneId: string, getCurrentState: () => SceneConfiguration): void {
    setInterval(() => {
      if (this.pendingChanges && Date.now() - this.lastSaveTime > this.changeDetectionThreshold) {
        this.performAutoSave(sceneId, getCurrentState());
      }
    }, this.autoSaveInterval);
  }

  private async performAutoSave(sceneId: string, sceneState: SceneConfiguration): Promise<void> {
    try {
      await this.persistenceService.saveScene(sceneState);
      this.lastSaveTime = Date.now();
      this.pendingChanges = false;
      this.notifyAutoSaveSuccess();
    } catch (error) {
      this.notifyAutoSaveError(error);
    }
  }
}
```

### Scene Reconstruction
```typescript
class SceneReconstructor {
  async reconstructScene(sceneConfig: SceneConfiguration, stage: Konva.Stage): Promise<void> {
    // Clear existing content
    this.clearCanvas(stage);
    
    // Reconstruct layers in order
    await this.reconstructBackgroundLayer(sceneConfig.layers.background, stage);
    await this.reconstructGridLayer(sceneConfig.layers.grid, stage);
    await this.reconstructAssetLayer(sceneConfig.layers.assets, stage);
    await this.reconstructUILayer(sceneConfig.layers.ui, stage);
    
    // Apply canvas configuration
    this.applyCanvasConfig(sceneConfig.canvas, stage);
    
    // Trigger re-render
    stage.draw();
  }

  private async reconstructAssetLayer(assetData: AssetLayerData, stage: Konva.Stage): Promise<void> {
    const assetsLayer = stage.findOne('.assets-layer') as Konva.Layer;
    
    for (const assetInfo of assetData.assets) {
      const assetNode = await this.createAssetNode(assetInfo);
      assetsLayer.add(assetNode);
    }
    
    assetsLayer.visible(assetData.visible);
    assetsLayer.opacity(assetData.opacity);
  }
}
```

## Acceptance Criteria

### Save Functionality
- [ ] Scene save functionality with all layer and asset data preserved accurately
- [ ] Save progress indicators and success/error feedback with clear user messaging
- [ ] Manual save through button click and keyboard shortcut (Ctrl+S)
- [ ] Save operation completes within 5 seconds for typical scenes (50 assets, background)
- [ ] Save validation prevents data corruption and incomplete saves

### Load Functionality
- [ ] Scene load functionality with complete state restoration to exact previous configuration
- [ ] Load progress indicators during scene reconstruction with estimated time remaining
- [ ] Error handling for corrupted or incomplete scene data with recovery options
- [ ] Load operation completes within 10 seconds for typical scenes
- [ ] Cross-session compatibility ensuring scenes load identically across different sessions

### Auto-Save System
- [ ] Auto-save functionality with configurable intervals (15s to 5min range)
- [ ] Auto-save triggers after significant changes with intelligent change detection
- [ ] Non-intrusive auto-save that doesn't interrupt user workflow
- [ ] Auto-save status indicators showing last save time and next save schedule
- [ ] Auto-save conflict resolution for collaborative editing scenarios

### Scene Versioning
- [ ] Scene versioning and revision history maintaining chronological change record
- [ ] Version comparison interface showing differences between scene versions
- [ ] Version restoration capability with confirmation dialog for data protection
- [ ] Automatic version creation on major changes with configurable versioning rules
- [ ] Version pruning system to manage storage space while preserving important milestones

### Data Validation and Recovery
- [ ] Scene data validation and corruption recovery with automatic repair attempts
- [ ] Backup and redundancy systems preventing total data loss
- [ ] Data integrity checks during save/load operations with error reporting
- [ ] Recovery from partial save failures with rollback capability
- [ ] Export/import functionality for external backup and sharing

### Performance Requirements
- [ ] Save operations maintain UI responsiveness during background processing
- [ ] Load operations provide progressive loading for large scenes
- [ ] Auto-save memory usage optimization preventing performance degradation
- [ ] Efficient diff calculation for change detection minimizing processing overhead
- [ ] Compressed data transmission reducing network bandwidth usage

### Export and Sharing
- [ ] Export functionality for scene sharing and backup with complete asset packaging
- [ ] Scene packaging includes all necessary resources for standalone import
- [ ] Multiple export formats (JSON, compressed archive) for different use cases
- [ ] Import validation ensuring compatibility and security
- [ ] Shareable scene URLs for collaborative access and distribution

### Technical Requirements
- [ ] Integration with backend API services with retry logic and error handling
- [ ] Offline save capability with local storage and sync-when-online
- [ ] Scene data encryption for sensitive campaign information
- [ ] Concurrent save handling in collaborative environments
- [ ] Database transaction integrity for atomic save operations

## Business Value
- **Work Protection**: Auto-save and versioning protect GMs from losing hours of scene creation work
- **Reusability**: Saved scenes can be reused across multiple game sessions and campaigns
- **Collaboration**: Scene sharing enables collaborative map creation and campaign development
- **Professional Workflow**: Robust save/load system enables complex, long-term scene development projects
- **Data Security**: Backup and recovery systems ensure valuable creative content is preserved

## Dependencies
- **UC047-UC055**: All Scene Builder features - Complete scene state requires all components
- **Backend API Services**: Scene storage, versioning, and retrieval endpoints
- **Authentication System**: User permissions and access control for scene operations
- **File Storage**: Asset file persistence and URL management
- **Database System**: Scene metadata and version history storage

## Risk Factors
- **Data Loss**: Save failures could result in lost creative work requiring robust error handling
- **Performance Impact**: Large scenes may cause save/load performance issues
- **Network Dependencies**: Connectivity issues could interrupt save operations
- **Version Conflicts**: Collaborative editing may create complex merge scenarios
- **Storage Scaling**: Large numbers of scenes and versions could impact system storage

## Definition of Done
- All acceptance criteria verified through comprehensive save/load testing
- Performance benchmarks met for save/load operations with various scene sizes
- Data integrity validation passed through corruption testing and recovery scenarios
- Cross-browser compatibility confirmed for all persistence features
- Auto-save system tested under various user behavior patterns
- Collaborative save conflict resolution tested with multiple concurrent users
- Export/import functionality validated with scene portability testing
- Memory leak testing passed for extended save/load sessions