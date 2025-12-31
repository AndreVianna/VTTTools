// TypeScript types matching existing Domain layer API contracts

import type { ResourceMetadata, Stage, StageLight, StageSound, StageWall, StageWallSegment, StageRegionVertex } from './stage';

// 3D position type for game elements
export interface Position3D {
  x: number;
  y: number;
  z?: number;  // Optional z for elevation
}

// Common types
export interface User {
  id: string;
  email: string;
  userName?: string; // same as email
  name: string; // Maps to backend UserInfo.Name
  displayName: string; // Maps to backend UserInfo.DisplayName (returns Name if empty)
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

// Encounter Environment Enums (from Domain.Library.Encounters.Model)

export enum Light {
  Black = -10,
  Darkness = -5,
  Nighttime = -3,
  Dim = -2,
  Twilight = -1,
  Ambient = 0,
  Candlelight = 1,
  Torchlight = 2,
  Artificial = 3,
  Daylight = 5,
  Bright = 10,
}

export enum Weather {
  Clear = 'Clear',
  PartlyCloudy = 'PartlyCloudy',
  Overcast = 'Overcast',
  Fog = 'Fog',
  LightRain = 'LightRain',
  Rain = 'Rain',
  HeavyRain = 'HeavyRain',
  Rainstorm = 'Rainstorm',
  Thunderstorm = 'Thunderstorm',
  LightSnow = 'LightSnow',
  Snow = 'Snow',
  HeavySnow = 'HeavySnow',
  Snowstorm = 'Snowstorm',
  Hail = 'Hail',
  IceStorm = 'IceStorm',
  Breezy = 'Breezy',
  Windy = 'Windy',
  Hurricane = 'Hurricane',
  Tornado = 'Tornado',
  FireStorm = 'FireStorm',
}

// Asset Types (from Domain.Assets.ApiContracts)

export enum AssetKind {
  Character = 'Character',
  Creature = 'Creature',
  Effect = 'Effect',
  Object = 'Object',
}

export enum StatValueType {
  Number = 'Number',
  Text = 'Text',
  Modifier = 'Modifier',
}

export interface StatBlockValue {
  key: string;
  value: string | null;
  type: StatValueType;
}

export interface AssetClassification {
  kind: AssetKind;
  category: string;
  type: string;
  subtype: string | null;
}

export enum GridType {
  NoGrid = 'NoGrid',
  Square = 'Square',
  HexV = 'HexV',
  HexH = 'HexH',
  Isometric = 'Isometric',
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
  Custom = 99,
}

export interface NamedSize {
  width: number;
  height: number;
}

export interface CreateAssetRequest {
  kind: AssetKind;
  category: string;
  type: string;
  subtype?: string;
  name: string;
  description: string;
  tags?: string[];
  portraitId?: string;
  tokenSize?: NamedSize;
  tokenId?: string;
}

export interface UpdateAssetRequest {
  kind?: AssetKind;
  category?: string;
  type?: string;
  subtype?: string | null;
  name?: string;
  description?: string;
  tags?: { add?: string[]; remove?: string[] };
  portraitId?: string | null;
  tokenSize?: NamedSize;
  isPublished?: boolean;
  isPublic?: boolean;
}

export interface Asset {
  id: string;
  classification: AssetClassification;
  name: string;
  description: string;
  thumbnail: MediaResource | null;
  portrait: MediaResource | null;
  size: NamedSize;  // Backend sends 'size', not 'tokenSize'
  tokens: MediaResource[];
  statBlocks: Record<number, Record<string, StatBlockValue>>;
  tags: string[];
  ownerId: string;
  isPublished: boolean;
  isPublic: boolean;
}

// Alias for backwards compatibility - some code may still use tokenSize
export type AssetWithTokenSize = Omit<Asset, 'size'> & { tokenSize: NamedSize };

// Placed Asset - Frontend-only type for local placement state
export interface PlacedAsset {
  id: string;
  assetId: string;
  asset: Asset;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  layer: string;
  index: number; // Backend Index property - encounter-wide unique identifier (never reused)
  number: number; // Backend Number property - per-asset-type counter (e.g., "Goblin #3")
  name: string;
  isHidden: boolean; // Game-time property - during editing, visibility is controlled by topbar buttons
  isLocked: boolean;
  labelVisibility: LabelVisibility;
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
  layer: asset.layer,
});

export const applyAssetSnapshot = (asset: PlacedAsset, snapshot: PlacedAssetSnapshot): PlacedAsset => ({
  ...asset,
  position: { ...snapshot.position },
  size: { ...snapshot.size },
  rotation: snapshot.rotation,
  layer: snapshot.layer,
});

// Structure Types (from Domain.Library.Encounters.Model)

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

export interface EncounterStructure {
  id: string;
  encounterId: string;
  structureId: string;
  vertices: Array<{ x: number; y: number }>;
  isOpen?: boolean;
  isLocked?: boolean;
  isSecret?: boolean;
}

// StatBlock (stub - full implementation in future phase)

export interface StatBlock {
  id: string;
  name: string;
  createdAt: string;
}

