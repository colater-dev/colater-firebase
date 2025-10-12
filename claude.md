# Brand Canvas

A Next.js application for creating and managing brand identities with AI-powered assistance. Users can generate brand details, taglines, and logos using Firebase and Google's Genkit AI.

## Overview

Brand Canvas helps users craft their brand identity effortlessly by providing:
- Google Sign-in authentication with redirect flow
- Brand creation and management with real-time updates
- AI-powered brand detail suggestions (name, pitch, audience, cues)
- AI-generated taglines (3 per generation)
- AI-generated logos with colorization and hue shifting
- Firebase Firestore for data persistence
- Firebase Storage for asset management
- Real-time color palette manipulation

## Tech Stack

- **Framework**: Next.js 15.3.3 (App Router, Turbopack)
- **Language**: TypeScript 5+ (strict mode enabled)
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.4 with shadcn/ui components
- **Backend**: Firebase (Firestore, Auth, Storage)
- **AI**: Google Genkit 1.20 with Google Generative AI
- **Forms**: React Hook Form 7.54 with Zod 3.24 validation
- **State Management**: React Context (Firebase Provider)
- **Build Tool**: Next.js with Turbopack

## Architecture

### Feature-Based Organization

The codebase follows a feature-based architecture with clear separation of concerns:

- **`features/`** - Feature modules with co-located components and hooks
- **`services/`** - Business logic and data access layer
- **`app/`** - Next.js app router pages (thin presentation layer)
- **`components/`** - Shared UI components
- **`lib/`** - Shared utilities and type definitions

### Key Architectural Decisions

1. **Service Layer Pattern**: Firestore operations abstracted behind service classes
2. **Auth Guard Hook**: Standardized authentication checks with `useRequireAuth`
3. **Component Extraction**: Large pages broken into focused, testable components
4. **Type Safety**: Full TypeScript coverage with no ignored errors
5. **Memoization**: Firebase queries and service instances memoized for performance

## Project Structure

```
src/
├── ai/                          # AI flow definitions using Genkit
│   ├── flows/
│   │   ├── colorize-logo.ts     # Logo colorization flow
│   │   ├── generate-brand-details.ts  # Brand detail generation
│   │   ├── generate-logo.ts     # Logo generation flow
│   │   └── generate-tagline.ts  # Tagline generation flow
│   ├── dev.ts                   # Genkit development server
│   └── genkit.ts                # Genkit configuration
│
├── app/                         # Next.js app router pages (presentation layer)
│   ├── brands/
│   │   ├── [brandId]/
│   │   │   └── page.tsx         # Brand detail page (365 lines - refactored!)
│   │   └── new/
│   │       └── page.tsx         # New brand creation form
│   ├── dashboard/
│   │   └── page.tsx             # User dashboard with brand list
│   ├── actions.ts               # Server actions for AI operations
│   ├── layout.tsx               # Root layout with Firebase provider
│   ├── page.tsx                 # Landing page with Google sign-in
│   ├── globals.css              # Global styles
│   └── favicon.ico
│
├── features/                    # Feature-based modules
│   ├── auth/
│   │   └── hooks/
│   │       ├── use-require-auth.tsx  # Auth guard hook
│   │       └── index.ts
│   └── brands/
│       └── components/
│           ├── brand-header.tsx        # Brand info display
│           ├── brand-identity-card.tsx # Logo & tagline card (178 lines)
│           ├── taglines-list.tsx       # Taglines management (84 lines)
│           └── index.ts
│
├── services/                    # Business logic / data access layer
│   ├── brand.service.ts         # Brand CRUD operations (114 lines)
│   ├── tagline.service.ts       # Tagline operations (118 lines)
│   ├── logo.service.ts          # Logo operations (101 lines)
│   └── index.ts
│
├── components/
│   ├── ui/                      # shadcn/ui components (35+ components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── form.tsx
│   │   ├── toast.tsx
│   │   └── ... (30+ more)
│   ├── FirebaseErrorListener.tsx  # Error handling component
│   └── user-chip.tsx            # User profile chip
│
├── firebase/                    # Firebase configuration and utilities
│   ├── firestore/
│   │   ├── use-collection.tsx   # Firestore collection hook
│   │   └── use-doc.tsx          # Firestore document hook
│   ├── client-provider.tsx      # Client-side Firebase initialization
│   ├── config.ts                # Firebase configuration
│   ├── error-emitter.ts         # Error event emitter
│   ├── errors.ts                # Custom error classes
│   ├── index.ts                 # Public Firebase API exports
│   ├── non-blocking-login.tsx   # Non-blocking login component
│   ├── non-blocking-updates.tsx # Non-blocking updates component
│   ├── provider.tsx             # Firebase context provider (190 lines)
│   └── server.ts                # Server-side Firebase utilities
│
├── hooks/
│   ├── use-mobile.tsx           # Mobile detection hook
│   └── use-toast.ts             # Toast notification hook
│
└── lib/
    ├── color-utils.ts           # Color conversion utilities (HSL, RGB, HEX)
    ├── placeholder-images.ts    # Placeholder image utilities
    ├── storage.ts               # Firebase Storage utilities
    ├── types.ts                 # TypeScript type definitions
    └── utils.ts                 # Utility functions (cn, etc.)
```

