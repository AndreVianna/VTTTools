#!/bin/bash

# Fix 1: useCanvasReadyState - Use queueMicrotask to avoid setState in effect warning
sed -i '/if (stageRef.current && imagesLoaded && handlersReady && !isEncounterReady) {/,/}/ {
    s/setIsEncounterReady(true);/queueMicrotask(() => {\n                setIsEncounterReady(true);\n            });/
}' src/pages/EncounterEditor/hooks/useCanvasReadyState.ts

# Fix 2: EncounterEditorPage - Add missing assetManagement dependency
sed -i '438s/}, \[encounterId, encounter, updateEncounterAsset\]);/}, [encounterId, encounter, assetManagement, updateEncounterAsset]);/' src/pages/EncounterEditorPage.tsx

# Fix 3: EncounterEditorPage - Add empty dependency array to setStageReady useEffect
sed -i 's/useEffect(() => {$/useEffect(() => {/; /const stage = canvasRef\.current\?\.getStage();/,/});$/ {
    s/});$/}, []);/
}' src/pages/EncounterEditorPage.tsx

echo "All fixes applied!"
