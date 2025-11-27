// TypeScript types matching existing Domain layer API contracts

// Common types
export interface User {
  id: string;
  email: string;
  userName?: string;
  name: string;
  displayName: string;
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

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

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

export interface PlacedAsset {
  id: string;
  assetId: string;
  asset: Asset;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  layer: string;
  index: number;
  number: number;
  name: string;
  visible: boolean;
  locked: boolean;
  labelVisibility: LabelVisibility;
  labelPosition: LabelPosition;
}

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

export interface StatBlock {
  id: string;
  name: string;
  createdAt: string;
}

export interface CreateAdventureRequest {
  name: string;
  description: string;
  style: AdventureStyle;
  isOneShot?: boolean;
  campaignId?: string;
  backgroundId?: string;
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

export interface CreateWorldRequest {
  name: string;
  description: string;
  backgroundId?: string;
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

export interface CreateCampaignRequest {
  name: string;
  description: string;
  backgroundId?: string;
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
  backgroundId?: string;
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
  };
  stage: {
    background: MediaResource | null;
    zoomLevel: number;
    panning: { x: number; y: number };
  };
  assets: EncounterAsset[];
  walls: EncounterWall[];
  openings: EncounterOpening[];
  regions: EncounterRegion[];
  sources: EncounterSource[];
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
  Document = 'Document',
}

export interface MediaResource {
  id: string;
  description: string | null;
  features: Record<string, string[]>;
  type: ResourceType;
  path: string;
  contentType: string;
  fileName: string;
  fileLength: number;
  size: { width: number; height: number };
  duration: string;
  ownerId: string;
  isPublished: boolean;
  isPublic: boolean;
}

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
  name: string;
  displayName: string;
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

export interface Point {
  x: number;
  y: number;
}

export interface Pole {
  x: number;
  y: number;
  h: number;
}

export enum WallVisibility {
  Normal = 0,
  Fence = 1,
  Invisible = 2,
  Veil = 3,
}

export interface EncounterWall {
  encounterId: string;
  index: number;
  name: string;
  poles: Pole[];
  visibility: WallVisibility;
  isClosed: boolean;
  color?: string | undefined;
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

export interface EncounterSource {
  encounterId: string;
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

export interface PlacedSource extends EncounterSource {
  id: string;
}

export enum OpeningVisibility {
  Visible = 0,
  Secret = 1,
  Concealed = 2,
}

export enum OpeningState {
  Open = 0,
  Closed = 1,
  Locked = 2,
  Barred = 3,
  Destroyed = 4,
  Jammed = 5,
}

export enum OpeningOpacity {
  Opaque = 0,
  Translucent = 1,
  Transparent = 2,
  Ethereal = 3,
}

export interface EncounterOpening {
  encounterId: string;
  index: number;
  name: string;
  description?: string;
  type: string;
  wallIndex: number;
  startPoleIndex: number;
  endPoleIndex: number;
  width: number;
  height: number;
  visibility: OpeningVisibility;
  state: OpeningState;
  opacity: OpeningOpacity;
  material?: string;
  color?: string;
}

export interface PlacedOpening extends EncounterOpening {
  id: string;
}
