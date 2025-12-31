export enum AdventureStyle {
  Generic = 'Generic',
  OpenWorld = 'OpenWorld',
  DungeonCrawl = 'DungeonCrawl',
  HackNSlash = 'HackNSlash',
  Survival = 'Survival',
  GoalDriven = 'GoalDriven',
  RandomlyGenerated = 'RandomlyGenerated',
}

export type {
  Adventure,
  CreateAdventureRequest,
  UpdateAdventureRequest,
} from '@/types/domain';
