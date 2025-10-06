// TypeScript types matching existing Domain layer API contracts

// Common types
export interface User {
  id: string;
  email: string;
  userName: string;
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

// Asset behavioral categories - determines placement and interaction rules
export enum AssetCategory {
  Static = 'Static',    // Structural/environmental, locked in place (walls, doors, terrain, light sources)
  Passive = 'Passive',  // Manipulable objects (furniture, items, containers)
  Active = 'Active'     // Autonomous entities with actions (characters, NPCs, monsters)
}

export interface CreateAssetRequest {
  type: AssetType;
  category: AssetCategory;
  name: string;
  description: string;
  resourceId?: string; // Guid? - Optional reference to Resource (image/sound/video)
}

export interface UpdateAssetRequest {
  name?: string;
  description?: string;
  type?: AssetType;
  category?: AssetCategory;
  resourceId?: string;
}

export enum AssetType {
  Placeholder = 'Placeholder',
  Creature = 'Creature',
  Character = 'Character',
  NPC = 'NPC',
  Object = 'Object',
  Wall = 'Wall',
  Door = 'Door',
  Window = 'Window',
  Overlay = 'Overlay',
  Elevation = 'Elevation',
  Effect = 'Effect',
  Sound = 'Sound',
  Music = 'Music',
  Vehicle = 'Vehicle',
  Token = 'Token'
}

export interface Asset {
  id: string;
  type: AssetType;
  category: AssetCategory;
  name: string;
  description: string;
  resource?: MediaResource;  // Optional media resource (image/sound/video)
  createdAt: string;
  updatedAt: string;
}

// Placed Asset - Frontend-only type for local placement state
export interface PlacedAsset {
  id: string;           // Unique instance ID (frontend-generated)
  assetId: string;      // Reference to Asset template
  asset: Asset;         // Full asset data (for image URL and metadata)
  position: { x: number; y: number };  // Center position in stage coordinates
  size: { width: number; height: number };
  rotation: number;     // Degrees
  layer: string;        // Layer name (Structure | Objects | Agents)
}

// Adventures (from Domain.Library.Adventures.ApiContracts)
export interface CreateAdventureRequest {
  name: string;           // [MaxLength(128)]
  description: string;    // [MaxLength(1024)]
  type: AdventureType;
  campaignId?: string;    // Guid?
  backgroundId?: string;  // Guid?
}

export interface UpdateAdventureRequest {
  name?: string;
  description?: string;
  type?: AdventureType;
  campaignId?: string;
  backgroundId?: string;
}

export enum AdventureType {
  OneShot = 'OneShot',
  Campaign = 'Campaign',
  Tutorial = 'Tutorial'
}

export interface Adventure {
  id: string;
  name: string;
  description: string;
  type: AdventureType;
  campaignId?: string;
  backgroundId?: string;
  createdAt: string;
  updatedAt: string;
}

// Scenes (from Domain.Library.Scenes.ApiContracts)
export interface CreateSceneRequest {
  name: string;
  description: string;
  backgroundImageUrl?: string;
  gridType: GridType;
  gridSize: number;
  width: number;
  height: number;
}

export interface UpdateSceneRequest {
  name?: string;
  description?: string;
  backgroundImageUrl?: string;
  gridType?: GridType;
  gridSize?: number;
  width?: number;
  height?: number;
}

export enum GridType {
  Square = 'Square',
  Hexagonal = 'Hexagonal',
  None = 'None'
}

export interface Scene {
  id: string;
  adventureId: string;
  name: string;
  description: string;
  backgroundImageUrl?: string;
  gridType: GridType;
  gridSize: number;
  width: number;
  height: number;
  assets: SceneAsset[];
  createdAt: string;
  updatedAt: string;
}

export interface SceneAsset {
  id: string;
  sceneId: string;
  assetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  layer: number;
  visible: boolean;
  locked: boolean;
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
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;           // Maps to backend Name property
  displayName?: string;   // Optional display name
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
  userName?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
}