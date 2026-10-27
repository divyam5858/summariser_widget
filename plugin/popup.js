
const summarizeBtn = document.getElementById("summarizeBtn");
const statusElement = document.getElementById("status");
const resultElement = document.getElementById("result");

summarizeBtn.addEventListener("click", async () => {
  summarizeBtn.disabled = true;
  resultElement.textContent = "";
  statusElement.textContent = "Reading webpage...";

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab?.id || !tab.url?.startsWith("http")) {
      throw new Error(
        "Open a normal website or article before summarizing."
      );
    }

    const injection = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "GET_PAGE_TEXT"
    });

    const pageText = response?.text?.trim();

    if (!pageText) {
      throw new Error("No readable text was found on this page.");
    }

    statusElement.textContent = "Generating AI summary...";

    const apiResponse = await fetch(
      "http://localhost:3000/api/summarize",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: pageText })
      }
    );

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      throw new Error(data.message || "Summarization failed.");
    }

    resultElement.textContent = data.summary;
    statusElement.textContent = `Summary ready: ${response.title || "Webpage"}`;
  } catch (error) {
    console.error("Summarization error:", error);
    statusElement.textContent = error.message || "Something went wrong.";
  } finally {
    summarizeBtn.disabled = false;
  }
});
