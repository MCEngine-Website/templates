// Dynamically load external CSS for markdown and code styling
(function loadMarkdownCSS() {
  // Get current script's directory
  const currentScript = document.currentScript || (function () {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const scriptDir = currentScript.src.substring(0, currentScript.src.lastIndexOf('/'));

  // Build full path to CSS relative to this script
  const cssPath = scriptDir + '/../css/partials/content_md_style.css';

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssPath;
  link.type = 'text/css';
  link.onload = () => console.log('Markdown CSS loaded');
  link.onerror = () => console.error('Failed to load Markdown CSS at', cssPath);
  document.head.appendChild(link);
})();

// Load markdown files and inject into a container
async function loadMarkdownFiles(folderPath, containerId, fileList) {
  const container = document.getElementById(containerId);
  if (!container) return;

  for (const file of fileList) {
    try {
      const res = await fetch(folderPath + file);
      const md = await res.text();

      const section = document.createElement('div');
      section.className = 'box';
      section.style.marginBottom = '1rem';

      const body = document.createElement('div');
      body.className = 'markdown-body';
      body.innerHTML = marked.parse(md);

      // Add copy buttons to each <pre> block
      const preBlocks = body.querySelectorAll('pre');
      preBlocks.forEach(pre => {
        const code = pre.querySelector('code');
        if (!code) return;

        const button = document.createElement('button');
        button.textContent = 'Copy';
        button.className = 'copy-btn';

        button.addEventListener('click', () => {
          navigator.clipboard.writeText(code.textContent)
            .then(() => {
              button.textContent = 'Copied!';
              setTimeout(() => button.textContent = 'Copy', 1500);
            })
            .catch(err => {
              console.error('Copy failed:', err);
              button.textContent = 'Error';
              setTimeout(() => button.textContent = 'Copy', 1500);
            });
        });

        pre.appendChild(button);
      });

      section.appendChild(body);
      container.appendChild(section);
    } catch (err) {
      console.error(`Failed to load ${file}:`, err);
    }
  }
}
