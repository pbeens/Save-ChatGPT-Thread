
// Logic to be implemented
document.getElementById('saveBtn').addEventListener('click', () => {
    // Send message to content script
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = "Requesting chat data...";
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs[0].id) {
             statusDiv.textContent = "Error: No active tab.";
             return;
        }

        chrome.tabs.sendMessage(tabs[0].id, {action: "get_chat_content"}, function(response) {
            if (chrome.runtime.lastError) {
                // If content script isn't loaded yet (e.g. fresh install on open tab), we can try to inject it or warn user
                statusDiv.textContent = "Error: Refresh page and try again.";
                console.error(chrome.runtime.lastError);
            } else if (response && response.data) {
                downloadFile(response.data, response.title || "chatgpt-thread.md");
                statusDiv.textContent = "Saved!";
                statusDiv.classList.add("success");
            } else {
                statusDiv.textContent = "Failed to retrieve chat.";
                statusDiv.classList.add("error");
            }
        });
    });
});

function downloadFile(content, filename) {
    const blob = new Blob([content], {type: "text/markdown"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
