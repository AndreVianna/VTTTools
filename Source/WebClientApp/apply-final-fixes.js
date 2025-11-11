const fs = require('fs');
const path = require('path');

// Fix 1: CampaignDetailPage - Use proper initialization pattern
const campaignFile = 'src/features/content-library/pages/CampaignDetailPage.tsx';
let campaignContent = fs.readFileSync(campaignFile, 'utf8');
campaign Content = campaignContent.replace(
    /import { useState, useEffect, useCallback, useRef } from 'react';/,
    "import { useState, useEffect, useCallback, useMemo } from 'react';"
);
campaignContent = campaignContent.replace(
    /const \[name, setName\] = useState\(''\);[\s\S]*?const isInitialized = campaign !== undefined && initializedId === campaign\.id;/,
    `const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [adventureToDelete, setAdventureToDelete] = useState<{ id: string; name: string } | null>(null);

    const isInitialized = useMemo(() => campaign !== undefined, [campaign]);

    useEffect(() => {
        if (campaign && !isInitialized) {
            return;
        }
        if (campaign) {
            setName(campaign.name);
            setDescription(campaign.description);
            setIsPublished(campaign.isPublished);
        }
    }, [campaign, isInitialized]);`
);
fs.writeFileSync(campaignFile, campaignContent);

console.log('Fixed CampaignDetailPage.tsx');

// Fix 2: EpicDetailPage - Same pattern
const epicFile = 'src/features/content-library/pages/EpicDetailPage.tsx';
let epicContent = fs.readFileSync(epicFile, 'utf8');
epicContent = epicContent.replace(
    /import { useState, useEffect, useCallback, useRef } from 'react';/,
    "import { useState, useEffect, useCallback, useMemo } from 'react';"
);
epicContent = epicContent.replace(
    /const initializedIdRef = useRef<string \| null>\(null\);[\s\S]*?const isInitialized = epic !== undefined && initializedIdRef\.current === epic\.id;/,
    `const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState<{ id: string; name: string } | null>(null);

    const isInitialized = useMemo(() => epic !== undefined, [epic]);

    useEffect(() => {
        if (epic && !isInitialized) {
            return;
        }
        if (epic) {
            setName(epic.name);
            setDescription(epic.description);
            setIsPublished(epic.isPublished);
        }
    }, [epic, isInitialized]);`
);
fs.writeFileSync(epicFile, epicContent);

console.log('Fixed EpicDetailPage.tsx');

// Fix 3: TokenDragHandle - Add stageRef to dependencies
const tokenFile = 'src/components/encounter/TokenDragHandle.tsx';
let tokenContent = fs.readFileSync(tokenFile, 'utf8');
tokenContent = tokenContent.replace(
    /\}, \[enableDragMove, placedAssets, stageReady,/,
    '}, [stageRef, enableDragMove, placedAssets, stageReady,'
);
fs.writeFileSync(tokenFile, tokenContent);

console.log('Fixed TokenDragHandle.tsx');

// Fix 4: EncounterEditorPage - Add empty dependency array
const encounterFile = 'src/pages/EncounterEditorPage.tsx';
let encounterContent = fs.readFileSync(encounterFile, 'utf8');
encounterContent = encounterContent.replace(
    /useEffect\(\(\) => \{[\s]*const stage = canvasRef\.current\?\.getStage\(\);[\s\S]*?\}\);[\s]*$/m,
    `useEffect(() => {
        const stage = canvasRef.current?.getStage();

        if (stage && stage !== stageRef.current) {
            stageRef.current = stage;
            layerManager.initialize(stage);
            layerManager.enforceZOrder();
            setStageReady(true);
        }
    }, []);`
);
fs.writeFileSync(encounterFile, encounterContent);

console.log('Fixed EncounterEditorPage.tsx');

console.log('All lint fixes applied!');
