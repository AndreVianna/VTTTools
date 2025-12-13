import { AssetKind, type BulkAssetGenerationItem } from '@/types/jobs';

export interface ItemValidationErrors {
    name?: string;
    kind?: string;
    category?: string;
    type?: string;
    size?: string;
}

export interface ValidationState {
    itemErrors: Map<number, ItemValidationErrors>;
    hasErrors: boolean;
}

const VALID_SIZES = ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'];

export function validateItem(item: BulkAssetGenerationItem): ItemValidationErrors {
    const errors: ItemValidationErrors = {};

    if (!item.name || item.name.trim() === '') {
        errors.name = 'Name is required';
    }

    if (!item.kind || !Object.values(AssetKind).includes(item.kind) || item.kind === AssetKind.Undefined) {
        errors.kind = 'Kind is required';
    }

    if (!item.category || item.category.trim() === '') {
        errors.category = 'Category is required';
    }

    if (!item.type || item.type.trim() === '') {
        errors.type = 'Type is required';
    }

    if (!item.size || !VALID_SIZES.includes(item.size.toLowerCase())) {
        errors.size = `Size must be: ${VALID_SIZES.join(', ')}`;
    }

    return errors;
}

export function validateItems(items: BulkAssetGenerationItem[]): ValidationState {
    const itemErrors = new Map<number, ItemValidationErrors>();
    let hasErrors = false;

    items.forEach((item, index) => {
        const errors = validateItem(item);
        if (Object.keys(errors).length > 0) {
            itemErrors.set(index, errors);
            hasErrors = true;
        }
    });

    return { itemErrors, hasErrors };
}

export function hasItemErrors(errors: ItemValidationErrors): boolean {
    return Object.keys(errors).length > 0;
}

export function getErrorMessages(errors: ItemValidationErrors): string[] {
    return Object.values(errors).filter((e): e is string => !!e);
}

export interface ImportResult {
    items: BulkAssetGenerationItem[];
    generatePortrait: boolean;
    generateToken: boolean;
    parseError?: string;
}

export function parseImportedJson(json: unknown): ImportResult {
    let generatePortrait = true;
    let generateToken = true;

    if (!json || typeof json !== 'object') {
        return { items: [], generatePortrait, generateToken, parseError: 'Invalid JSON structure' };
    }

    const data = json as Record<string, unknown>;

    if (!Array.isArray(data.items)) {
        return { items: [], generatePortrait, generateToken, parseError: 'Missing or invalid "items" array' };
    }

    if (data.items.length === 0) {
        return { items: [], generatePortrait, generateToken, parseError: 'At least 1 item is required' };
    }

    if (data.items.length > 100) {
        return { items: [], generatePortrait, generateToken, parseError: 'Maximum 100 items allowed' };
    }

    if (typeof data.generatePortrait === 'boolean') {
        generatePortrait = data.generatePortrait;
    }
    if (typeof data.generateToken === 'boolean') {
        generateToken = data.generateToken;
    }

    const items: BulkAssetGenerationItem[] = data.items.map((item: unknown) => {
        const itemObj = (item as Record<string, unknown>) ?? {};
        return {
            name: (itemObj.name as string) ?? '',
            kind: Object.values(AssetKind).includes(itemObj.kind as AssetKind)
                ? (itemObj.kind as AssetKind)
                : AssetKind.Undefined,
            category: (itemObj.category as string) ?? '',
            type: (itemObj.type as string) ?? '',
            subtype: itemObj.subtype as string | undefined,
            size: VALID_SIZES.includes(((itemObj.size as string) ?? '').toLowerCase())
                ? ((itemObj.size as string) ?? 'medium').toLowerCase()
                : 'medium',
            environment: itemObj.environment as string | undefined,
            description: (itemObj.description as string | undefined) ?? '',
            tags: Array.isArray(itemObj.tags) ? (itemObj.tags as string[]) : [],
        };
    });

    return { items, generatePortrait, generateToken };
}
