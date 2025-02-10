document.addEventListener("DOMContentLoaded", () => {
  const htmlEditor = document.querySelector("#html-editor");
  const cssEditor = document.querySelector("#css-editor");
  const jsEditor = document.querySelector("#js-editor");
  const previewFrame = document.querySelector("#preview-frame");
  const consoleOutput = document.querySelector("#console-output");
  const resetButton = document.querySelector("#reset-button");
  const themeSwitcher = document.querySelector("#theme-switcher");
  const saveButton = document.querySelector("#save-button");
  const loadButton = document.querySelector("#load-button");

  // Initialize CodeMirror editors
  const cmHtml = CodeMirror.fromTextArea(htmlEditor, {
    mode: "htmlmixed",
    lineNumbers: true,
    theme: "dracula",
    extraKeys: { "Ctrl-Space": "autocomplete" },
    viewportMargin: Infinity,
  });

  const cmCss = CodeMirror.fromTextArea(cssEditor, {
    mode: "css",
    lineNumbers: true,
    theme: "dracula",
    extraKeys: { "Ctrl-Space": "autocomplete" },
    viewportMargin: Infinity,
  });

  const cmJs = CodeMirror.fromTextArea(jsEditor, {
    mode: "javascript",
    lineNumbers: true,
    theme: "dracula",
    extraKeys: { "Ctrl-Space": "autocomplete" },
    viewportMargin: Infinity,
  });

  function updatePreview() {
    try {
      const htmlContent = cmHtml.getValue();
      const cssContent = `<style>${cmCss.getValue()}</style>`;
      const jsContent = `<script>
                window.console.log = function(...args) {
                    parent.postMessage({ type: 'log', message: args.join(' ') }, '*');
                };
                ${cmJs.getValue()}
            <\/script>`;

      const frameDoc =
        previewFrame.contentDocument || previewFrame.contentWindow.document;
      frameDoc.open();
      frameDoc.write(htmlContent + cssContent + jsContent);
      frameDoc.close();

      consoleOutput.textContent = "";
    } catch (error) {
      consoleOutput.textContent = `Error: ${error.message}`;
    }
  }

  [cmHtml, cmCss, cmJs].forEach((editor) => {
    editor.on("change", updatePreview);
  });

  window.addEventListener("message", (event) => {
    if (event.data.type === "log") {
      consoleOutput.textContent += `${event.data.message}\n`;
    }
  });

  resetButton.addEventListener("click", () => {
    cmHtml.setValue('<div class="box">Hello, World!</div>');
    cmCss.setValue(
      ".box { width: 200px; height: 100px; background-color: lightblue; display: flex; justify-content: center; align-items: center; border-radius: 10px; font-size: 20px; color: white; }"
    );
    cmJs.setValue(
      'document.querySelector(".box").addEventListener("click", () => { console.log("Box clicked!"); });'
    );
    updatePreview();
  });

  themeSwitcher.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    themeSwitcher.textContent = document.body.classList.contains("dark-mode")
      ? "Light Mode"
      : "Dark Mode";
  });

  saveButton.addEventListener("click", () => {
    const blob = new Blob(
      [
        JSON.stringify({
          html: cmHtml.getValue(),
          css: cmCss.getValue(),
          js: cmJs.getValue(),
        }),
      ],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sandbox-code.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  loadButton.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = JSON.parse(e.target.result);
          cmHtml.setValue(data.html || "");
          cmCss.setValue(data.css || "");
          cmJs.setValue(data.js || "");
          updatePreview();
        };
        reader.readAsText(file);
      }
    };
    input.click();
  });

  updatePreview();
});
