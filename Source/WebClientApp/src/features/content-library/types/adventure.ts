export enum AdventureStyle {
  Generic = 0,
  OpenWorld = 1,
  DungeonCrawl = 2,
  HackNSlash = 3,
  Survival = 4,
  GoalDriven = 5,
  RandomlyGenerated = 6,
}

export type {
  Adventure,
  CreateAdventureRequest,
  UpdateAdventureRequest,
} from '@/types/domain';
