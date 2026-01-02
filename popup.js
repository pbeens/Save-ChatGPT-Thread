// Logic to be implemented
document.getElementById('saveBtn').addEventListener('click', async () => {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = "Requesting chat data...";
    statusDiv.className = "status"; // reset classes

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
            statusDiv.textContent = "Error: No active tab.";
            return;
        }

        // Try to send message, if it fails, inject script and retry
        sendMessageWithRetry(tab.id, statusDiv);
    } catch (err) {
        console.error(err);
        statusDiv.textContent = "Error: " + err.message;
        statusDiv.classList.add("error");
    }
});

function sendMessageWithRetry(tabId, statusDiv, retryCount = 0) {
    chrome.tabs.sendMessage(tabId, { action: "get_chat_content" }, async (response) => {
        if (chrome.runtime.lastError) {
            console.log("Connection error, attempting injection...", chrome.runtime.lastError.message);
            
            if (retryCount === 0) {
                try {
                    // Inject script
                    await chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ['content.js']
                    });
                    // Retry once
                    setTimeout(() => sendMessageWithRetry(tabId, statusDiv, 1), 100);
                } catch (injectErr) {
                    console.error("Injection failed:", injectErr);
                    statusDiv.textContent = "Error: Could not start script on this page.";
                    statusDiv.classList.add("error");
                }
            } else {
                statusDiv.textContent = "Error: Connection failed after injection.";
                statusDiv.classList.add("error");
            }
        } else if (response && response.data) {
            downloadFile(response.data, response.title || "chat-thread.md");
            statusDiv.textContent = "Saved!";
            statusDiv.classList.add("success");
        } else if (response && response.error) {
            statusDiv.textContent = "Error: " + response.error;
            statusDiv.classList.add("error");
        } else {
            statusDiv.textContent = "Failed to retrieve chat.";
            statusDiv.classList.add("error");
        }
    });
}

function downloadFile(content, filename) {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
