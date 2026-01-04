import { authHandlers } from './auth';
import { encounterHandlers } from './encounter';
import { stageHandlers } from './stage';
import { assetsHandlers } from './assets';

export const handlers = [
    ...authHandlers,
    ...encounterHandlers,
    ...stageHandlers,
    ...assetsHandlers,
];
