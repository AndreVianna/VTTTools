import { AssetKind, type BulkAssetGenerationRequest } from '@/types/jobs';

export const downloadBulkGenerationTemplate = (): void => {
    const template: BulkAssetGenerationRequest = {
        items: [
            {
                name: 'Ancient Red Dragon',
                kind: AssetKind.Creature,
                category: 'Fantasy',
                type: 'Dragon',
                subtype: 'Red Dragon',
                size: 'huge',
                environment: 'Mountain',
                description: 'A fearsome ancient red dragon with glowing scales and smoke billowing from its nostrils.',
                tags: ['dragon', 'fire', 'boss'],
            },
            {
                name: 'Goblin Scout',
                kind: AssetKind.Creature,
                category: 'Fantasy',
                type: 'Goblin',
                subtype: undefined,
                size: 'small',
                environment: undefined,
                description: 'A sneaky goblin scout with a crude dagger and leather armor.',
                tags: ['goblin', 'scout'],
            },
        ],
        generatePortrait: true,
        generateToken: true,
    };

    const jsonContent = JSON.stringify(template, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'bulk_asset_generation_template.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
