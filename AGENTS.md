# AI Agent Instructions for Chat Thread Saver

This document provides specific instructions for AI coding assistants (like Antigravity) working on this repository.

## Version Management

1. **Version Bumping**: When introducing new features or fixes, update the `"version"` field in `manifest.json`.
2. **Changelog**: Always add a new entry to `CHANGELOG.md` corresponding to the version bump.
3. **Description**: Ensure the `"description"` in `manifest.json` reflects all supported platforms (currently ChatGPT, Gemini, and Grok).

## Distribution Zip File (`Save-ChatGPT-Thread.zip`)

The zip file is the primary distribution format for the Chrome Web Store.

### 1. Wait for User Approval

**CRITICAL**: Do NOT recreate or update `Save-ChatGPT-Thread.zip` automatically. You must wait until the USER has explicitly agreed that the new version is ready for distribution.

### 2. Included Files

When creating the zip file, include ONLY the following files and directories:

- `manifest.json`
- `content.js`
- `popup.html`
- `popup.js`
- `popup.css`
- `icons/` (entire directory)
- `LICENSE`
- `README.md`
- `CHANGELOG.md`
- `PRIVACY.md`

### 3. Excluded Files

Ensure the following are NEVER included in the zip:

- `.git/` and `.gitignore`
- `.vscode/`
- `PROMPTS.md`
- `AGENTS.md`
- `images/` (these are for GitHub/Documentation only)
- Any previous version of `Save-ChatGPT-Thread.zip`

### 4. Creation Command (PowerShell)

To recreate the zip accurately:

```powershell
Compress-Archive -Path manifest.json, content.js, popup.html, popup.js, popup.css, icons, LICENSE, README.md, CHANGELOG.md, PRIVACY.md -DestinationPath Save-ChatGPT-Thread.zip -Force
```

## Maintenance Standards

- **Prompt Logging**: Maintain `PROMPTS.md` according to the established format in `user_global` rules.
- **Support Links**: Ensure the `Support` section in `README.md` and the `support-note` in `popup.html` always point to the correct GitHub issues page and "Buy Me a Coffee" link.
- **DOM Robustness**: When updating extraction logic for ChatGPT, Gemini, or Grok, use the browser subagent to verify selectors and prefer data attributes (like `data-testid` or `data-message-author-role`) over brittle class names where possible.
