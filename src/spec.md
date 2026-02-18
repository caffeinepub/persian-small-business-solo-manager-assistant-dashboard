# Specification

## Summary
**Goal:** Add a file storage module allowing users to upload, manage, download, and organize their files with metadata.

**Planned changes:**
- Add backend data model and methods for file metadata (filename, type, size, upload date, notes) with per-user authorization
- Add backend storage for file binary content with upload/download methods
- Create React Query hooks for file metadata operations (list, create, update, delete)
- Create a Files page displaying a searchable list of uploaded files with actions (view, download, edit, delete)
- Add file upload dialog with drag-and-drop support and progress indicator
- Implement file download functionality triggering browser downloads
- Add file metadata edit dialog for updating filename and notes
- Add 'Files' navigation item in sidebar
- Display file count on Dashboard page
- Include file metadata in data export/import functionality
- Add Persian translations for all file-related UI text

**User-visible outcome:** Users can upload files to their personal storage, view them in a dedicated Files page, download files when needed, edit file metadata (filename and notes), and see their file count on the dashboard. All file operations are private and per-user.