## Core Concepts

### 1. Service Layer Pattern

The service layer provides a clean abstraction over Firestore operations, encapsulating path construction and CRUD operations.

#### BrandService

**Location**: `src/services/brand.service.ts`

```typescript
import { createBrandService } from '@/services';

const brandService = useMemo(() => createBrandService(firestore), [firestore]);

// Create a new brand
const brandId = await brandService.createBrand(userId, {
  latestName: 'My Brand',
  latestElevatorPitch: 'A revolutionary product...',
  latestAudience: 'Tech-savvy millennials',
  latestDesirableCues: 'modern, sleek, professional',
  latestUndesirableCues: 'dated, cluttered',
});

// Get brands collection reference
const brandsCollection = brandService.getBrandsCollection(userId);

// Get brands query (ordered by creation date)
const brandsQuery = brandService.getBrandsQuery(userId);

// Get brand document reference
const brandDoc = brandService.getBrandDoc(userId, brandId);

// Update brand
await brandService.updateBrand(userId, brandId, {
  latestName: 'New Name'
});

// Update logo
await brandService.updateBrandLogo(userId, brandId, logoUrl);

// Update tagline
await brandService.updateBrandTagline(userId, brandId, tagline);

// Delete brand
await brandService.deleteBrand(userId, brandId);
```

**Benefits**:
- Encapsulates Firestore path construction
- Type-safe operations
- Consistent error handling
- Easy to test and mock
- DRY principle

#### TaglineService

**Location**: `src/services/tagline.service.ts`

```typescript
const taglineService = useMemo(() => createTaglineService(firestore), [firestore]);

// Create single tagline
const taglineId = await taglineService.createTagline(
  userId,
  brandId,
  'Your perfect tagline'
);

// Create multiple taglines (batch)
const taglineIds = await taglineService.createMultipleTaglines(
  userId,
  brandId,
  ['tagline1', 'tagline2', 'tagline3']
);

// Update tagline status (liked, disliked, generated)
await taglineService.updateTaglineStatus(
  userId,
  brandId,
  taglineId,
  'liked'
);

// Get taglines query
const taglinesQuery = taglineService.getTaglinesQuery(userId, brandId);

// Delete tagline
await taglineService.deleteTagline(userId, brandId, taglineId);
```

#### LogoService

**Location**: `src/services/logo.service.ts`

```typescript
const logoService = useMemo(() => createLogoService(firestore), [firestore]);

// Create logo
const logoId = await logoService.createLogo(userId, brandId, logoUrl);

// Add colorized version with palette
await logoService.updateLogoWithColor(
  userId,
  brandId,
  logoId,
  colorLogoUrl,
  ['#FF5733', '#33FF57', '#3357FF']
);

// Get logos query
const logosQuery = logoService.getLogosQuery(userId, brandId);

// Delete logo
await logoService.deleteLogo(userId, brandId, logoId);
```

### 2. Auth Guard Pattern

The `useRequireAuth` hook standardizes authentication checks and automatic redirects.

**Location**: `src/features/auth/hooks/use-require-auth.tsx`

