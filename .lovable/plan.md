# Plan: Remove Video Size/Duration Limitations

## Problem

The duration validation (`validateVideoDuration`) is failing for valid videos because some formats don't reliably report metadata duration in the browser. The user wants these restrictions removed.

## Changes

### `src/components/VideoUpload.tsx`

- Remove the file size validation check (lines 62-66)
- Remove the duration validation check (lines 68-75) and the `validateVideoDuration` helper function (lines 18-32)
- Remove `maxDurationSeconds` and `maxSizeMB` props from the interface
- Update the upload area text from "max 60s, 50MB" to just "MP4, WebM or MOV"
- Update default label to `"Product Video"`

### `src/pages/Products.tsx`

- Remove `maxDurationSeconds={60}` prop from `<VideoUpload>`
- Update label to `"Product Video"`

### Database

- Remove the bucket file size limit so any size is accepted:

```sql
UPDATE storage.buckets SET file_size_limit = NULL WHERE id = 'product-videos';
```