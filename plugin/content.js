
function extractPageText() {
  const selectorsToRemove = [
    "script",
    "style",
    "noscript",
    "nav",
    "header",
    "footer",
    "aside",
    "[role='navigation']",
    "[aria-hidden='true']"
  ];

  const clone = document.body.cloneNode(true);

  selectorsToRemove.forEach((selector) => {
    clone.querySelectorAll(selector).forEach((element) => {
      element.remove();
    });
  });

  return (clone.innerText || clone.textContent || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 30000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "GET_PAGE_TEXT") {
    sendResponse({
      text: extractPageText(),
      title: document.title
    });
  }
});