```typescript
import { useRequireAuth } from '@/features/auth/hooks';

function ProtectedPage() {
  const { user, isLoading } = useRequireAuth();
  // Automatically redirects to home if not authenticated

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // At this point, user is guaranteed to be authenticated
  return (
    <div>
      <h1>Welcome, {user.displayName}!</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

**Benefits**:
- Eliminates repetitive `useEffect` patterns
- Consistent behavior across all protected routes
- Single source of truth for auth requirements
- Cleaner component code

**Before**:
```typescript
const { user, isUserLoading } = useUser();
const router = useRouter();

useEffect(() => {
  if (!isUserLoading && !user) {
    router.push('/');
  }
}, [user, isUserLoading, router]);

if (isUserLoading) return <LoadingSpinner />;
```

**After**:
```typescript
const { user, isLoading } = useRequireAuth();

if (isLoading) return <LoadingSpinner />;
```

### 3. Component Extraction

The brand detail page was refactored from 599 lines to 365 lines by extracting three focused components.

#### BrandHeader

**Location**: `src/features/brands/components/brand-header.tsx`

Displays brand name, elevator pitch, target audience, and visual cues.

```typescript
<BrandHeader brand={brand} />
```

#### BrandIdentityCard

**Location**: `src/features/brands/components/brand-identity-card.tsx` (178 lines)

Manages logo display, colorization, hue shifting, and logo pagination.

```typescript
<BrandIdentityCard
  brandName={brand.latestName}
  primaryTagline={primaryTagline}
  logos={logos}
  currentLogoIndex={currentLogoIndex}
  isLoadingLogos={isLoadingLogos}
  isGeneratingLogo={isGeneratingLogo}
  isColorizing={isColorizing}
  isLoadingTaglines={isLoadingTaglines}
  onGenerateLogo={handleGenerateLogo}
  onColorizeLogo={handleColorizeLogo}
  onLogoIndexChange={setCurrentLogoIndex}
/>
```

**Features**:
- Logo display with B&W/Color toggle
- Hue shifting with slider (0-360 degrees)
- Real-time color palette display
- Logo pagination (previous/next)
- Self-contained state management

#### TaglinesList

**Location**: `src/features/brands/components/taglines-list.tsx` (84 lines)

Displays taglines with like/dislike actions and generation UI.

```typescript
<TaglinesList
  taglines={visibleTaglines}
  isLoading={isLoadingTaglines}
  isGenerating={isGeneratingTaglines}
  onGenerate={handleGenerateTaglines}
  onStatusUpdate={handleTaglineStatusUpdate}
/>
```

**Features**:
- Tagline list with hover actions
- Like (star) / Dislike (trash) buttons
- Generate new taglines button
- Loading and empty states

### 4. Color Utilities

**Location**: `src/lib/color-utils.ts`

Extracted color conversion functions for reusability:

```typescript
import { hslToRgb, rgbToHsl, hexToRgb, rgbToHex, shiftHue } from '@/lib/color-utils';

// Convert HEX to RGB
const rgb = hexToRgb('#FF5733'); // { r: 255, g: 87, b: 51 }

// Convert RGB to HSL
const [h, s, l] = rgbToHsl(255, 87, 51); // [0.03, 1, 0.6]

// Shift hue by 120 degrees
const newColor = shiftHue('#FF5733', 120); // '#33FF57'
```

## Data Models

### Brand

**Location**: `src/lib/types.ts`

```typescript
interface Brand {
  id: string;                      // Document ID
  userId: string;                  // Owner's user ID
  createdAt: Timestamp;            // Creation timestamp
  latestName: string;              // Brand name
  latestElevatorPitch: string;     // Brand description
  latestAudience: string;          // Target audience
  latestDesirableCues: string;     // Desired visual cues
  latestUndesirableCues: string;   // Undesired visual cues
  logoUrl?: string;                // Current logo URL
  primaryTagline?: string;         // Selected tagline
}
```

### Tagline

```typescript
interface Tagline {
  id: string;
  brandId: string;
  userId: string;
  tagline: string;
  createdAt: Timestamp;
  status?: 'generated' | 'liked' | 'disliked';
}
```

### Logo

```typescript
interface Logo {
  id: string;
  brandId: string;
  userId: string;
  logoUrl: string;                 // Original/B&W logo URL
  createdAt: Timestamp;
  colorLogoUrl?: string;           // Colorized logo URL
  palette?: string[];              // Color palette (HEX codes)
}
```

### Firestore Structure

```
/users/{userId}
  └── /brands/{brandId}
      ├── /inputVersions/{versionId}        (future use)
      ├── /taglineGenerations/{generationId}
      └── /logoGenerations/{generationId}
