# Specification

## Summary
**Goal:** Add installable PWA support, offline app-shell behavior, and local (device) notifications with a simple install and notification settings UX.

**Planned changes:**
- Add a valid web app manifest (webmanifest) with required fields and icon references, plus required PWA metadata and manifest link in `frontend/index.html`.
- Add app icon assets (at least 192x192 and 512x512) for PWA installation.
- Register a service worker from editable frontend code and add a minimal service worker to cache the app shell and show a basic offline fallback when offline.
- Add an in-app, dismissible install prompt UI that appears when `beforeinstallprompt` is available and switches to an “Installed” state when running standalone/installed.
- Add a Settings > Notifications section to show permission status, request permission via explicit user action, and send a test notification.
- Add reminder logic that surfaces important events from already-loaded UI data as in-app toasts, and optionally as system notifications when permission is granted, with simple deduping to avoid spam.

**User-visible outcome:** Users can install the app to their home screen and launch it in standalone mode, continue to open the app with a basic offline experience, manage notification permission in Settings, send a test notification, and receive in-app (and optionally system) reminders for important items while the app is open.
