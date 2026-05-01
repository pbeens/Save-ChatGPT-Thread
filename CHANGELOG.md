# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-05-01

### Added

- Support for Grok chat extraction (grok.com).

### Fixed

- Fixed ChatGPT extraction logic which broke due to DOM changes (transition from `article` to `section` and updated data attributes).
- Improved role detection to be more robust across different UI versions.
- Updated content selectors to handle the new user message structure.

## [1.1.0] - 2026-01-05

### Added

- Comprehensive support for Google Gemini (gemini.google.com).
- Support for Subscript (`<sub>`) and Superscript (`<sup>`) tags.
- Support for LaTeX math formulas (inline and block) on Gemini.
- Automatic content script injection on extension reload.
- Shadow DOM traversal for robust Gemini scraping.
- added "Buy Me a Coffee" support to README.

### Fixed

- Missing assistant responses on Gemini due to custom element tags.
- Table formatting issues where extra columns were created by whitespace.
- Connection errors when using the extension immediately after updates.

## [1.0.0] - 2026-01-01

### Added

- Initial release with ChatGPT support.
- Basic Markdown conversion for bold, italics, headings, and lists.
- Ability to save threads as `.md` files.
