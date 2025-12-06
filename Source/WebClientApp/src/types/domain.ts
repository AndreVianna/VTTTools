// TypeScript types matching existing Domain layer API contracts

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
  portrait: MediaResource | null;
  tokenSize: NamedSize;
  tokens: MediaResource[];
  statBlocks: Record<number, Record<string, StatBlockValue>>;
  ownerId: string;
  isPublished: boolean;
  isPublic: boolean;
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
  index: number; // Backend Index property - encounter-wide unique identifier (never reused)
  number: number; // Backend Number property - per-asset-type counter (e.g., "Goblin #3")
  name: string;
  visible: boolean;
  locked: boolean;
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
  Generic = 0,
  OpenWorld = 1,
  DungeonCrawl = 2,
  HackNSlash = 3,
  Survival = 4,
  GoalDriven = 5,
  RandomlyGenerated = 6,
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
export interface CreateEncounterRequest {
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

export interface UpdateEncounterRequest {
  name?: string;
  description?: string;
  isPublished?: boolean;
  stage?: {
    backgroundId?: string | null;
    zoomLevel?: number;
    panning?: { x: number; y: number };
  };
  grid?: {
    type: number;
    cellSize: { width: number; height: number };
    offset: { left: number; top: number };
    snap: boolean;
  };
}

export interface Encounter {
  id: string;
  adventure: Adventure | null;
  name: string;
  description: string;
  isPublished: boolean;
  light: Light;
  weather: Weather;
  elevation: number;
  grid: {
    type: number;
    cellSize: { width: number; height: number };
    offset: { left: number; top: number };
    snap: boolean;
    scale: number;
  };
  stage: {
    background: MediaResource | null;
    zoomLevel: number;
    panning: { x: number; y: number };
  };
  assets: EncounterAsset[];
  walls: EncounterWall[];
  regions: EncounterRegion[];
  lightSources: EncounterLightSource[];
  soundSources: EncounterSoundSource[];
}

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
  visible: boolean;
  locked: boolean;
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

export enum ResourceType {
  Undefined = 'Undefined',
  Background = 'Background',
  Token = 'Token',
  Portrait = 'Portrait',
  Overlay = 'Overlay',
  Illustration = 'Illustration',
  SoundEffect = 'SoundEffect',
  AmbientSound = 'AmbientSound',
  CutScene = 'CutScene',
}

export interface ResourceClassification {
  contentKind: string;
  category: string;
  type: string;
  subtype: string | null;
}

export interface ResourceFilterData {
  resourceType?: ResourceType;
  contentKind?: string;
  category?: string;
  searchText?: string;
  ownerId?: string;
  isPublic?: boolean;
  isPublished?: boolean;
  skip?: number;
  take?: number;
}

export interface ResourceFilterResponse {
  items: MediaResource[];
  totalCount: number;
  skip: number;
  take: number;
}

export interface MediaResource {
  id: string;
  description: string | null;
  features: Record<string, string[]>;
  resourceType: ResourceType;
  classification: ResourceClassification | null;
  path: string;
  contentType: string;
  fileName: string;
  fileLength: number;
  thumbnailPath: string | null;
  size: { width: number; height: number };
  duration: string;
  ownerId: string;
  isPublished: boolean;
  isPublic: boolean;
}

/** @deprecated Use resourceType instead */
export type MediaResourceWithLegacyType = MediaResource & { type: ResourceType };

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
  Wall = 0,
  Door = 1,
  Window = 2,
}

export enum SegmentState {
  Open = 0,
  Closed = 1,
  Locked = 2,
  Secret = 3,
}

export enum LightSourceType {
  Natural = 0,
  Artificial = 1,
  Supernatural = 2,
}

export enum RegionType {
  Elevation = 0,
  Terrain = 1,
  Illumination = 2,
  FogOfWar = 3,
}

export interface EncounterWallSegment {
  index: number;
  name?: string;
  startPole: Pole;
  endPole: Pole;
  type: SegmentType;
  isOpaque: boolean;
  state: SegmentState;
}

export interface EncounterWall {
  index: number;
  name: string;
  segments: EncounterWallSegment[];
}

export interface PlacedWall extends EncounterWall {
  id: string;
}

export interface EncounterRegion {
  encounterId: string;
  index: number;
  name: string;
  type: string;
  vertices: Point[];
  value?: number;
  label?: string;
  color?: string;
}

export interface PlacedRegion extends EncounterRegion {
  id: string;
}

export interface EncounterLightSource {
  index: number;
  name?: string;
  type: LightSourceType;
  position: Point;
  range: number;
  direction?: number;
  arc?: number;
  color?: string;
  isOn: boolean;
}

export interface EncounterSoundSource {
  index: number;
  name?: string;
  position: Point;
  range: number;
  resourceId?: string;
  isPlaying: boolean;
}

export interface PlacedLightSource extends EncounterLightSource {
  id: string;
}

export interface PlacedSoundSource extends EncounterSoundSource {
  id: string;
}
