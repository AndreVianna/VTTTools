Async Media Processing with SignalR Notifications

Summary

Implement async background processing for media uploads with real-time SignalR notifications. Upload returns immediately, processing happens in
background, frontend updates via SignalR as each stage completes.

---
Resource Artifacts

Each resource can have up to 4 file artifacts:
┌───────────┬─────────────────────────────────────────────────┬───────────────────────────┬────────────────┐
│ Artifact  │                   Description                   │          Format           │  Path Example  │
├───────────┼─────────────────────────────────────────────────┼───────────────────────────┼────────────────┤
│ Original  │ User's uploaded file                            │ Varies (webm, jpeg, etc.) │ {id}.webm      │
├───────────┼─────────────────────────────────────────────────┼───────────────────────────┼────────────────┤
│ Primary   │ Converted/optimized file for serving            │ MP4, PNG, OGG             │ {id}.mp4       │
├───────────┼─────────────────────────────────────────────────┼───────────────────────────┼────────────────┤
│ Proxy     │ First frame at original dimensions (video only) │ PNG                       │ {id}.png       │
├───────────┼─────────────────────────────────────────────────┼───────────────────────────┼────────────────┤
│ Thumbnail │ 256x256 center-cropped square                   │ PNG                       │ {id}_thumb.png │
└───────────┴─────────────────────────────────────────────────┴───────────────────────────┴────────────────┘
Resource metadata fields:
- FileName = original filename with original extension (e.g., background.webm)
- ContentType = Primary content type (e.g., video/mp4)

Deriving file paths:
- Original: {id} + extension from FileName
- Primary: {id} + extension from ContentType
- Proxy: {id}.png (always PNG)
- Thumbnail: {id}_thumb.png (always PNG)

When Original = Primary (e.g., mp4 or png upload): same file, no duplication.

---
Processing Workflows

Video (webm, ogg)

1. Upload → Save original → Return with Pending status
2. Background: Extract Proxy (first frame PNG) → Save → SignalR ProxyReady
3. Background: Generate Thumbnail (256x256) → Save → SignalR ThumbnailReady
4. Background: Convert to Primary (MP4) → Save → SignalR Complete

Video (mp4) - already optimal format

1. Upload → Save as both Original and Primary → Return with Pending status
2. Background: Extract Proxy → Save → SignalR ProxyReady
3. Background: Generate Thumbnail → Save → SignalR Complete

Image (jpeg, gif, webp)

1. Upload → Save original → Return with Pending status
2. Background: Convert to Primary (PNG) → Save → SignalR notify
3. Background: Generate Thumbnail → Save → SignalR Complete

Image (png) - already optimal format

1. Upload → Save as Original/Primary/Proxy (same file)
2. Background: Generate Thumbnail only → SignalR Complete

---
Thumbnail Logic (Center-Crop)

1. Determine smaller dimension: size = min(width, height)
2. Calculate crop origin: x = (width - size) / 2, y = (height - size) / 2
3. Crop square from center
4. Resize to 256x256 PNG

---
Backend Changes

New Files
┌────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────┐
│                        File                        │                            Purpose                             │
├────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ Source/Domain/Media/Model/ProcessingStatus.cs      │ Enum: Ready, Pending, ProxyReady, Converting, Complete, Failed │
├────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ Source/Domain/Media/Hubs/IMediaHubClient.cs        │ Task OnProcessingProgress(MediaProcessingEvent)                │
├────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ Source/Domain/Media/Events/MediaProcessingEvent.cs │ Single event with ResourceId, Status, Error?                   │
├────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ Source/Media/Hubs/MediaHub.cs                      │ SignalR hub (Subscribe/Unsubscribe to resource)                │
├────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ Source/Media/Services/MediaEventPublisher.cs       │ Publishes to resource-{id} groups                              │
├────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ Source/Media/Services/MediaProcessingWorker.cs     │ BackgroundService with Channel                                 │
└────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────┘
Modified Files
┌────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────┐
│                      File                      │                                    Changes                                    │
├────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ Source/Domain/Media/Model/ResourceMetadata.cs  │ Add ProcessingStatus                                                          │
├────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ Source/Data/Media/Entities/Resource.cs         │ Add ProcessingStatus, ProcessingError columns                                 │
├────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ Source/Data/Media/Mapper.cs                    │ Map new properties                                                            │
├────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ Source/Media/Services/ResourceService.cs       │ Save raw first, queue processing, return immediately                          │
├────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ Source/Media/Services/MediaProcessorService.cs │ Reorder: Proxy → Thumbnail → Primary; Add center-crop; Keep original FileName │
├────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ Source/Media/Storage/AzureBlobStorage.cs       │ Add methods for saving individual artifacts                                   │
├────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ Source/Media/Program.cs                        │ Register worker, publisher, SignalR hub                                       │
└────────────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────┘
Database Migration

ALTER TABLE Resources ADD ProcessingStatus INT NOT NULL DEFAULT 0;
ALTER TABLE Resources ADD ProcessingError NVARCHAR(512) NULL;

