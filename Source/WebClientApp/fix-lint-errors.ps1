# Fix useCanvasReadyState.ts - Convert setState in effect to derived state
$file = "src/pages/EncounterEditor/hooks/useCanvasReadyState.ts"
$content = Get-Content $file -Raw
$content = $content -replace 'export const useCanvasReadyState = \(\{ stageRef \}: UseCanvasReadyStateProps\) => \{[\s\S]*?return \{[\s\S]*?\};[\s\S]*?\};', @'
export const useCanvasReadyState = ({ stageRef }: UseCanvasReadyStateProps) => {
    const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
    const [handlersReady, setHandlersReady] = useState<boolean>(false);

    const isEncounterReady = Boolean(stageRef.current) && imagesLoaded && handlersReady;

    const handleImagesLoaded = useCallback(() => {
        setImagesLoaded(true);
    }, []);

    const handleHandlersReady = useCallback(() => {
        setHandlersReady(true);
    }, []);

    return {
        isEncounterReady,
        handleImagesLoaded,
        handleHandlersReady
    };
};
'@
Set-Content $file -Value $content -NoNewline

# Fix TokenDragHandle.tsx - Add stageRef to dependencies
$file = "src/components/encounter/TokenDragHandle.tsx"
$content = Get-Content $file -Raw
$content = $content -replace '\], \[enableDragMove, placedAssets, stageReady,', '], [stageRef, enableDragMove, placedAssets, stageReady,'
Set-Content $file -Value $content -NoNewline

# Fix EncounterEditorPage.tsx - Add assetManagement and fix missing dependency array
$file = "src/pages/EncounterEditorPage.tsx"
$content = Get-Content $file -Raw
$content = $content -replace '    useEffect\(\(\) => \{[\s\S]*?const stage = canvasRef\.current\?\.getStage\(\);[\s\S]*?\}\);', @'
    useEffect(() => {
        const stage = canvasRef.current?.getStage();

        if (stage && stage !== stageRef.current) {
            stageRef.current = stage;
            layerManager.initialize(stage);
            layerManager.enforceZOrder();
            setStageReady(true);
        }
    }, []);
'@
Set-Content $file -Value $content -NoNewline

Write-Host "All lint fixes applied!"
