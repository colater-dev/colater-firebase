# Brand Canvas

A Next.js application for creating and managing brand identities with AI-powered assistance. Users can generate brand details, taglines, and logos using Firebase and Google's Genkit AI.

## Overview

Brand Canvas helps users craft their brand identity effortlessly by providing:
- Google Sign-in authentication
- Brand creation and management
- AI-powered brand detail suggestions
- AI-generated taglines
- AI-generated logos with colorization
- Firebase Firestore for data persistence
- Firebase Storage for asset management

## Tech Stack

- **Framework**: Next.js 15.3.3 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Firebase (Firestore, Auth, Storage)
- **AI**: Google Genkit with Google Generative AI
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context (Firebase Provider)

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
├── app/                         # Next.js app router pages
│   ├── brands/
│   │   ├── [brandId]/          # Brand detail page (365 lines - refactored!)
│   │   └── new/                # New brand creation form
│   ├── dashboard/              # User dashboard with brand list
│   ├── actions.ts              # Server actions for AI operations
│   ├── layout.tsx              # Root layout with Firebase provider
│   ├── page.tsx                # Landing page with Google sign-in
│   └── globals.css             # Global styles
├── features/                    # 🆕 Feature-based modules
│   ├── auth/
│   │   └── hooks/
│   │       ├── use-require-auth.tsx  # Auth guard hook
│   │       └── index.ts
│   └── brands/
│       └── components/
│           ├── brand-header.tsx        # Brand info display
│           ├── brand-identity-card.tsx # Logo & tagline card
│           ├── taglines-list.tsx       # Taglines management
│           └── index.ts
├── services/                    # 🆕 Business logic / data access layer
│   ├── brand.service.ts        # Brand CRUD operations
│   ├── tagline.service.ts      # Tagline operations
│   ├── logo.service.ts         # Logo operations
│   └── index.ts
├── components/
│   ├── ui/                     # shadcn/ui components (35+ components)
│   ├── FirebaseErrorListener.tsx  # Error handling component
│   └── user-chip.tsx           # User profile chip
├── firebase/                    # Firebase configuration and utilities
│   ├── firestore/
│   │   ├── use-collection.tsx  # Firestore collection hook
│   │   └── use-doc.tsx         # Firestore document hook
│   ├── client-provider.tsx     # Client-side Firebase initialization
│   ├── config.ts               # Firebase configuration
│   ├── error-emitter.ts        # Error event emitter
│   ├── errors.ts               # Custom error classes
│   ├── index.ts                # Public Firebase API exports
│   ├── non-blocking-login.tsx  # Non-blocking login component
│   ├── non-blocking-updates.tsx  # Non-blocking updates component
│   ├── provider.tsx            # Firebase context provider (190 lines)
│   └── server.ts               # Server-side Firebase utilities
├── hooks/
│   ├── use-mobile.tsx          # Mobile detection hook
│   └── use-toast.ts            # Toast notification hook
└── lib/
    ├── color-utils.ts          # 🆕 Color conversion utilities
    ├── placeholder-images.ts   # Placeholder image utilities
    ├── storage.ts              # Firebase Storage utilities
    ├── types.ts                # TypeScript type definitions
    └── utils.ts                # Utility functions
```

## Key Files

### Core Configuration
- `firestore.rules` - Firestore security rules (145 lines)
- `next.config.ts` - Next.js configuration with image domains
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration

### Authentication & Data Flow
- `src/firebase/provider.tsx:62-118` - FirebaseProvider component managing auth state
- `src/firebase/provider.tsx:187-190` - useUser hook for accessing user state
- `src/app/page.tsx:17-32` - Google Sign-in redirect handling
- `src/app/page.tsx:43-47` - initiateGoogleSignIn function

### Main Features
- `src/app/dashboard/page.tsx` - Brand list dashboard with real-time Firestore queries
- `src/app/brands/new/page.tsx:53-88` - AI-powered brand detail form filler
- `src/app/brands/new/page.tsx:90-144` - Brand creation with Firestore
- `src/app/actions.ts` - Server actions for AI generation

## Data Models

### Brand
```typescript
interface Brand {
  id: string;
  userId: string;
  createdAt: Timestamp;
  latestName: string;
  latestElevatorPitch: string;
  latestAudience: string;
  latestDesirableCues: string;
  latestUndesirableCues: string;
  logoUrl?: string;
  primaryTagline?: string;
}
```

### Firestore Structure
```
/users/{userId}
  /brands/{brandId}
    /inputVersions/{versionId}
    /taglineGenerations/{generationId}
    /logoGenerations/{generationId}