```

## Security Model

### Firestore Security Rules

**Location**: `firestore.rules` (145 lines)

The application uses a strict user-ownership model:

1. **All data nested under `/users/{userId}`**
   - No cross-user data access
   - User listing is disabled for privacy

2. **Only authenticated users can access their own data**
   - Helper functions: `isSignedIn()`, `isOwner(userId)`, `isExistingOwner(userId)`

3. **`userId` field denormalized across all documents**
   - Enables efficient authorization checks
   - No need for extra `get()` calls in security rules

4. **Security rule hierarchy**:
   ```
   /users/{userId}                    ← User profile
     └── /brands/{brandId}            ← Brand documents
         ├── /inputVersions/...       ← Brand input versions
         ├── /taglineGenerations/...  ← AI-generated taglines
         └── /logoGenerations/...     ← AI-generated logos
   ```

**Example Rules**:
```javascript
match /users/{userId}/brands/{brandId} {
  allow get: if isOwner(userId);
  allow list: if isOwner(userId);
  allow create: if isOwner(userId) && request.resource.data.userId == userId;
  allow update: if isExistingOwner(userId) && resource.data.userId == userId;
  allow delete: if isExistingOwner(userId);
}
```

## Firebase Integration

### Custom Hooks

**All hooks exported from**: `src/firebase/index.ts`

- **`useFirebase()`** - Access all Firebase services and user state
- **`useAuth()`** - Firebase Auth instance
- **`useFirestore()`** - Firestore instance
- **`useStorage()`** - Firebase Storage instance
- **`useUser()`** - User authentication state (user, isUserLoading, userError)
- **`useCollection<T>(query)`** - Real-time Firestore collection listener
- **`useDoc<T>(docRef)`** - Real-time Firestore document listener
- **`useMemoFirebase<T>(factory, deps)`** - Memoized Firebase objects (queries, refs)

### Firebase Provider Architecture

**Location**: `src/firebase/provider.tsx` (190 lines)

The Firebase context provider manages:

1. **Service Availability**: Tracks if Firebase services are initialized
2. **Auth State**: Real-time user authentication listener (`onAuthStateChanged`)
3. **Loading States**: Separate loading state for user authentication
4. **Error Handling**: Captures and propagates auth errors
5. **Memoization**: Optimized re-renders with `useMemo`

**Provider Setup** (`src/app/layout.tsx`):
```typescript
import { FirebaseProvider } from '@/firebase/provider';
import { firebaseApp, firestore, auth, storage } from '@/firebase/client-provider';

<FirebaseProvider
  firebaseApp={firebaseApp}
  firestore={firestore}
  auth={auth}
  storage={storage}
>
  {children}
</FirebaseProvider>
```

### Error Handling

**Sophisticated error handling system**:

- **`FirebaseErrorListener`** component listens for permission errors
- **`errorEmitter`** broadcasts Firebase errors
- **`FirestorePermissionError`** class for debugging permission issues
- **Non-blocking operations** to prevent UI freezes

**Example Usage**:
```typescript
import { FirestorePermissionError, errorEmitter } from '@/firebase';

