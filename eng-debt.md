# Engineering Debt

## Image Storage Migration (Task 14)

### Overview
We've migrated image storage from Firebase Storage (base64) to Cloudflare R2. The new system supports both storage backends for backward compatibility.

### Migration Status
- ✅ New logo uploads use R2
- ✅ New colorized logo uploads use R2
- ✅ New vector logo uploads use R2
- ✅ Fallback to Firebase Storage if R2 fails
- ⚠️ Old images remain on Firebase Storage

### Cleanup Tasks

#### 1. Monitor R2 Usage
- Track R2 storage usage and costs
- Monitor upload success rates
- Ensure R2_PUBLIC_URL is properly configured

#### 2. Migrate Existing Images (Optional)
If you want to migrate existing Firebase Storage images to R2:

1. Create a migration script that:
   - Fetches all logos from Firestore
   - Downloads images from Firebase Storage URLs
   - Uploads them to R2
   - Updates Firestore with new R2 URLs

2. Run the migration during a maintenance window

3. Verify all images are accessible after migration

4. Consider keeping Firebase Storage images as backup for a grace period

#### 3. Remove Firebase Storage Fallback (Future)
Once confident in R2 stability:
- Remove `uploadDataUriToStorageClient` calls
- Remove Firebase Storage fallback logic
- Update error handling to only use R2

#### 4. Update Image Display Logic
- Ensure all image components handle both Firebase Storage and R2 URLs
- Add URL validation if needed
- Consider adding image proxy for consistent access

#### 5. Environment Variables
Ensure these are set:
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL` (public domain for R2 bucket)

### Files Modified
- `src/lib/r2-upload.ts` - New R2 upload function
- `src/lib/r2-upload-client.ts` - Client wrapper
- `src/app/brands/[brandId]/page.tsx` - Updated logo generation, colorization, vectorization

### Files to Review
- `src/lib/client-storage.ts` - Can be deprecated after migration
- `src/lib/storage.ts` - Can be deprecated after migration
- All components that display images should handle both URL types

### Testing Checklist
- [ ] New logo generation uploads to R2
- [ ] Colorized logos upload to R2
- [ ] Vector logos upload to R2
- [ ] Fallback to Firebase works if R2 fails
- [ ] Old Firebase Storage images still display correctly
- [ ] R2 URLs are publicly accessible
- [ ] Image loading performance is acceptable

