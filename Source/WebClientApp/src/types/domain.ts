// TypeScript types matching existing Domain layer API contracts

// Common types
export interface User {
  id: string;
  email: string;
  userName?: string;     // same as email
  name: string;          // Maps to backend UserInfo.Name
  displayName: string;   // Maps to backend UserInfo.DisplayName (returns Name if empty)
  emailConfirmed: boolean;
  phoneNumber?: string;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd?: string;
  lockoutEnabled: boolean;
  accessFailedCount: number;
  createdAt: string;
  lastLoginAt?: string;
  profilePictureUrl?: string;
}

// Standard API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

// Asset Types (from Domain.Assets.ApiContracts)

export enum AssetKind {
  Object = 'Object',
  Creature = 'Creature'
}

export enum CreatureCategory {
  Character = 'Character',
  Monster = 'Monster'
}

export enum TokenShape {
  Circle = 'Circle',
  Square = 'Square'
}

export interface TokenStyle {
  borderColor?: string;
  backgroundColor?: string;
  shape: TokenShape;
}

// AssetToken replaces AssetResource in new backend schema
export interface AssetToken {
  token: MediaResource;  // Renamed from resource
  isDefault: boolean;  // Simplified from role enum
}

export enum SizeName {
  Zero = 0,
  Miniscule = 1,
  Tiny = 2,
  Small = 3,
  Medium = 4,
  Large = 5,
  Huge = 6,
  Gargantuan = 7,
  Custom = 99
}

export interface NamedSize {
  width: number;
  height: number;
  isSquare: boolean;
  // Computed name derived from width/height/isSquare on backend
}

// ObjectData replaces ObjectProperties (size moved to Asset root level)
export interface ObjectData {
  isMovable: boolean;
  isOpaque: boolean;
  triggerEffectId?: string | undefined;
}

// CreatureData replaces CreatureProperties (size moved to Asset root level)
export interface CreatureData {
  category: CreatureCategory;
  statBlockId?: string | undefined;
  tokenStyle?: TokenStyle | undefined;
}

export interface CreateAssetRequest {
  kind: AssetKind;
  name: string;
  description: string;
  tokens: AssetToken[];  // Renamed from resources
  portraitId?: string | undefined;  // New: separate portrait reference
  size: NamedSize;  // New: moved from nested properties to root
  isPublished: boolean;
  isPublic: boolean;
  objectData?: ObjectData | undefined;  // Renamed from objectProps
  creatureData?: CreatureData | undefined;  // Renamed from creatureProps
}

export interface UpdateAssetRequest {
  name?: string | undefined;
  description?: string | undefined;
  tokens?: AssetToken[] | undefined;  // Renamed from resources
  portraitId?: string | undefined;  // New: separate portrait reference
  size?: NamedSize | undefined;  // New: moved from nested properties to root
  isPublished?: boolean | undefined;
  isPublic?: boolean | undefined;
  objectData?: ObjectData | undefined;  // Renamed from objectProps
  creatureData?: CreatureData | undefined;  // Renamed from creatureProps
}

// Base Asset interface
export interface Asset {
  id: string;
  ownerId: string;
  kind: AssetKind;
  name: string;
  description: string;
  isPublished: boolean;
  isPublic: boolean;
  tokens: AssetToken[];
  portrait: MediaResource | undefined;
  size: NamedSize;
}

// ObjectAsset - environmental items
export interface ObjectAsset extends Asset {
  kind: AssetKind.Object;
  isMovable: boolean;
  isOpaque: boolean;
  triggerEffectId?: string | undefined;
}

// CreatureAsset - characters and monsters
export interface CreatureAsset extends Asset {
  kind: AssetKind.Creature;
  category: CreatureCategory;
  statBlockId?: string | undefined;
  tokenStyle?: TokenStyle | undefined;
}

// Placed Asset - Frontend-only type for local placement state
export interface PlacedAsset {
  id: string;
  assetId: string;
  asset: Asset;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  layer: string;
  index: number; // Backend Index property - scene-wide unique identifier (never reused)
  number: number; // Backend Number property - per-asset-type counter (e.g., "Goblin #3")
  name: string;
  visible: boolean;
  locked: boolean;
  displayName: DisplayName;
  labelPosition: LabelPosition;
}

