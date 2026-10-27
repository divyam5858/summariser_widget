
(() => {
  // Prevent the widget from being added twice on the same page.
  if (document.getElementById("reusable-ai-summarizer")) {
    return;
  }

  // Configure the API endpoint.
  // This is for local development only.
  const API_URL = "http://localhost:3000/api/summarize";

  // Create an isolated host element.
  const host = document.createElement("div");
  host.id = "reusable-ai-summarizer";

  Object.assign(host.style, {
    position: "fixed",
    right: "24px",
    bottom: "24px",
    zIndex: "2147483647"
  });

  document.body.appendChild(host);

  // Shadow DOM prevents most website CSS from affecting our widget.
  const shadow = host.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
      * {
        box-sizing: border-box;
      }

      .launcher {
        width: 60px;
        height: 60px;
        border: none;
        border-radius: 50%;
        background: #2563eb;
        color: white;
        font-size: 26px;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }

      .launcher:hover {
        background: #1d4ed8;
      }

      .panel {
        position: absolute;
        right: 0;
        bottom: 74px;
        display: flex;
        flex-direction: column;
        width: min(360px, calc(100vw - 32px));
        height: min(500px, calc(100vh - 120px));
        background: #ffffff;
        color: #1f2937;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
        overflow: hidden;
        font-family: Arial, sans-serif;
      }

      .panel[hidden] {
        display: none;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 16px;
        background: #2563eb;
        color: #ffffff;
      }

      .title {
        margin: 0;
        font-size: 17px;
        font-weight: 700;
      }

      .subtitle {
        margin: 5px 0 0;
        font-size: 12px;
        line-height: 1.4;
        opacity: 0.9;
      }

      .close {
        border: none;
        background: transparent;
        color: white;
        font-size: 24px;
        cursor: pointer;
      }

      .content {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 10px;
        min-height: 0;
        padding: 16px;
      }

      label {
        font-size: 13px;
        font-weight: 700;
      }

      textarea {
        width: 100%;
        min-height: 120px;
        flex: 1;
        resize: vertical;
        padding: 12px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font: 14px/1.5 Arial, sans-serif;
        color: #1f2937;
      }

      textarea:focus {
        outline: 2px solid #93c5fd;
        border-color: #2563eb;
      }

      .count {
        margin: 0;
        text-align: right;
        color: #64748b;
        font-size: 11px;
      }

      .summarize {
        padding: 12px;
        border: none;
        border-radius: 8px;
        background: #2563eb;
        color: white;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
      }

      .summarize:disabled {
        opacity: 0.6;
        cursor: wait;
      }

      .status {
        margin: 0;
        font-size: 12px;
        line-height: 1.5;
        overflow-wrap: anywhere;
      }

      .result {
        max-height: 150px;
        overflow: auto;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        font-size: 13px;
        line-height: 1.6;
      }

      @media (max-width: 420px) {
        .panel {
          right: -8px;
        }
      }
    </style>

    <button
      class="launcher"
      type="button"
      aria-label="Open AI summarizer"
      aria-expanded="false"
      title="AI Summarizer"
    >AI</button>

    <section class="panel" aria-label="AI summarizer" hidden>
      <header class="header">
        <div>
          <h2 class="title">AI Summarizer</h2>
          <p class="subtitle">Summarize text without leaving this page.</p>
        </div>
        <button class="close" type="button" aria-label="Close">×</button>
      </header>

      <div class="content">
        <label for="summary-input">Text to summarize</label>
        <textarea
          id="summary-input"
          maxlength="30000"
          placeholder="Paste your text here..."
        ></textarea>

        <p class="count">0 / 30000 characters</p>

        <button class="summarize" type="button">
          Summarize Text
        </button>

        <p class="status" role="status" aria-live="polite"></p>
        <div class="result" aria-label="Summary result"></div>
      </div>
    </section>
  `;

  // Find elements inside the isolated widget.
  const launcher = shadow.querySelector(".launcher");
  const panel = shadow.querySelector(".panel");
  const closeButton = shadow.querySelector(".close");
  const input = shadow.querySelector("#summary-input");
  const count = shadow.querySelector(".count");
  const summarizeButton = shadow.querySelector(".summarize");
  const status = shadow.querySelector(".status");
  const result = shadow.querySelector(".result");

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));

    if (open) {
      input.focus();
    }
  }

  launcher.addEventListener("click", () => {
    setOpen(panel.hidden);
  });

  closeButton.addEventListener("click", () => {
    setOpen(false);
  });

  input.addEventListener("input", () => {
    count.textContent = `${input.value.length} / 30000 characters`;
  });

  summarizeButton.addEventListener("click", async () => {
    const text = input.value.trim();

    if (!text) {
      status.textContent = "Please enter some text first.";
      result.textContent = "";
      return;
    }

    summarizeButton.disabled = true;
    summarizeButton.textContent = "Summarizing...";
    status.textContent = "Generating your summary...";
    result.textContent = "";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Request failed (${response.status}).`
        );
      }

      if (typeof data.summary !== "string" || !data.summary.trim()) {
        throw new Error("The API returned an empty summary.");
      }

      result.textContent = data.summary;
      status.textContent = "Summary generated successfully!";
    } catch (error) {
      console.error("Embeddable summarizer error:", error);

      status.textContent =
        error instanceof TypeError
          ? "Could not connect to the backend. Check that it is running."
          : error.message || "Something went wrong.";
    } finally {
      summarizeButton.disabled = false;
      summarizeButton.textContent = "Summarize Text";
    }
  });
})();
