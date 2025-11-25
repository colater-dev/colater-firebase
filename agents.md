# Codebase Audit & Learnings

This document tracks the learnings and findings from the codebase audit performed by the AI agent.

## Project Structure Overview
- **src/app**: Next.js App Router pages and layouts.
- **src/features**: Feature-based architecture (e.g., `brands`, `auth`).
- **src/components**: Shared UI components.
- **src/lib**: Utilities and types.
- **src/services**: Business logic and data access layers.
- **src/firebase**: Firebase configuration and hooks.

## Audit Findings

### Unused Code
- **Logo Display Settings**: Removed `smoothness` and `brightness` props from `BrandApplications`, `LogoControls`, and related interfaces. These were legacy controls that were no longer exposed in the UI or used in the rendering logic.
- **Legacy Types**: Cleaned up unused fields in the `Logo` interface in `src/lib/types.ts` (e.g., `logoBrightness`, `logoSmoothness`).

### Performance Improvements
- **Component Memoization**: Implemented `React.memo` for several key components to prevent unnecessary re-renders:
    - `LogoShowcase`: The main container for logo previews.
    - `BrandApplications`: Renders multiple mockups, which can be expensive.
    - `LogoPreviewCard`: Handles individual logo preview tiles with complex animations.
    - `LogoControls`: The control panel for logo adjustments.
    - `StickerPreview`: The sticker effect preview.
- **Optimization Rationale**: These components receive many props, some of which might not change frequently (e.g., `brandName`, `selectedBrandFont`). Memoization ensures that they only re-render when their specific props change, improving responsiveness, especially during interactions like typing or toggling settings.

### Architecture Notes
- **Feature-Based Structure**: The project follows a solid feature-based architecture (`src/features/brands`), which makes it easy to locate related components and logic.
- **Shared UI**: Reusable UI components are well-organized in `src/components/ui`.
- **State Management**: State is primarily managed at the page level (`src/app/brands/[brandId]/page.tsx`) and passed down. This works well but requires careful prop drilling management, which memoization helps mitigate.

### Technical Learnings
- **html-to-image Filtering**: When using `html-to-image` (specifically `toPng`) to capture a DOM element that contains UI controls (buttons, labels), the `filter` option is essential. By tagging UI elements with a specific class (e.g., `exclude-from-download`) and filtering them out in the `toPng` call, we can generate clean images without modifying the DOM structure or creating temporary clones manually.
- **List Virtualization/Memoization**: For lists of items like the `LogoNavigationDock`, memoizing individual list items (`DockItem`) is crucial to prevent re-rendering the entire list when the active item changes. Ensuring callback props are stable (or passing indices instead of creating inline arrow functions) is key to making `React.memo` effective.