try {
  await addDoc(collection, data);
} catch (error) {
  if (error.code === 'permission-denied') {
    const permissionError = new FirestorePermissionError({
      path: collection.path,
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
  }
}
```

## AI Flows (Genkit)

All AI flows are located in `src/ai/flows/` and use Google Genkit with structured outputs (Zod schemas).

### 1. Generate Brand Details

**File**: `src/ai/flows/generate-brand-details.ts`

- **Input**: `{ topic: string }`
- **Output**: `{ name, elevatorPitch, audience, desirableCues, undesirableCues }`
- **Usage**: "Fill for me" button on brand creation form
- **Model**: Google Generative AI

**Example**:
```typescript
const result = await generateBrandDetails({
  topic: 'A coffee shop for developers'
});
// Result: {
//   name: 'DevBrew',
//   elevatorPitch: 'A cozy coffee shop designed for developers...',
//   audience: 'Software developers, tech enthusiasts...',
//   desirableCues: 'modern, tech-inspired, minimalist',
//   undesirableCues: 'corporate, stuffy, traditional'
// }
```

### 2. Generate Taglines

**File**: `src/ai/flows/generate-tagline.ts`

- **Input**: `{ name, elevatorPitch, audience, desirableCues?, undesirableCues? }`
- **Output**: `{ taglines: string[] }` (array of 3 taglines)
- **Note**: Taglines don't repeat brand name at start
- **Model**: Google Generative AI

**Example**:
```typescript
const result = await generateTaglines({
  name: 'DevBrew',
  elevatorPitch: 'A cozy coffee shop...',
  audience: 'Software developers...',
  desirableCues: 'modern, tech-inspired',
  undesirableCues: 'corporate, stuffy',
});
// Result: {
//   taglines: [
//     'Fuel your code, one cup at a time',
//     'Where great code meets great coffee',
//     'Debug life with caffeine'
//   ]
// }
```

### 3. Generate Logo

**File**: `src/ai/flows/generate-logo.ts`

- **Input**: `{ name, elevatorPitch, audience, desirableCues?, undesirableCues? }`
- **Output**: `{ logoUrl: string }` (data URI)
- **Post-processing**: Data URI uploaded to Firebase Storage
- **Model**: Google Generative AI (Imagen)

**Flow**:
1. AI generates logo as data URI (base64-encoded PNG)
2. Server action uploads to Firebase Storage
3. Public URL returned and saved to Firestore

### 4. Colorize Logo

**File**: `src/ai/flows/colorize-logo.ts`

- **Input**: `{ logoUrl, name, elevatorPitch, audience, desirableCues?, undesirableCues? }`
- **Output**: `{ colorLogoUrl: string, palette: string[] }`
- **Pre-processing**: Firebase Storage URL converted to data URI
- **Post-processing**: Colorized logo uploaded to Firebase Storage
- **Model**: Google Generative AI

**Flow**:
1. Original logo URL converted to data URI
2. AI generates colorized version with brand-appropriate colors
3. AI provides color palette (3-5 HEX codes)
4. Colorized logo uploaded to Firebase Storage
5. Public URL and palette saved to Firestore

## Server Actions

**Location**: `src/app/actions.ts`

All server actions for AI operations:

### `getTaglineSuggestions()`
```typescript
const result = await getTaglineSuggestions(
  name,
  elevatorPitch,
  audience,
  desirableCues,
  undesirableCues
);
// Returns: { success: boolean, data?: string[], error?: string }
```

### `getLogoSuggestion()`
```typescript
const result = await getLogoSuggestion(
  name,
  elevatorPitch,
  audience,
  desirableCues,
  undesirableCues,
  userId
);
// Returns: { success: boolean, data?: string (URL), error?: string }
```

### `getBrandSuggestions()`
```typescript
const result = await getBrandSuggestions(topic);
// Returns: { success: boolean, data?: BrandDetails, error?: string }
```

### `convertUrlToDataUri()`
```typescript
const result = await convertUrlToDataUri(storageUrl);
// Returns: { success: boolean, data?: string (data URI), error?: string }
```

### `getColorizedLogo()`
```typescript
const result = await getColorizedLogo(
  {
    logoUrl,      // data URI
    name,
    elevatorPitch,
    audience,
    desirableCues,
    undesirableCues
  },
  userId
);
// Returns: { success: boolean, data?: { colorLogoUrl, palette }, error?: string }
```

## Scripts

```bash
# Development
npm run dev              # Start Next.js dev server with Turbopack
npm run genkit:dev       # Start Genkit development UI
npm run genkit:watch     # Start Genkit with watch mode

# Production
npm run build            # Production build (TypeScript & ESLint checks enabled)
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript compiler check (tsc --noEmit)
```

## Environment Variables

**Required in `.env`**:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Google Generative AI
GOOGLE_GENAI_API_KEY=...
```

## UI Components (shadcn/ui)

Using shadcn/ui with Radix UI primitives (35+ components):

**Forms**: Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider
**Feedback**: Toast, Dialog, Alert Dialog, Alert
**Layout**: Card, Tabs, Accordion, Separator, Collapsible
**Navigation**: Button, Dropdown Menu, Menubar, Sidebar
**Data Display**: Table, Avatar, Badge, Progress, Skeleton
**Advanced**: Chart (Recharts), Calendar (react-day-picker), Carousel (Embla)

**Component Configuration**: `components.json`

## Design Philosophy

From `docs/blueprint.md`:

- **Primary color**: Soft lavender (#D1C4E9) - creativity and clarity
- **Background**: Light gray (#F5F5F5) - clean canvas
- **Accent**: Muted teal (#80CBC4) - interactive elements
- **Font**: 'PT Sans' humanist sans-serif
- **Layout**: Minimalist with clear card-based structure
- **Interactions**: Smooth transitions, hover states, responsive design

## Performance Optimizations

1. **Memoization**:
   - Firebase queries memoized with `useMemoFirebase`
   - Service instances memoized with `useMemo`
   - Computed values memoized with `useMemo`

2. **Real-time Subscriptions**:
   - Automatic cleanup on unmount
   - Optimized re-renders with context memoization

3. **Image Optimization**:
   - Next.js Image component with automatic optimization
   - Remote patterns configured for CDNs
   - Unoptimized mode for data URIs

4. **Code Splitting**:
   - App Router automatic code splitting
   - Dynamic imports for heavy components

5. **Turbopack**:
   - Fast refresh in development
   - Optimized builds

## Migration Guide

See `REFACTORING.md` for complete migration guide.

### Quick Reference

**Auth Checks** (Old → New):
```typescript
// Old
const { user, isUserLoading } = useUser();
useEffect(() => {
  if (!isUserLoading && !user) router.push('/');
}, [user, isUserLoading, router]);

// New
const { user, isLoading } = useRequireAuth();
```

**Firestore Operations** (Old → New):
```typescript
// Old
const brandsCollection = collection(firestore, `users/${user.uid}/brands`);
await addDoc(brandsCollection, data);

// New
const brandService = useMemo(() => createBrandService(firestore), [firestore]);
const brandId = await brandService.createBrand(user.uid, data);
```

## Known Considerations

- User state loading must complete before redirecting
- Google Sign-in uses redirect flow (not popup) for reliability
- Data URIs converted to Storage URLs for persistence and performance
- Logo images explicitly set as PNG MIME type
- Firestore queries memoized to prevent unnecessary re-subscriptions
- Color hue shifting applied via CSS filter (client-side)
- Firestore serverTimestamp() used for consistent timestamps

## Development Tips

1. **Use the service layer** for all Firestore operations
2. **Use `useRequireAuth`** for all protected routes
3. **Memoize Firebase objects** with `useMemoFirebase`
4. **Extract large components** into smaller, focused ones
5. **Run type checks** before committing: `npm run typecheck`
6. **Run linter** before committing: `npm run lint`
7. **Use the Genkit Dev UI** for testing AI flows: `npm run genkit:dev`

## Testing Strategy (Recommended)

1. **Unit Tests**:
   - Service layer methods
   - Utility functions (color-utils)
   - Custom hooks (useRequireAuth)

2. **Component Tests**:
   - BrandHeader
   - BrandIdentityCard
   - TaglinesList

3. **Integration Tests**:
   - Auth flow (login, redirect, logout)
   - Brand creation flow
   - AI generation flows

4. **E2E Tests**:
   - Full user journey
   - Brand creation to logo generation

## Contributing

When contributing to this codebase:

1. **Follow the architecture**: Use service layer, extract components, use hooks
2. **Type everything**: No `any` types without good reason
3. **Memoize Firebase objects**: Use `useMemoFirebase` for queries and refs
4. **Run checks**: `npm run typecheck && npm run lint`
5. **Update documentation**: Keep claude.md and REFACTORING.md in sync
6. **Write tests**: Add tests for new features

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Genkit Documentation](https://firebase.google.com/docs/genkit)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For issues, bugs, or questions:
- Check `docs/blueprint.md` for design decisions
- Check `REFACTORING.md` for architectural patterns
- Review this file for implementation details