// PlacedAsset Snapshot - For undo/redo with Memento pattern
export interface PlacedAssetSnapshot {
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  layer: string;
}

export const createAssetSnapshot = (asset: PlacedAsset): PlacedAssetSnapshot => ({
  position: { ...asset.position },
  size: { ...asset.size },
  rotation: asset.rotation,
  layer: asset.layer
});

export const applyAssetSnapshot = (
  asset: PlacedAsset,
  snapshot: PlacedAssetSnapshot
): PlacedAsset => ({
  ...asset,
  position: { ...snapshot.position },
  size: { ...snapshot.size },
  rotation: snapshot.rotation,
  layer: snapshot.layer,
});

// Structure Types (from Domain.Library.Scenes.Model)

export interface Structure {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  isBlocking: boolean;
  isOpaque: boolean;
  isSecret: boolean;
  isOpenable: boolean;
  isLocked: boolean;
  visual?: MediaResource;
  createdAt: string;
}

export interface SceneStructure {
  id: string;
  sceneId: string;
  structureId: string;
  vertices: Array<{ x: number; y: number }>;
  isOpen?: boolean;
  isLocked?: boolean;
  isSecret?: boolean;
}

// Effect Types (from Domain.Library.Scenes.Model)

export enum EffectShape {
  Circle = 'Circle',
  Cone = 'Cone',
  Square = 'Square',
  Line = 'Line'
}

export interface Effect {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  shape: EffectShape;
  size: number;
  direction?: number;
  boundedByStructures: boolean;
  visual?: MediaResource;
  category?: string;
  createdAt: string;
}

export interface SceneEffect {
  id: string;
  sceneId: string;
  effectId: string;
  origin: { x: number; y: number };
  size?: number;
  direction?: number;
}

// StatBlock (stub - full implementation in future phase)

export interface StatBlock {
  id: string;
  name: string;
  createdAt: string;
}

// Adventures (from Domain.Library.Adventures.ApiContracts)
export interface CreateAdventureRequest {
  name: string;           // [MaxLength(128)]
  description: string;    // [MaxLength(1024)]
  style: AdventureStyle;
  isOneShot?: boolean;
  campaignId?: string;    // Guid?
  backgroundId?: string;  // Guid?
}

export interface UpdateAdventureRequest {
  name?: string;
  description?: string;
  style?: AdventureStyle;
  isOneShot?: boolean;
  campaignId?: string;
  backgroundId?: string;
}

export enum AdventureStyle {
  Generic = 0,
  OpenWorld = 1,
  DungeonCrawl = 2,
  HackNSlash = 3,
  Survival = 4,
  GoalDriven = 5,
  RandomlyGenerated = 6
}

export enum ContentType {
  Adventure = 0,
  Campaign = 1,
  Epic = 2
}

export interface Adventure {
  id: string;
  type: ContentType;
  name: string;
  description: string;
  isPublished: boolean;
  ownerId: string;
  style?: AdventureStyle | null;
  isOneShot?: boolean | null;
  sceneCount?: number | null;
  background?: MediaResource | null;
  campaignId?: string;
  scenes?: Scene[];
}

// Scenes (from Domain.Library.Scenes.ApiContracts)
export interface CreateSceneRequest {
  name: string;
  description: string;
  backgroundId?: string;
  grid?: {
    type: number;
    cellSize: { width: number; height: number };
    offset: { left: number; top: number };
    snap: boolean;
  };
}

export interface UpdateSceneRequest {
  name?: string;
  description?: string;
  backgroundId?: string;
  grid?: {
    type: number;
    cellSize: { width: number; height: number };
    offset: { left: number; top: number };
    snap: boolean;
  };
}

export interface Scene {
  id: string;
  adventure: Adventure | null;
  name: string;
  description: string;
  isPublished: boolean;
  grid: {
    type: number;
    cellSize: { width: number; height: number };
    offset: { left: number; top: number };
    snap: boolean;
  };
  stage: {
    background: MediaResource | null;
    zoomLevel: number;
    panning: { x: number; y: number };
  };
  assets: SceneAsset[];
  walls: SceneWall[];
  regions: SceneRegion[];
  sources: SceneSource[];
}

