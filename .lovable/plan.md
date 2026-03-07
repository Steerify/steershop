

# Plan: Client-Side Video Compression Before Upload

## Approach
Use the browser-native **Canvas + MediaRecorder API** to re-encode videos at a lower bitrate before uploading. No external libraries needed.

## How It Works
1. User selects a video file
2. A hidden `<video>` element loads the file
3. A `<canvas>` captures frames from the video and pipes them through `MediaRecorder` at a reduced bitrate (e.g., 1 Mbps video)
4. The compressed output (WebM) is uploaded instead of the original file
5. Progress UI shows "Compressing..." then "Uploading..."

## Changes

### `src/components/VideoUpload.tsx`
- Add a `compressVideo(file: File): Promise<Blob>` helper function that:
  - Creates an offscreen `<video>` element, loads the file as an object URL
  - Draws frames to a canvas using `requestAnimationFrame`
  - Records via `MediaRecorder` with `videoBitsPerSecond: 1_000_000` (1 Mbps)
  - Returns the compressed blob once the video ends
- Update `handleFileChange` to:
  - Show "Compressing..." state with progress
  - Call `compressVideo(file)` before uploading
  - Upload the compressed blob (as `.webm`) instead of the original file
- Update progress text to show compression vs upload phases
- Add a fallback: if compression fails (unsupported codec), upload the original file as-is

### Compression Settings
- **Video bitrate**: 1 Mbps (produces roughly 7.5 MB per minute)
- **Resolution**: Scale down to max 720p if original is larger
- **Output format**: WebM (best browser support for MediaRecorder)

### No other files need changes
The upload path logic and Products.tsx integration remain the same.

