# Produs Versioning Guide

This document outlines the standard procedure for updating the software version and dispatching release notes (The Produs Times) within the Produs codebase.

## 🏛️ Versioning Strategy
Produs follows **Semantic Versioning** (`MAJOR.MINOR.PATCH`):
- **MAJOR**: Incompatible API or architectural changes.
- **MINOR**: Backward-compatible functionality additions (e.g. new modules, theme updates).
- **PATCH**: Backward-compatible bug fixes and small styling refinements.

---

## 📋 Version Change Checklist

To perform a version upgrade, execute the following steps in order:

### 1. Update package files
Update the `"version"` field to the target version (e.g., `1.0.3`) in the following metadata files:
- [client/package.json](file:///c:/Users/PC/Desktop/Dateabase/Produs/client/package.json)
- [server/package.json](file:///c:/Users/PC/Desktop/Dateabase/Produs/server/package.json)

### 2. Update User Profile Modal
Update the visible version number and hover text in the User Menu settings component:
- [UserMenuModal.jsx](file:///c:/Users/PC/Desktop/Dateabase/Produs/client/src/components/ui/UserMenuModal.jsx):
  - Update `v1.x.x` display text (around line 116).
  - Update `title="VIEW SYSTEM UPDATE 1.x.x"` hover tooltip (around line 121).

### 3. Record Release Notes in "The Produs Times"
Open [ProdusTimesModal.jsx](file:///c:/Users/PC/Desktop/Dateabase/Produs/client/src/components/ui/ProdusTimesModal.jsx) to add the release notes for the new edition:
1. **Prepend the New Edition**: Prepend the new release as the main headline and body at the top of the modal content.
2. **Move Old Edition Down**: Wrap the previous edition in a vintage dashed divider and move it below.
3. **Typography & Style Guidelines**:
   - **Everyday Language**: Use simple, easy-to-understand terms. Avoid overly technical or sci-fi phrases.
   - **Black & White Emojis**: Emojis must be grayscale to match the typewriter print theme. Apply the grayscale CSS class: `filter grayscale opacity-90 contrast-[300%] brightness-[0.2] dark:brightness-100`.
   - **Date & Numbering**: Increment the volume/edition details:
     - `VOL. 1 // NO. [NO]`
     - `[DATE]`
     - `EDITION [VERSION]`

### 4. Verification & Build Check
Always run a production compile check on the client folder to verify that the build completes successfully:
```bash
cd client
pnpm run build
```