// Adventures (from Domain.Library.Adventures.ApiContracts)
export interface CreateAdventureRequest {
  name: string; // [MaxLength(128)]
  description: string; // [MaxLength(1024)]
  style: AdventureStyle;
  isOneShot?: boolean;
  campaignId?: string; // Guid?
  backgroundId?: string; // Guid?
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
  Generic = 'Generic',
  OpenWorld = 'OpenWorld',
  DungeonCrawl = 'DungeonCrawl',
  HackNSlash = 'HackNSlash',
  Survival = 'Survival',
  GoalDriven = 'GoalDriven',
  RandomlyGenerated = 'RandomlyGenerated',
}

export enum ContentType {
  Adventure = 0,
  Campaign = 1,
  World = 2,
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
  encounterCount?: number | null;
  background?: MediaResource | null;
  campaignId?: string;
  encounters?: Encounter[];
}

// Worlds (from Domain.Library.Worlds.ApiContracts)
export interface CreateWorldRequest {
  name: string; // [MaxLength(128)]
  description: string; // [MaxLength(4096)]
  backgroundId?: string; // Guid?
}

export interface UpdateWorldRequest {
  name?: string;
  description?: string;
  backgroundId?: string;
  isPublished?: boolean;
  isPublic?: boolean;
}

export interface World {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  isPublished: boolean;
  isPublic: boolean;
  background?: MediaResource | null;
  campaigns?: Campaign[];
}

// Campaigns (from Domain.Library.Campaigns.ApiContracts)
export interface CreateCampaignRequest {
  name: string; // [MaxLength(128)]
  description: string; // [MaxLength(4096)]
  backgroundId?: string; // Guid?
}

export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  backgroundId?: string;
  isPublished?: boolean;
  isPublic?: boolean;
}

export interface Campaign {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  isPublished: boolean;
  isPublic: boolean;
  worldId?: string;
  background?: MediaResource | null;
  adventures?: Adventure[];
}

// Encounters (from Domain.Library.Encounters.ApiContracts)
// NOTE: Encounters now reference a Stage entity for structural elements.
// Game elements (actors, objects, effects) remain on Encounter.
// Structural elements (walls, regions, lights, elements, sounds) are on Stage.

export interface CreateEncounterRequest {
  name: string;
  description?: string;
  // Note: stageId is not passed - backend auto-creates embedded Stage
}

export interface UpdateEncounterRequest {
  name?: string;
  description?: string;
  isPublished?: boolean;
  isPublic?: boolean;
  // Note: stage is not directly updatable via encounter - use Stage API
}

export interface Encounter {
  id: string;
  ownerId: string;
  adventure: Adventure | null;
  name: string;
  description: string;
  isPublished: boolean;
  isPublic: boolean;

  // Stage contains all structural/environmental elements
  // The Stage is auto-created when Encounter is created
  stage: Stage;

  // Game elements only
  actors: EncounterActor[];
  objects: EncounterObject[];
  effects: EncounterEffect[];
}

// Game Elements (remain on Encounter)

export enum ObjectState {
  Closed = 'Closed',
  Open = 'Open',
  Destroyed = 'Destroyed',
}

export enum EffectState {
  Enabled = 'Enabled',
  Disabled = 'Disabled',
  Triggered = 'Triggered',
}

// Frame shape enum matching backend FrameShape
export enum FrameShape {
  None = 'None',
  Square = 'Square',
  Circle = 'Circle',
  Hexagon = 'Hexagon',
}

// Frame type matching backend Domain.Common.Model.Frame
export interface Frame {
  shape: FrameShape | string;
  borderColor: string;
  borderThickness: number;
  background: string;
}

// EncounterActor matching backend Domain.Library.Encounters.Model.EncounterActor
export interface EncounterActor {
  asset: Asset;  // Full asset object (no separate assetId)
  index: number;
  name?: string | null;
  position: Point;  // 2D position (x, y)
  rotation: number;
  elevation: number;
  size: NamedSize;
  display?: ResourceMetadata | null;
  frame: Frame;
  controlledBy?: string | null;
  isHidden: boolean;
  isLocked: boolean;
}

// EncounterObject matching backend Domain.Library.Encounters.Model.EncounterObject
export interface EncounterObject {
  asset: Asset;  // Full asset object (no separate assetId)
  index: number;
  name?: string | null;
  position: Point;  // 2D position (x, y)
  rotation: number;
  elevation: number;
  size: NamedSize;
  display?: ResourceMetadata | null;
  closedDisplay?: ResourceMetadata | null;
  openedDisplay?: ResourceMetadata | null;
  destroyedDisplay?: ResourceMetadata | null;
  state: ObjectState;
  isHidden: boolean;
  isLocked: boolean;
}

// EncounterEffect matching backend Domain.Library.Encounters.Model.EncounterEffect
export interface EncounterEffect {
  asset: Asset;  // Full asset object (no separate assetId)
  index: number;
  name?: string | null;
  position: Point;  // 2D position (x, y)
  rotation: number;
  state: EffectState;
  isHidden: boolean;
  triggerRegion?: Shape | null;
  display?: ResourceMetadata | null;
  enabledDisplay?: ResourceMetadata | null;
  disabledDisplay?: ResourceMetadata | null;
  onTriggerDisplay?: ResourceMetadata | null;
  triggeredDisplay?: ResourceMetadata | null;
}