export interface SceneAsset {
  id: string;
  sceneId: string;
  assetId: string;
  index: number;
  number: number;
  name: string;
  notes?: string;  // Renamed from description
  token?: MediaResource;  // Changed from resourceId (string) to full MediaResource object
  portrait?: MediaResource;  // New: separate portrait reference
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  layer: number;
  elevation: number;
  visible: boolean;
  locked: boolean;
  // displayName and labelPosition removed - now handled in frontend localStorage
  asset: Asset;
  // Placement behavior derived from asset.category but can be customized
  customBehavior?: Partial<import('./placement').PlacementBehavior>;
}

// Game Sessions (from Domain.Game.Sessions.ApiContracts)
export interface CreateGameSessionRequest {
  adventureId: string;
  name: string;
  maxPlayers: number;
  isPrivate: boolean;
}

export interface UpdateGameSessionRequest {
  name?: string;
  maxPlayers?: number;
  isPrivate?: boolean;
  status?: GameSessionStatus;
}

export interface JoinGameSessionRequest {
  sessionId: string;
  playerName: string;
}

export enum GameSessionStatus {
  Waiting = 'Waiting',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export interface GameSession {
  id: string;
  adventureId: string;
  name: string;
  maxPlayers: number;
  currentPlayers: number;
  isPrivate: boolean;
  status: GameSessionStatus;
  createdAt: string;
  updatedAt: string;
  adventure: Adventure;
}

// Media (from Domain.Media.ApiContracts)
export interface UploadRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
  tags?: string[];
}

export interface AddResourceRequest {
  name: string;
  description: string;
  resourceType: ResourceType;
  filePath: string;
  fileSize: number;
  mimeType: string;
  tags?: string[];
}

export interface UpdateResourceRequest {
  name?: string;
  description?: string;
  tags?: string[];
}

export enum ResourceType {
  Image = 'Image',
  Audio = 'Audio',
  Video = 'Video',
  Document = 'Document'
}

export interface MediaResource {
  id: string;
  type: ResourceType;
  path: string;  // Blob storage path
  metadata: ResourceMetadata;
  tags: string[];
}

export interface ResourceMetadata {
  contentType: string;
  fileName: string;
  fileLength: number;
  imageSize?: { width: number; height: number };
  duration?: string; // TimeSpan as string
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  requiresTwoFactor?: boolean;
  redirectUrl?: string;
  message?: string;
  user?: User;
  token?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;           // Maps to backend Name property
  displayName: string;   // Optional display name
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TwoFactorSetupResponse {
  sharedKey: string;
  authenticatorUri: string;
  qrCodeUri: string;
  recoveryCodes: string[];
}

export interface TwoFactorVerificationRequest {
  code: string;
  rememberMachine?: boolean;
}

export interface TwoFactorRecoveryRequest {
  recoveryCode: string;
}

export interface ExternalLoginInfo {
  provider: string;
  providerDisplayName: string;
  loginUrl: string;
}

export interface ExternalLoginCallbackRequest {
  provider: string;
  returnUrl?: string;
}

export interface LinkExternalLoginRequest {
  provider: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  displayName?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
}

export enum DisplayName {
  Default = 'Default',
  Always = 'Always',
  OnHover = 'OnHover',
  Never = 'Never',
}

export enum LabelPosition {
  Default = 'Default',
  Top = 'Top',
  Middle = 'Middle',
  Bottom = 'Bottom',
}

// Structure Types - Phase 8.8 Value Object Implementation
// SceneWall, SceneRegion, and SceneSource as value objects embedded in Scene

export interface Point {
  x: number;
  y: number;
}

export interface Pole {
  x: number;
  y: number;
  h: number;  // Height in feet
}

export enum WallVisibility {
  Normal = 0,
  Fence = 1,
  Invisible = 2
}

export interface SceneWall {
  sceneId: string;
  index: number;
  name: string;
  poles: Pole[];
  visibility: WallVisibility;
  isClosed: boolean;
  material?: string | undefined;
  color?: string | undefined;
}

export interface SceneRegion {
  sceneId: string;
  index: number;
  name: string;
  type: string;
  vertices: Point[];
  value?: number;
  label?: string;
  color?: string;
}

export interface SceneSource {
  sceneId: string;
  index: number;
  name: string;
  type: string;
  position: Point;
  isDirectional: boolean;
  direction: number;
  spread: number;
  range?: number;
  intensity?: number;
  color?: string;
  hasGradient: boolean;
}

