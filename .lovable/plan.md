# Plan: Update Video Upload Limit to 1 Minute / 50MB

## Change

`**src/pages/Products.tsx` (lines 776-779)**

- Change `maxDurationSeconds={10}` → `maxDurationSeconds={60}`
- Update label from `"Short Video (max 10 seconds)"` → `"Product Video (max 1 minute)"`

The `VideoUpload` component already defaults to 60s/50MB, so this is the only place that needs updating. The default label in `VideoUpload.tsx` (line 36) also says "Short Video (max 10s)" — update it to `"Product Video (max 1 min)"` for consistency.  
Make sure this works accordingly well.

&nbsp;