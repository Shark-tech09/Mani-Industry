// editor-setup.js — Monaco Editor + Pyodide Python Runner
// Used by lesson.html for the built-in code editor

let monacoEditor = null;
let pyodideInstance = null;
let pyodideReady = false;

// =====================================================
// MONACO EDITOR SETUP
// =====================================================
function initMonacoEditor(containerId, language = 'python', initialCode = '') {
  if (typeof monaco === 'undefined') {
    console.error('Monaco not loaded. Include the Monaco loader script first.');
    return;
  }

  monacoEditor = monaco.editor.create(document.getElementById(containerId), {
    value: initialCode || getStarterCode(language),
    language: language,
    theme: 'vs-dark',
    fontSize: 14,
    fontFamily: "'Cascadia Code', 'Fira Code', 'Courier New', monospace",
    lineNumbers: 'on',
    minimap: { enabled: false },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    padding: { top: 16, bottom: 16 },
    cursorBlinking: 'smooth',
    smoothScrolling: true,
    wordWrap: 'on',
    renderLineHighlight: 'all',
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    tabSize: 4,
  });

  // Override Monaco background to match theme
  monaco.editor.defineTheme('mani-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#070f20',
      'editor.lineHighlightBackground': '#0a1628',
      'editorLineNumber.foreground': '#3a5068',
      'editorLineNumber.activeForeground': '#00c8ff',
      'editor.selectionBackground': '#1a4a6a',
    }
  });
  monaco.editor.setTheme('mani-dark');

  return monacoEditor;
}

function getEditorValue() {
  return monacoEditor ? monacoEditor.getValue() : '';
}

function setEditorValue(code) {
  if (monacoEditor) monacoEditor.setValue(code);
}

function setEditorLanguage(lang) {
  if (monacoEditor) {
    monaco.editor.setModelLanguage(monacoEditor.getModel(), lang);
  }
}

// =====================================================
// PYODIDE — Run Python in browser (WebAssembly)
// =====================================================
async function loadPyodideEngine() {
  const statusEl = document.getElementById('runnerStatus');
  if (statusEl) statusEl.textContent = 'Loading Python engine...';

  try {
    pyodideInstance = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      stdout: (text) => appendOutput(text),
      stderr: (text) => appendOutput('ERROR: ' + text, true),
    });
    pyodideReady = true;
    if (statusEl) statusEl.textContent = 'Python ready ✓';
    setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 2000);
  } catch (e) {
    if (statusEl) statusEl.textContent = 'Python engine failed to load';
    console.error('Pyodide load error:', e);
  }
}

async function runPythonCode() {
  const code = getEditorValue();
  const outputEl = document.getElementById('codeOutput');
  if (!outputEl) return;

  clearOutput();

  if (!pyodideReady) {
    appendOutput('Python engine loading... please wait and try again.', true);
    loadPyodideEngine();
    return;
  }

  try {
    // Redirect stdout/stderr to our output panel
    await pyodideInstance.runPythonAsync(`
import sys
import io
_stdout_capture = io.StringIO()
_stderr_capture = io.StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
`);
    await pyodideInstance.runPythonAsync(code);
    const stdout = pyodideInstance.runPython('_stdout_capture.getvalue()');
    const stderr = pyodideInstance.runPython('_stderr_capture.getvalue()');
    if (stdout) appendOutput(stdout);
    if (stderr) appendOutput(stderr, true);
    if (!stdout && !stderr) appendOutput('(no output)');
  } catch (err) {
    appendOutput(err.message, true);
  }
}

function appendOutput(text, isError = false) {
  const outputEl = document.getElementById('codeOutput');
  if (!outputEl) return;
  const line = document.createElement('div');
  line.style.color = isError ? '#ff5577' : '#e8f4ff';
  line.style.fontFamily = 'monospace';
  line.style.fontSize = '0.9rem';
  line.style.lineHeight = '1.6';
  line.style.whiteSpace = 'pre-wrap';
  line.textContent = text;
  outputEl.appendChild(line);
  outputEl.scrollTop = outputEl.scrollHeight;
}

function clearOutput() {
  const outputEl = document.getElementById('codeOutput');
  if (outputEl) outputEl.innerHTML = '';
}

function downloadCode() {
  const code = getEditorValue();
  const lang = monacoEditor?.getModel()?.getLanguageId() || 'python';
  const ext = lang === 'python' ? 'py' : lang === 'javascript' ? 'js' : lang === 'java' ? 'java' : 'txt';
  const blob = new Blob([code], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `mani_code.${ext}`;
  a.click();
}

// =====================================================
// STARTER CODE TEMPLATES
// =====================================================
function getStarterCode(language) {
  const templates = {
    python: `# Welcome to Mani Industries Code Editor
# Write your Python code below

def greet(name):
    return f"Hello, {name}! Let's code!"

print(greet("Mani Industries"))

# Try: print, loops, functions, OOP
for i in range(1, 6):
    print(f"Step {i}: Keep learning!")
`,
    javascript: `// Welcome to Mani Industries Code Editor
// Write your JavaScript below

function greet(name) {
  return \`Hello, \${name}! Let's code!\`;
}

console.log(greet('Mani Industries'));

// Try: functions, loops, objects, APIs
const steps = [1, 2, 3, 4, 5];
steps.forEach(step => console.log(\`Step \${step}: Keep learning!\`));
`,
    java: `// Java code runs via server — paste and download
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Mani Industries!");
        
        for (int i = 1; i <= 5; i++) {
            System.out.println("Step " + i + ": Keep learning!");
        }
    }
}
`,
    cpp: `// C++ — paste and download to compile locally
#include <iostream>
using namespace std;

int main() {
    cout << "Hello from Mani Industries!" << endl;
    
    for (int i = 1; i <= 5; i++) {
        cout << "Step " << i << ": Keep learning!" << endl;
    }
    return 0;
}
`
  };
  return templates[language] || `// Start coding here\n`;
}
