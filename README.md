# Chat Thread Saver

A Chrome extension that allows you to save your ChatGPT, Google Gemini, and Grok conversations as clean, readable Markdown files.

## Features

- **One-Click Save**: Easily download the current chat thread with a single click.
- **Multi-Platform Support**: Works seamlessly on [ChatGPT](https://chatgpt.com), [Google Gemini](https://gemini.google.com), and [Grok](https://grok.com).
- **Markdown Preservation**: Saves conversations with formatting (bold, italics, headings, lists, tables, and code blocks) intact.
- **Math & Science Support**: Correctly handles subscripts (H₂O), superscripts (E=mc²), and LaTeX math formulas.
- **Shadow DOM Support**: Robust scraping that captures assistant responses even when nested in complex web structures.

## Installation

Install directly from the **Chrome Web Store**:

**[Chat Thread Saver on Chrome Web Store](https://chromewebstore.google.com/detail/chatgpt-thread-saver/monacbfpcobmaoijgepedjklkpknponk)**

### Manual Installation (Alternative)

If you prefer to install it manually from the source code, follow these steps:

**Repository URL**: [https://github.com/pbeens/Save-ChatGPT-Thread](https://github.com/pbeens/Save-ChatGPT-Thread)

### Step 1: Get the Code

Choose one of the following methods to get the code:

#### Option A: Command Line (Git)
Open your terminal and run:
```sh
git clone https://github.com/pbeens/Save-ChatGPT-Thread.git
```

#### Option B: GitHub Desktop
1.  Open GitHub Desktop.
2.  Go to **File** > **Clone Repository**.
3.  Select the **URL** tab.
4.  Enter `https://github.com/pbeens/Save-ChatGPT-Thread` and click **Clone**.

#### Option C: GitHub Website (Download ZIP)
1.  Go to [https://github.com/pbeens/Save-ChatGPT-Thread](https://github.com/pbeens/Save-ChatGPT-Thread).
2.  Click the green **Code** button.
3.  Select **Download ZIP**.
4.  Extract the ZIP file to a folder on your computer.

### Step 2: Install in Chrome

1.  Open Google Chrome and navigate to `chrome://extensions`.
2.  Enable **Developer mode** in the top right corner.
3.  Click the **Load unpacked** button.
4.  Select the directory where you saved/extracted the project (e.g., `Chat-Thread-Saver`).

## Usage

1.  Navigate to any [ChatGPT](https://chatgpt.com), [Gemini](https://gemini.google.com), or [Grok](https://grok.com) conversation.
2.  Click the **Chat Thread Saver** icon in your browser toolbar.
3.  In the popup window, click the **Save Chat** button.
4.  The extension will generate a Markdown file (e.g., `chatgpt-thread-YYYY-MM-DD.md`, `gemini-thread-YYYY-MM-DD.md`, or `grok-thread-YYYY-MM-DD.md`) and download it to your computer.

## Contributing

Have feedback? Please open an issue:

- **Bug reports**: Include browser version, OS, extension version, steps to reproduce, and what you expected vs. what happened.
- **Suggestions**: Describe the improvement and why it helps. Screenshots or brief examples are great.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues, have questions, or would like to suggest an improvement, please **[open an issue on GitHub](https://github.com/pbeens/Save-ChatGPT-Thread/issues)**. 

If you find this extension useful and would like to support its development, please consider buying me a coffee:

[![Buy Me a Coffee](images/bmc-button.png)](https://buymeacoffee.com/pbeens)

