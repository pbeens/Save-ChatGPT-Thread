console.log("Chat Thread Saver Content Script Loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "get_chat_content") {
        try {
            const hostname = window.location.hostname;
            let data, title;
            const date = new Date().toISOString().split('T')[0];

            if (hostname.includes('gemini.google.com')) {
                data = scrapeGemini();
                title = `gemini-thread-${date}.md`;
            } else {
                data = scrapeChatGPT();
                title = `chatgpt-thread-${date}.md`;
            }
            
            sendResponse({ data: data, title: title });
        } catch (e) {
            console.error("Scraping error:", e);
            sendResponse({ error: e.message });
        }
    }
    return true;
});

function scrapeChatGPT() {
    let md = "# ChatGPT Conversation\n\n";
    const articles = document.querySelectorAll('article');

    if (articles.length === 0) {
        return "No messages found. Ensure you are on a ChatGPT chat page.";
    }

    articles.forEach((article) => {
        const userIcon = article.querySelector('[data-testid="icon-user"]');
        const botIcon = article.querySelector('[data-testid="icon-openai"]');

        let role = "Unknown";
        const messageBlock = article.querySelector('[data-message-author-role]');
        if (messageBlock) {
            role = messageBlock.getAttribute('data-message-author-role');
        } else {
            if (userIcon) role = "user";
            if (botIcon) role = "assistant";
        }

        const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);
        let text = "";
        const contentDiv = article.querySelector('.markdown') || article.querySelector('[data-message-author-role]');

        if (contentDiv) {
            text = contentDiv.innerText;
        } else {
            text = article.innerText;
        }

        md += `**${roleDisplay}:**\n\n${text}\n\n---\n\n`;
    });

    return md;
}

function scrapeGemini() {
    let md = "# Gemini Conversation\n\n";
    
    // Gemini uses different structures. 
    // User messages are often in 'user-query' or 'div[title="User prompt"]'
    // Model responses are often in 'model-response' or similar.
    
    const chatTurns = document.querySelectorAll('.chat-turn, query-content, message-content');
    
    if (chatTurns.length === 0) {
        // Fallback or broader search
        const possibleMessages = document.querySelectorAll('.user-query, .model-response, .query-content, .message-content');
        if (possibleMessages.length === 0) {
            return "No Gemini messages found. Ensure you are on a Gemini chat page.";
        }
        
        possibleMessages.forEach(msg => {
            let role = "Assistant";
            if (msg.classList.contains('user-query') || msg.classList.contains('query-content') || msg.closest('.user-query-container')) {
                role = "User";
            }
            md += `**${role}:**\n\n${msg.innerText}\n\n---\n\n`;
        });
        return md;
    }

    chatTurns.forEach((turn) => {
        // This is a rough heuristic as Gemini's DOM is very fluid
        const role = turn.closest('.user-query-container') || turn.classList.contains('user-query') ? "User" : "Assistant";
        md += `**${role}:**\n\n${turn.innerText}\n\n---\n\n`;
    });

    return md;
}
