console.log("ChatGPT Thread Saver Content Script Loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "get_chat_content") {
        try {
            const data = scrapeChat();
            const date = new Date().toISOString().split('T')[0];
            const title = `chatgpt-thread-${date}.md`;
            sendResponse({ data: data, title: title });
        } catch (e) {
            console.error("Scraping error:", e);
            sendResponse({ error: e.message });
        }
    }
    return true; // Keep channel open for async response if needed (though we are sync here)
});

function scrapeChat() {
    // This is the core logic we need to refine
    // Strategy: Look for the message blocks.
    // ChatGPT's DOM is complex and obfuscated (CSS modules), but data attributes are often stable.

    let md = "# ChatGPT Conversation\n\n";

    // Select all conversation turns.
    // As of late 2024/2025, selectors might change.
    // Often it's `article` tags or `[data-message-author-role]` within them.

    const articles = document.querySelectorAll('article');

    if (articles.length === 0) {
        return "No messages found. Ensure you are on a ChatGPT chat page.";
    }

    articles.forEach((article, index) => {
        // Try to determine author
        // Usually there is a reliable way to distinguish User vs Assistant

        const userIcon = article.querySelector('[data-testid="icon-user"]');
        const botIcon = article.querySelector('[data-testid="icon-openai"]');

        let role = "Unknown";
        if (article.querySelector('h5')) {
            // sometimes names are explicitly headers? less common now
        }

        // Simple heuristic: data-message-author-role attribute is best if it exists
        const messageBlock = article.querySelector('[data-message-author-role]');
        if (messageBlock) {
            role = messageBlock.getAttribute('data-message-author-role');
        } else {
            // Fallback
            if (userIcon) role = "user";
            if (botIcon) role = "assistant";
        }

        // Capitalize role
        const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);

        // Get text content
        // The text is usually inside a div that contains the markdown rendering.
        // We want the raw text or best approximation.
        // Usually .markdown class or similar.

        let text = "";
        const contentDiv = article.querySelector('.markdown') || article.querySelector('[data-message-author-role]');

        if (contentDiv) {
            // InnerText preserves newlines usually
            text = contentDiv.innerText;
        } else {
            text = article.innerText;
        }

        md += `**${roleDisplay}:**\n\n${text}\n\n---\n\n`;
    });

    return md;
}
