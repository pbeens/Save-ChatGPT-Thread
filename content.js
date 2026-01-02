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

function nodeToMarkdown(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return "";
    }

    let childrenMarkdown = "";
    node.childNodes.forEach(child => {
        childrenMarkdown += nodeToMarkdown(child);
    });

    const tag = node.tagName.toUpperCase();

    switch (tag) {
        case "STRONG":
        case "B":
            return `**${childrenMarkdown}**`;
        case "EM":
        case "I":
            return `*${childrenMarkdown}*`;
        case "H1": return `\n# ${childrenMarkdown}\n`;
        case "H2": return `\n## ${childrenMarkdown}\n`;
        case "H3": return `\n### ${childrenMarkdown}\n`;
        case "H4": return `\n#### ${childrenMarkdown}\n`;
        case "H5": return `\n##### ${childrenMarkdown}\n`;
        case "H6": return `\n###### ${childrenMarkdown}\n`;
        case "P": return `\n${childrenMarkdown}\n`;
        case "BR": return `\n`;
        case "CODE":
            if (node.parentNode.tagName === "PRE") {
                return childrenMarkdown;
            }
            return `\`${childrenMarkdown}\``;
        case "PRE":
            const lang = node.className.match(/language-(\w+)/);
            return `\n\`\`\`${lang ? lang[1] : ""}\n${childrenMarkdown}\n\`\`\`\n`;
        case "UL": return `\n${childrenMarkdown}\n`;
        case "OL": return `\n${childrenMarkdown}\n`;
        case "LI":
            const parent = node.parentNode.tagName;
            const prefix = parent === "OL" ? "1. " : "* ";
            return `${prefix}${childrenMarkdown}\n`;
        case "BLOCKQUOTE":
            return `\n> ${childrenMarkdown.split('\n').join('\n> ')}\n`;
        case "TABLE": return `\n${childrenMarkdown}\n`;
        case "THEAD": return childrenMarkdown;
        case "TBODY": return childrenMarkdown;
        case "TR":
            let row = `| ${childrenMarkdown} |\n`;
            // Add separator after header row
            if (node.parentNode.tagName === "THEAD" || (node.parentNode.tagName === "TBODY" && !node.previousElementSibling)) {
                const cells = node.querySelectorAll('th, td').length;
                row += `| ${Array(cells).fill('---').join(' | ')} |\n`;
            }
            return row;
        case "TH":
        case "TD":
            return `${childrenMarkdown.trim()} |`;
        case "A":
            return `[${childrenMarkdown}](${node.href})`;
        default:
            return childrenMarkdown;
    }
}

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
        const contentDiv = article.querySelector('.markdown') || article.querySelector('[data-message-author-role]');

        let text = "";
        if (contentDiv) {
            text = nodeToMarkdown(contentDiv);
        } else {
            text = article.innerText;
        }

        md += `**${roleDisplay}:**\n\n${text}\n\n---\n\n`;
    });

    return md;
}

function scrapeGemini() {
    let md = "# Gemini Conversation\n\n";
    
    // Gemini messages
    const possibleMessages = document.querySelectorAll('.user-query, .model-response, .query-content, .message-content');
    
    if (possibleMessages.length === 0) {
        return "No Gemini messages found. Ensure you are on a Gemini chat page.";
    }
    
    possibleMessages.forEach(msg => {
        let role = "Assistant";
        if (msg.classList.contains('user-query') || msg.classList.contains('query-content') || msg.closest('.user-query-container')) {
            role = "User";
        }
        
        const text = nodeToMarkdown(msg);
        md += `**${role}:**\n\n${text}\n\n---\n\n`;
    });

    return md;
}