export interface Shape {
  type: 'circle' | 'rectangle' | 'polygon';
  vertices?: Point[];
  radius?: number;
  width?: number;
  height?: number;
}

// Game element request types
export interface CreateActorRequest {
  assetId: string;
  name?: string;
  position?: Position3D;
  rotation?: number;
  elevation?: number;
}

export interface UpdateActorRequest {
  name?: string;
  position?: Position3D;
  rotation?: number;
  elevation?: number;
  displayId?: string | null;
  controlledBy?: string | null;
  isHidden?: boolean;
  isLocked?: boolean;
}

export interface CreateObjectRequest {
  assetId: string;
  name?: string;
  position?: Position3D;
  rotation?: number;
  elevation?: number;
}

export interface UpdateObjectRequest {
  name?: string;
  position?: Position3D;
  rotation?: number;
  elevation?: number;
  state?: ObjectState;
  isHidden?: boolean;
  isLocked?: boolean;
}

export interface CreateEffectRequest {
  assetId: string;
  name?: string;
  position?: Position3D;
  rotation?: number;
}

export interface UpdateEffectRequest {
  name?: string;
  position?: Position3D;
  rotation?: number;
  state?: EffectState;
  isHidden?: boolean;
}

// Legacy type alias for backwards compatibility
// The old EncounterAsset is now split into EncounterActor/Object/Effect

export interface EncounterAsset {
  id: string;
  encounterId: string;
  assetId: string;
  index: number;
  number: number;
  name: string;
  notes?: string;
  image?: MediaResource;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  layer: number;
  elevation: number;
  isHidden: boolean;
  isLocked: boolean;
  asset: Asset;
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
  Cancelled = 'Cancelled',
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

// Media (from Domain.Media.Model)

export enum ResourceRole {
  Undefined = 'Undefined',
  Background = 'Background',
  Token = 'Token',
  Portrait = 'Portrait',
  Overlay = 'Overlay',
  Illustration = 'Illustration',
  SoundEffect = 'SoundEffect',
  AmbientSound = 'AmbientSound',
  CutScene = 'CutScene',
  UserAvatar = 'UserAvatar',
}

export interface ResourceFilterData {
  role?: ResourceRole;
  searchText?: string;
  skip?: number;
  take?: number;
}

export interface ResourceFilterResponse {
  items: MediaResource[];
  totalCount: number;
  skip: number;
  take: number;
}

// MediaResource - Pure media metadata (no business properties)
// Business properties (ownerId, isPublished, isPublic) are inherited from parent entities
export interface MediaResource {
  id: string;
  role: ResourceRole;
  path: string;
  contentType: string;
  fileName: string;
  fileSize: number;
  dimensions: { width: number; height: number };
  duration: string;
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
  name: string; // Maps to backend Name property
  displayName: string; // Optional display name
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

export enum LabelVisibility {
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
// EncounterWall, EncounterRegion, EncounterLightSource, and EncounterSoundSource as value objects embedded in Encounter

export interface Point {
  x: number;
  y: number;
}

export interface Pole {
  x: number;
  y: number;
  h: number; // Height in feet
}


export enum SegmentType {
  Wall = 'Wall',
  Door = 'Door',
  Window = 'Window',
}

export enum SegmentState {
  Open = 'Open',
  Closed = 'Closed',
  Locked = 'Locked',
  Visible = 'Locked', // Alias for Locked, used for barriers (walls/fences)
  Secret = 'Secret',
}

export enum LightSourceType {
  Natural = 'Natural',
  Artificial = 'Artificial',
  Supernatural = 'Supernatural',
}

export enum RegionType {
  Elevation = 'Elevation',
  Terrain = 'Terrain',
  Illumination = 'Illumination',
  FogOfWar = 'FogOfWar',
}

// Legacy structural element types - now aliases to Stage types
// These are kept for backwards compatibility with existing components
// New code should use Stage* types directly from './stage'
// (Stage types imported at top of file)

// Wall types - now aliases to Stage types
export type EncounterWallSegment = StageWallSegment;
export type EncounterWall = StageWall;

export interface PlacedWall extends EncounterWall {
  id: string;
}

// Region types - now aliases to Stage types
// Note: encounterId was removed since regions now belong to Stage, not Encounter
export interface EncounterRegion {
  encounterId?: string | undefined; // Optional for backwards compat, not used
  index: number;
  name?: string | undefined;
  type: string;
  vertices: Point[] | StageRegionVertex[];
  value?: number | undefined;
  label?: string | undefined;
  color?: string | undefined;
}

export interface PlacedRegion extends EncounterRegion {
  id: string;
}

// Light source types - now aliases to Stage types
export type EncounterLightSource = StageLight;

// Sound source types - now alias to Stage types
export type EncounterSoundSource = StageSound;

export interface PlacedLightSource extends EncounterLightSource {
  id: string;
}

export interface PlacedSoundSource extends EncounterSoundSource {
  id: string;
}