```

## Security Model

The application uses a strict user-ownership model enforced by Firestore security rules:
- All data nested under `/users/{userId}`
- Only authenticated users can access their own data
- User listing is disallowed for privacy
- `userId` field denormalized across all documents for efficient authorization checks
- Helper functions: `isSignedIn()`, `isOwner(userId)`, `isExistingOwner(userId)`

## Firebase Hooks

### Custom Hooks
- `useFirebase()` - Access all Firebase services and user state
- `useAuth()` - Firebase Auth instance
- `useFirestore()` - Firestore instance
- `useStorage()` - Firebase Storage instance
- `useUser()` - User authentication state
- `useCollection<T>(query)` - Real-time Firestore collection listener
- `useDoc<T>(docRef)` - Real-time Firestore document listener
- `useMemoFirebase<T>(factory, deps)` - Memoized Firebase objects

## AI Flows (Genkit)

### 1. Generate Brand Details
- **File**: `src/ai/flows/generate-brand-details.ts`
- **Input**: topic (string)
- **Output**: name, elevatorPitch, audience, desirableCues, undesirableCues
- **Usage**: "Fill for me" button on brand creation form

### 2. Generate Taglines
- **File**: `src/ai/flows/generate-tagline.ts`
- **Input**: Brand details (name, pitch, audience, cues)
- **Output**: Array of 3 taglines
- **Note**: Taglines don't repeat brand name at start

### 3. Generate Logo
- **File**: `src/ai/flows/generate-logo.ts`
- **Input**: Brand details
- **Output**: logoUrl (data URI, uploaded to Firebase Storage)

### 4. Colorize Logo
- **File**: `src/ai/flows/colorize-logo.ts`
- **Input**: Logo URL + brand details
- **Output**: colorLogoUrl + color palette array

## Server Actions

Located in `src/app/actions.ts`:
- `getTaglineSuggestions()` - Generate taglines
- `getLogoSuggestion()` - Generate and upload logo
- `getBrandSuggestions()` - Generate brand details from topic
- `convertUrlToDataUri()` - Convert Firebase Storage URL to data URI
- `getColorizedLogo()` - Generate colored logo version

## Scripts

```bash
npm run dev              # Start development server with Turbopack
npm run genkit:dev       # Start Genkit development UI
npm run genkit:watch     # Start Genkit with watch mode
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript compiler check
```

## Environment Variables

Required in `.env`:
- Firebase configuration (API keys, project ID, etc.)
- Google Generative AI API key

## Firebase Error Handling

The app includes sophisticated error handling:
- `FirebaseErrorListener` component listens for permission errors
- `errorEmitter` broadcasts Firebase errors
- `FirestorePermissionError` class for debugging permission issues
- Non-blocking login/updates to prevent UI freezes

## UI Components

Using shadcn/ui with Radix UI primitives:
- Forms: Input, Textarea, Select, Checkbox, etc.
- Feedback: Toast, Dialog, Alert Dialog
- Layout: Card, Tabs, Accordion, Separator
- Navigation: Button, Dropdown Menu, Menubar
- Data: Table, Avatar, Badge, Progress
- Advanced: Chart (Recharts), Calendar (react-day-picker)

## Design Philosophy

From `docs/blueprint.md`:
- **Primary color**: Soft lavender (#D1C4E9) - creativity and clarity
- **Background**: Light gray (#F5F5F5) - clean canvas
- **Accent**: Muted teal (#80CBC4) - interactive elements
- **Font**: 'PT Sans' humanist sans-serif
- **Layout**: Minimalist with clear card-based structure

## Recent Changes

Based on recent commits:
- Fixed Google Sign-in redirect handling
- Improved session management and user loading states
- Enhanced error handling for login flows
- Reviewed and optimized project architecture

## Service Layer (New)

The service layer provides a clean abstraction over Firestore operations, encapsulating path construction and common patterns.

### BrandService
```typescript
const brandService = createBrandService(firestore);

// Create a new brand
const brandId = await brandService.createBrand(userId, {
  latestName: 'My Brand',
  latestElevatorPitch: '...',
  latestAudience: '...',
});

// Get brands query
const query = brandService.getBrandsQuery(userId);

// Update brand
await brandService.updateBrand(userId, brandId, { latestName: 'New Name' });
```

### TaglineService
```typescript
const taglineService = createTaglineService(firestore);

// Create multiple taglines
await taglineService.createMultipleTaglines(userId, brandId, ['tagline1', 'tagline2']);

// Update tagline status
await taglineService.updateTaglineStatus(userId, brandId, taglineId, 'liked');
```

### LogoService
```typescript
const logoService = createLogoService(firestore);

// Create logo
const logoId = await logoService.createLogo(userId, brandId, logoUrl);

// Add colorized version
await logoService.updateLogoWithColor(userId, brandId, logoId, colorLogoUrl, palette);
```

## Auth Guard Pattern (New)

The `useRequireAuth` hook standardizes authentication checks:

```typescript
function ProtectedPage() {
  const { user, isLoading } = useRequireAuth();
  // Automatically redirects to home if not authenticated

  if (isLoading) return <LoadingSpinner />;

  return <div>Protected content for {user.displayName}</div>;
}
```

## Development Notes

- ✅ TypeScript checking enabled with strict mode
- ✅ ESLint enabled with Next.js recommended config
- Image optimization enabled for multiple CDNs (Firebase Storage, placeholder services)
- Uses Firebase App Hosting (see `apphosting.yaml`)

## Firebase Provider Architecture

The Firebase context provider manages:
1. **Service Availability**: Tracks if Firebase services are initialized
2. **Auth State**: Real-time user authentication listener
3. **Loading States**: Separate loading state for user authentication
4. **Error Handling**: Captures and propagates auth errors
5. **Memoization**: Optimized re-renders with `useMemo` and `useMemoFirebase`

## Known Considerations

- User state loading must complete before redirecting
- Google Sign-in uses redirect flow (not popup)
- Data URIs are converted to Storage URLs for persistence
- Logo images are explicitly set as PNG MIME type
- Firestore queries are memoized to prevent unnecessary re-subscriptions