---
Frontend Changes

New Files
┌──────────────────────────────────────┬─────────────────────────────────────────────────┐
│                 File                 │                     Purpose                     │
├──────────────────────────────────────┼─────────────────────────────────────────────────┤
│ src/hooks/useMediaHub.ts             │ Wraps useSignalRHub for media processing events │
├──────────────────────────────────────┼─────────────────────────────────────────────────┤
│ src/hooks/useBackgroundProcessing.ts │ Manages display URL based on processing state   │
└──────────────────────────────────────┴─────────────────────────────────────────────────┘
Modified Files
┌─────────────────────────────────────────────────────┬───────────────────────────────────────┐
│                        File                         │                Changes                │
├─────────────────────────────────────────────────────┼───────────────────────────────────────┤
│ src/types/domain.ts                                 │ Add ProcessingStatus enum             │
├─────────────────────────────────────────────────────┼───────────────────────────────────────┤
│ src/components/encounter/BackgroundLayer.tsx        │ Handle video, show processing overlay │
├─────────────────────────────────────────────────────┼───────────────────────────────────────┤
│ src/components/encounter/panels/BackgroundPanel.tsx │ Show processing indicator             │
├─────────────────────────────────────────────────────┼───────────────────────────────────────┤
│ src/pages/EncounterEditorPage.tsx                   │ Use useBackgroundProcessing hook      │
└─────────────────────────────────────────────────────┴───────────────────────────────────────┘
---
Processing Flow (Simplified)

HTTP POST /api/resources
 ├── Validate file
 ├── Save original to blob: {id}.{originalExt}
 ├── Create DB record: ProcessingStatus = Pending
 ├── Queue resource ID to Channel<Guid>
 └── Return 200 OK with ResourceMetadata

BackgroundWorker (reads from Channel)
 ├── Load resource metadata
 ├── Determine processing type from ContentType
 ├── For video:
 │   ├── Extract first frame → save {id}.png → notify ProxyReady
 │   ├── Generate thumbnail → save {id}_thumb.png
 │   ├── Convert to MP4 → save {id}.mp4 → update ContentType
 │   └── Update status → notify Complete
 ├── For non-PNG image:
 │   ├── Convert to PNG → save {id}.png → update ContentType
 │   ├── Generate thumbnail → save {id}_thumb.png
 │   └── Update status → notify Complete
 └── For PNG:
	 ├── Generate thumbnail → save {id}_thumb.png
	 └── Update status → notify Complete

---
Frontend Display Logic

if (resource is null) → show tavern default
if (status is Pending) → show tavern + "Processing..."
if (status is ProxyReady) → show proxy ({id}.png) + "Converting..."
if (status is Complete/Ready) → show primary (video or image)
if (status is Failed) → show tavern + error message

---
SignalR Pattern (follows JobHub)

Backend:
// Hub
public class MediaHub : Hub<IMediaHubClient> {
 public Task SubscribeToResource(string resourceId)
	 => Groups.AddToGroupAsync(Context.ConnectionId, $"resource-{resourceId}");
}

// Publisher
public class MediaEventPublisher(IHubContext<MediaHub, IMediaHubClient> hub) {
 public Task NotifyAsync(Guid resourceId, ProcessingStatus status)
	 => hub.Clients.Group($"resource-{resourceId}")
		   .OnProcessingProgress(new MediaProcessingEvent { ... });
}

Frontend:
const { subscribeToResource } = useMediaHub({
 onProgress: (event) => {
	 if (event.resourceId === currentResourceId) {
		 updateDisplayState(event.status);
	 }
 }
});

---
Implementation Phases

Phase 1: Domain & Database

1. Add ProcessingStatus enum to Source/Domain/Media/Model/
2. Update ResourceMetadata - add ProcessingStatus property
3. Update Resource entity - add columns
4. Create EF migration
5. Update mappers

Phase 2: Backend Processing Changes

1. Modify MediaProcessorService:
- Reorder: extract proxy first, then thumbnail, then convert
- Add center-crop thumbnail method
- Preserve original FileName (don't change extension)
2. Update AzureBlobStorage - methods for saving individual artifacts
3. Update ResourceService:
- Save original immediately
- Return with Pending status
- Queue for background processing

Phase 3: SignalR & Background Worker

1. Create IMediaHubClient interface
2. Create MediaHub
3. Create MediaEventPublisher
4. Create MediaProcessingWorker (BackgroundService + Channel)
5. Register in Program.cs

Phase 4: Frontend

1. Add ProcessingStatus enum to types
2. Create useMediaHub hook
3. Create useBackgroundProcessing hook
4. Update BackgroundLayer for video + processing overlay
5. Update BackgroundPanel for processing indicator
6. Update EncounterEditorPage

Phase 5: Testing

1. Unit tests for center-crop thumbnail
2. Unit tests for processing order
3. Frontend hook tests
