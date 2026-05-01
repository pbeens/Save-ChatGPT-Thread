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
            } else if (hostname.includes('grok.com')) {
                data = scrapeGrok();
                title = `grok-thread-${date}.md`;
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
        const text = node.textContent;
        const inTable = node.parentElement && ["TR", "TD", "TH", "THEAD", "TBODY", "TABLE"].includes(node.parentElement.tagName.toUpperCase());
        return inTable ? text.trim() : text;
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
            return childrenMarkdown.trim() ? `**${childrenMarkdown.trim()}**` : "";
        case "EM":
        case "I":
            return childrenMarkdown.trim() ? `*${childrenMarkdown.trim()}*` : "";
        case "H1": return `\n# ${childrenMarkdown.trim()}\n`;
        case "H2": return `\n## ${childrenMarkdown.trim()}\n`;
        case "H3": return `\n### ${childrenMarkdown.trim()}\n`;
        case "H4": return `\n#### ${childrenMarkdown.trim()}\n`;
        case "H5": return `\n##### ${childrenMarkdown.trim()}\n`;
        case "H6": return `\n###### ${childrenMarkdown.trim()}\n`;
        case "P": return `\n${childrenMarkdown.trim()}\n`;
        case "BR": return `\n`;
        case "SUP": return childrenMarkdown.trim() ? `<sup>${childrenMarkdown.trim()}</sup>` : "";
        case "SUB": return childrenMarkdown.trim() ? `<sub>${childrenMarkdown.trim()}</sub>` : "";
        case "SPAN":
            // Gemini Math support (KaTeX)
            if (node.classList.contains('math-inline') || node.classList.contains('math-block')) {
                const math = node.getAttribute('data-math');
                if (math) {
                    const isBlock = node.classList.contains('math-block');
                    return isBlock ? `\n$$\n${math}\n$$\n` : `$${math}$`;
                }
            }
            return childrenMarkdown;
        case "CODE":
            if (node.parentNode.tagName === "PRE") {
                return childrenMarkdown;
            }
            return `\`${childrenMarkdown.trim()}\``;
        case "PRE":
            const lang = node.className.match(/language-(\w+)/);
            return `\n\`\`\`${lang ? lang[1] : ""}\n${childrenMarkdown}\n\`\`\`\n`;
        case "UL": return `\n${childrenMarkdown}\n`;
        case "OL": return `\n${childrenMarkdown}\n`;
        case "LI":
            const parent = node.parentNode.tagName;
            const prefix = parent === "OL" ? "1. " : "* ";
            return `${prefix}${childrenMarkdown.trim()}\n`;
        case "BLOCKQUOTE":
            return `\n> ${childrenMarkdown.trim().split('\n').join('\n> ')}\n`;
        case "TABLE": return `\n${childrenMarkdown.trim()}\n`;
        case "THEAD": return childrenMarkdown.trim() + "\n";
        case "TBODY": return childrenMarkdown.trim() + "\n";
        case "TR":
            const rowContent = childrenMarkdown.split('|').map(s => s.trim()).filter(s => s.length > 0).join(' | ');
            if (!rowContent) return "";
            
            let row = `| ${rowContent} |\n`;
            if (node.parentNode.tagName === "THEAD" || (node.parentNode.tagName === "TBODY" && !node.previousElementSibling)) {
                const cells = node.querySelectorAll('th, td').length;
                row += `| ${Array(cells).fill('---').join(' | ')} |\n`;
            }
            return row;
        case "TH":
        case "TD":
            return `| ${childrenMarkdown.trim()}`;
        case "A":
            return `[${childrenMarkdown.trim()}](${node.href})`;
        default:
            return childrenMarkdown;
    }
}

function scrapeChatGPT() {
    let md = "# ChatGPT Conversation\n\n";
    
    // Modern ChatGPT uses 'section' tags or direct '[data-message-author-role]' attributes
    // We'll query for the messages directly as it's the most reliable across UI versions
    const messageElements = document.querySelectorAll('[data-message-author-role]');

    if (messageElements.length === 0) {
        // Fallback for older versions that might still use 'article'
        const articles = document.querySelectorAll('article');
        if (articles.length === 0) {
            return "No messages found. Ensure you are on a ChatGPT chat page and the content has loaded.";
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
            const contentDiv = article.querySelector('.markdown') || article.querySelector('[data-message-author-role]') || article;

            let text = nodeToMarkdown(contentDiv);
            md += `**${roleDisplay}:**\n\n${text}\n\n---\n\n`;
        });
    } else {
        messageElements.forEach((msgElement) => {
            const role = msgElement.getAttribute('data-message-author-role');
            const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);
            
            // Assistant messages use '.markdown'
            // User messages are typically in a div sibling to the avatar/icon
            let contentDiv = msgElement.querySelector('.markdown');
            
            if (!contentDiv) {
                // For user messages, we want the container that doesn't include the 'edit' buttons
                // Usually it's a div with a lot of classes, but we can try to find the one with the text
                const potentialContent = msgElement.querySelector('div[class*="flex-col"]');
                contentDiv = potentialContent || msgElement;
            }

            let text = nodeToMarkdown(contentDiv);
            
            // Cleanup: Sometimes buttons like "Copy" or "Edit" get included if selectors are too broad
            // But nodeToMarkdown is generally good at only picking up text and structural elements
            
            md += `**${roleDisplay}:**\n\n${text}\n\n---\n\n`;
        });
    }

    return md;
}

function scrapeGemini() {
    let md = "# Gemini Conversation\n\n";
    const possibleMessages = [];

    function walk(node) {
        if (!node) return;
        const tagName = node.tagName ? node.tagName.toUpperCase() : "";
        
        if (tagName === 'USER-QUERY' || tagName === 'MODEL-RESPONSE') {
            possibleMessages.push(node);
            return;
        }

        if (node.shadowRoot) {
            walk(node.shadowRoot);
        }

        node.childNodes.forEach(child => walk(child));
    }

    walk(document.body);

    if (possibleMessages.length === 0) {
        return "No Gemini messages found. Ensure you are on a Gemini chat page.";
    }
    
    possibleMessages.forEach(msg => {
        const tagName = msg.tagName.toUpperCase();
        let role = (tagName === 'USER-QUERY') ? "User" : "Assistant";
        
        const contentContainer = (role === "User") 
            ? msg.querySelector('.query-content') 
            : msg.querySelector('.markdown') || msg.querySelector('message-content');
        
        let text = "";
        if (contentContainer) {
            text = nodeToMarkdown(contentContainer);
        } else {
            text = nodeToMarkdown(msg);
        }
        
        md += `**${role}:**\n\n${text}\n\n---\n\n`;
    });

    return md;
}

function scrapeGrok() {
    let md = "# Grok Conversation\n\n";
    
    // Grok uses data-testid="user-message" and data-testid="assistant-message"
    const messageElements = document.querySelectorAll('[data-testid$="-message"]');

    if (messageElements.length === 0) {
        return "No messages found. Ensure you are on a Grok chat page and the content has loaded.";
    }

    messageElements.forEach((msgElement) => {
        const testId = msgElement.getAttribute('data-testid');
        let role = testId.includes('user') ? "User" : "Assistant";
        
        // For Grok, we look for markdown containers or the message bubble itself
        const contentDiv = msgElement.querySelector('.markdown') || 
                           msgElement.querySelector('.response-content-markdown') || 
                           msgElement.querySelector('.message-bubble') || 
                           msgElement;

        let text = nodeToMarkdown(contentDiv);
        
        md += `**${role}:**\n\n${text}\n\n---\n\n`;
    });

    return md;
}

