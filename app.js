import { processFarmerQuery } from './agents.js';

// ==========================================================================
//  DOM Elements
// ==========================================================================
const userInput     = document.getElementById('user-input');
const sendBtn       = document.getElementById('send-btn');
const chatBox       = document.getElementById('chat-box');
const apiKeyInput   = document.getElementById('api-key-input');
const clearInputBtn = document.getElementById('clear-input-btn');
const startChatBtn  = document.getElementById('start-chat-btn');
const landingScreen = document.getElementById('landing-screen');
const appWorkspace  = document.getElementById('app-workspace');
const sidebarToggle = document.getElementById('sidebar-toggle-btn');
const workspaceGrid = document.getElementById('workspace-grid');
const welcomeCard   = document.getElementById('welcome-card');

// Telemetry Elements
const telemetryAgent           = document.getElementById('telemetry-agent');
const telemetryCrop            = document.getElementById('telemetry-crop');
const telemetrySoil            = document.getElementById('telemetry-soil');
const telemetrySeason          = document.getElementById('telemetry-season');
const telemetryConfidence      = document.getElementById('telemetry-confidence');
const telemetryStatus          = document.getElementById('telemetry-status');
const telemetryConfidenceBarWrap = document.getElementById('telemetry-confidence-bar-wrap');
const telemetryConfidenceBar   = document.getElementById('telemetry-confidence-bar');

// Track whether user has sent first message
let hasConversationStarted = false;

// ==========================================================================
//  Landing → App Navigation
// ==========================================================================
if (startChatBtn) {
  startChatBtn.addEventListener('click', () => {
    landingScreen.classList.add('hidden');
    appWorkspace.classList.remove('hidden');
    userInput.focus();
  });
}

// ==========================================================================
//  Sidebar Toggle
// ==========================================================================
if (sidebarToggle && workspaceGrid) {
  sidebarToggle.addEventListener('click', () => {
    const collapsed = workspaceGrid.classList.toggle('sidebar-collapsed');
    sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
  });
}

// ==========================================================================
//  Clear Input
// ==========================================================================
if (clearInputBtn) {
  clearInputBtn.addEventListener('click', () => {
    userInput.value = '';
    userInput.focus();
  });
}

// ==========================================================================
//  API Key Persistence
// ==========================================================================
if (localStorage.getItem('gemini_api_key')) {
  apiKeyInput.value = localStorage.getItem('gemini_api_key');
}
updateDiagApiStatus();

apiKeyInput.addEventListener('change', () => {
  localStorage.setItem('gemini_api_key', apiKeyInput.value.trim());
  updateDiagApiStatus();
});

function updateDiagApiStatus() {
  const diagApiStatus = document.getElementById('diag-api-status');
  if (diagApiStatus) {
    diagApiStatus.innerHTML = apiKeyInput.value.trim()
      ? '<span class="status-dot-green"></span> Live API'
      : 'Offline Mode';
  }
}

// ==========================================================================
//  Send Handlers
// ==========================================================================
sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSend();
});

// ==========================================================================
//  Friendly names for agents
// ==========================================================================
function getFriendlyCategoryName(category) {
  switch (category) {
    case 'CROP_RECOMMENDATION':  return 'Crop Advisor';
    case 'PEST_DISEASE_GUIDANCE': return 'Pest Expert';
    case 'GOVERNMENT_SCHEME':    return 'Gov Schemes';
    case 'GENERAL_ADVICE':       return 'General Advisor';
    case 'OUT_OF_DOMAIN':        return 'Guardrail Agent';
    default:                     return 'Router Agent';
  }
}

/** Human-readable banner label shown above each AI response */
function getAgentBannerLabel(category) {
  switch (category) {
    case 'CROP_RECOMMENDATION':  return '🌾 Crop Recommendation Agent';
    case 'PEST_DISEASE_GUIDANCE': return '🐛 Pest Detection Agent';
    case 'GOVERNMENT_SCHEME':    return '🏛 Government Scheme Advisor';
    case 'GENERAL_ADVICE':       return '🌱 Organic Farming Advisor';
    case 'OUT_OF_DOMAIN':        return '🤖 Guardrail Agent';
    default:                     return '🧭 Router Agent';
  }
}

/** CSS class modifier for the banner color */
function getAgentBannerClass(category) {
  switch (category) {
    case 'PEST_DISEASE_GUIDANCE': return 'pest';
    case 'GOVERNMENT_SCHEME':    return 'scheme';
    case 'GENERAL_ADVICE':       return 'general';
    case 'OUT_OF_DOMAIN':        return 'out';
    default:                     return '';
  }
}

// ==========================================================================
//  Workflow Step Highlighter
// ==========================================================================
function setWorkflowStep(stepNum) {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`wf-step-${i}`);
    if (el) el.classList.toggle('active', i <= stepNum);
  }
}

// ==========================================================================
//  Core Chat Orchestrator
// ==========================================================================
async function handleSend() {
  const query = userInput.value.trim();
  if (!query) return;

  userInput.value = '';

  // Hide welcome card on first message
  if (!hasConversationStarted) {
    hasConversationStarted = true;
    if (welcomeCard) {
      welcomeCard.style.animation = 'pageFadeIn 0.3s ease reverse';
      setTimeout(() => welcomeCard.remove(), 300);
    }
  }

  // Disable send during processing
  setSendLoading(true);

  // 1. User message bubble
  appendMessage(query, 'user');

  // 2. Skeleton loading bubble
  const loadingId = appendLoadingBubble();

  // 3. Show Router Agent active + update telemetry + workflow
  setActiveAgent('agent-router');
  updateTelemetry({
    agent: 'Router Agent',
    status: 'Routing query...',
    crop: 'Detecting...',
    soil: 'Detecting...',
    season: 'Detecting...',
    confidence: '--'
  });
  setWorkflowStep(1);

  try {
    const apiKey = apiKeyInput.value.trim();

    // Simulated routing delay for pipeline UX
    await delay(500);
    setWorkflowStep(2);
    await delay(300);
    setWorkflowStep(3);

    // 4. Multi-Agent Processing
    const result = await processFarmerQuery(query, apiKey);

    // 5. Activate specialized agent
    const agentId = getAgentElementId(result.category);
    setActiveAgent(agentId);

    // 6. Parse confidence and update telemetry
    const parsedConfidence = extractConfidence(result.response);
    updateTelemetry({
      agent: getFriendlyCategoryName(result.category),
      status: result.isMock ? 'Offline Mode' : 'Live Gemini API',
      crop: result.extractedParams?.crop_name || 'None',
      soil: result.extractedParams?.soil_type || 'None',
      season: result.extractedParams?.season || 'None',
      confidence: parsedConfidence || 'High'
    });
    setWorkflowStep(4);

    // 7. Show response
    removeBubble(loadingId);
    appendAgentMessage(result);

  } catch (error) {
    console.error(error);
    removeBubble(loadingId);
    appendMessage(`An error occurred: ${error.message}. Please verify settings.`, 'agent', 'SYSTEM_ERROR');
    clearActiveAgents();
    setWorkflowStep(1);
    updateTelemetry({ agent: 'System', status: 'Error occurred', confidence: 'Low' });
  } finally {
    setSendLoading(false);
  }
}

// ==========================================================================
//  Helpers
// ==========================================================================
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function setSendLoading(loading) {
  if (!sendBtn) return;
  if (loading) {
    sendBtn.classList.add('loading');
    sendBtn.innerHTML = `<span class="agent-spinner"></span> <span>Thinking...</span>`;
  } else {
    sendBtn.classList.remove('loading');
    sendBtn.innerHTML = `<span>Send</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
        <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
      </svg>`;
  }
}

function extractConfidence(text) {
  const match = text.match(/Confidence Level\s*\n*[-*]*\s*\**([A-Za-z0-9\s()%\-]+)\**/i);
  if (match && match[1]) return match[1].split('-')[0].trim();
  return null;
}

// ==========================================================================
//  Telemetry Dashboard Updater
// ==========================================================================
function updateTelemetry(data) {
  if (data.agent && telemetryAgent) telemetryAgent.textContent = data.agent;

  if (data.crop && telemetryCrop) {
    telemetryCrop.textContent = data.crop;
    const card = document.getElementById('telemetry-crop-card');
    if (card) card.style.borderColor = (data.crop !== 'None' && data.crop !== 'Detecting...') ? 'rgba(46,125,50,0.25)' : '';
  }

  if (data.soil   && telemetrySoil)   telemetrySoil.textContent   = data.soil;
  if (data.season && telemetrySeason) telemetrySeason.textContent = data.season;

  if (data.confidence && telemetryConfidence) {
    telemetryConfidence.textContent = data.confidence;

    let percent = 0;
    const cl = data.confidence.toLowerCase();
    const pm = cl.match(/(\d+)%/);
    if (pm)                  percent = parseInt(pm[1]);
    else if (cl.includes('high'))   percent = 90;
    else if (cl.includes('medium')) percent = 60;
    else if (cl.includes('low'))    percent = 30;

    if (percent > 0 && telemetryConfidenceBar && telemetryConfidenceBarWrap) {
      telemetryConfidenceBarWrap.style.display = 'block';
      telemetryConfidenceBar.style.width = percent + '%';
      telemetryConfidenceBar.style.backgroundColor =
        percent >= 80 ? 'var(--emerald-light)' :
        percent >= 50 ? 'var(--warning-orange)' :
                        'var(--pest-red)';
    } else if (telemetryConfidenceBarWrap) {
      telemetryConfidenceBarWrap.style.display = 'none';
    }
  }

  if (data.status && telemetryStatus) telemetryStatus.textContent = data.status;
}

// ==========================================================================
//  Active Agent Indicator
// ==========================================================================
function setActiveAgent(elementId) {
  clearActiveAgents();
  const el = document.getElementById(elementId);
  if (el) el.classList.add('active');
}

function clearActiveAgents() {
  document.querySelectorAll('.agent-compact-item').forEach(item => item.classList.remove('active'));
}

function getAgentElementId(category) {
  switch (category) {
    case 'CROP_RECOMMENDATION':  return 'agent-crop';
    case 'PEST_DISEASE_GUIDANCE': return 'agent-pest';
    case 'GOVERNMENT_SCHEME':    return 'agent-scheme';
    case 'GENERAL_ADVICE':       return 'agent-general';
    case 'OUT_OF_DOMAIN':
    default:
      return 'agent-general';
  }
}

// ==========================================================================
//  Message Rendering
// ==========================================================================

/** Simple user message */
function appendMessage(text, sender, category = '') {
  const div = document.createElement('div');
  div.className = `message ${sender}-msg animate-fade`;

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble-content';
  bubble.textContent = text;
  div.appendChild(bubble);

  const meta = document.createElement('span');
  meta.className = `${sender}-msg-meta`;
  meta.textContent = sender === 'user' ? 'Farmer' : (category || 'KhetiMitra');
  div.appendChild(meta);

  chatBox.appendChild(div);
  scrollToBottom();
}

/** Skeleton loader while waiting */
function appendLoadingBubble() {
  const id = 'loading-' + Date.now();
  const div = document.createElement('div');
  div.className = 'message agent-msg animate-fade';
  div.id = id;

  div.innerHTML = `
    <div class="agent-header-row">
      <span class="agent-avatar" style="background:var(--light-green-bg);">
        <span class="agent-spinner"></span>
      </span>
      <span class="agent-title-tag" style="display:flex;align-items:center;gap:0.4rem;">
        KhetiMitra is thinking
        <span class="typing-dots" aria-label="Thinking">
          <span></span><span></span><span></span>
        </span>
      </span>
    </div>
    <div class="skeleton-msg-wrap">
      <div class="skeleton-bar w-90"></div>
      <div class="skeleton-bar w-full"></div>
      <div class="skeleton-bar w-75"></div>
      <div class="skeleton-bar w-80"></div>
      <div class="skeleton-bar w-60"></div>
    </div>
  `;

  chatBox.appendChild(div);
  scrollToBottom();
  return id;
}

/** Remove a bubble by id */
function removeBubble(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

/** Full AI response message */
function appendAgentMessage(result) {
  const div = document.createElement('div');
  div.className = 'message agent-msg animate-fade';

  // ── Active Agent Banner ──
  const banner = document.createElement('div');
  const bannerClass = getAgentBannerClass(result.category);
  banner.className = `active-agent-banner ${bannerClass}`.trim();
  banner.textContent = getAgentBannerLabel(result.category);
  div.appendChild(banner);

  // ── Avatar + Title Row ──
  const headerRow = document.createElement('div');
  headerRow.className = 'agent-header-row';

  const avatar = document.createElement('span');
  avatar.className = 'agent-avatar';
  avatar.setAttribute('aria-hidden', 'true');

  const emojiMap = {
    CROP_RECOMMENDATION:  '🌾',
    PEST_DISEASE_GUIDANCE: '🐛',
    GOVERNMENT_SCHEME:    '🏛',
    OUT_OF_DOMAIN:        '🤖',
    GENERAL_ADVICE:       '🌿',
  };
  avatar.textContent = emojiMap[result.category] || '🌿';

  const titleTag = document.createElement('span');
  titleTag.className = 'agent-title-tag';
  titleTag.textContent = result.category.replace(/_/g, ' ');

  const colorMap = {
    CROP_RECOMMENDATION:   'var(--emerald)',
    PEST_DISEASE_GUIDANCE: 'var(--pest-red)',
    GOVERNMENT_SCHEME:     'var(--info-blue)',
  };
  if (colorMap[result.category]) titleTag.style.color = colorMap[result.category];

  headerRow.appendChild(avatar);
  headerRow.appendChild(titleTag);
  div.appendChild(headerRow);

  // ── Response Bubble ──
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble-content';

  // Special rendering for OUT_OF_DOMAIN
  if (result.category === 'OUT_OF_DOMAIN') {
    bubble.innerHTML = buildOutOfDomainCard();
  } else {
    bubble.innerHTML = parseStructuredResponse(result.response);
  }

  // Extracted parameters mini-tag
  if (result.extractedParams && Object.keys(result.extractedParams).length > 0) {
    const items = Object.entries(result.extractedParams)
      .filter(([, v]) => v && v !== '...')
      .map(([k, v]) => `${k.replace('_', ' ')}: <em>"${v}"</em>`);

    if (items.length > 0) {
      const paramsDiv = document.createElement('div');
      paramsDiv.style.cssText = 'font-size:0.72rem;color:var(--text-muted);margin-top:1rem;padding:0.4rem 0.6rem;background:rgba(0,0,0,0.02);border-radius:6px;border:1px dashed var(--border-glass);';
      paramsDiv.innerHTML = `<strong>Extracted Parameters:</strong> ${items.join(', ')}`;
      bubble.appendChild(paramsDiv);
    }
  }

  div.appendChild(bubble);

  // ── Footer (routing reason) ──
  const meta = document.createElement('span');
  meta.className = 'message-footer-info';
  const modeStr = result.isMock ? 'Offline Mode' : 'Live Gemini API';
  meta.innerHTML = `${modeStr} • Routed by Router Agent because: <em>"${result.routingReason}"</em>`;
  div.appendChild(meta);

  // ── Response Action Buttons ──
  const actionsRow = buildResponseActions(result.response);
  div.appendChild(actionsRow);

  chatBox.appendChild(div);
  scrollToBottom();
}

/** Build the out-of-domain information card */
function buildOutOfDomainCard() {
  return `
    <div class="out-of-domain-card">
      <span class="ood-icon">🚫</span>
      <div class="ood-content">
        <div class="ood-title">Outside Agriculture Scope</div>
        <div class="ood-msg">
          I can only answer <strong>agriculture-related questions</strong>.<br>
          Please ask about crops, soil, irrigation, fertilizers, weather, plant diseases, pests or farming practices.
        </div>
        <div class="ood-topics">
          <span class="ood-topic-tag">🌾 Crops</span>
          <span class="ood-topic-tag">🌱 Soil</span>
          <span class="ood-topic-tag">💧 Irrigation</span>
          <span class="ood-topic-tag">🌿 Fertilizers</span>
          <span class="ood-topic-tag">🌦 Weather</span>
          <span class="ood-topic-tag">🐛 Pest Control</span>
          <span class="ood-topic-tag">🏛 Gov. Schemes</span>
        </div>
      </div>
    </div>
  `;
}

/** Response action buttons: Copy / Helpful / Not Helpful */
function buildResponseActions(responseText) {
  const row = document.createElement('div');
  row.className = 'response-actions-row';
  row.setAttribute('role', 'group');
  row.setAttribute('aria-label', 'Response actions');

  // Copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'response-action-btn';
  copyBtn.innerHTML = '📋 Copy Response';
  copyBtn.setAttribute('aria-label', 'Copy this response to clipboard');
  copyBtn.addEventListener('click', () => {
    const plainText = responseText.replace(/#+\s?/g, '').replace(/\*\*/g, '').replace(/\*/g, '').trim();
    navigator.clipboard.writeText(plainText).then(() => {
      copyBtn.classList.add('copied');
      copyBtn.innerHTML = '✅ Copied!';
      showToast('✅ Response copied to clipboard');
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.innerHTML = '📋 Copy Response';
      }, 2000);
    }).catch(() => showToast('⚠️ Could not copy text'));
  });

  // Helpful button
  const helpfulBtn = document.createElement('button');
  helpfulBtn.className = 'response-action-btn';
  helpfulBtn.innerHTML = '👍 Helpful';
  helpfulBtn.setAttribute('aria-label', 'Mark response as helpful');
  helpfulBtn.addEventListener('click', () => {
    helpfulBtn.classList.toggle('active-helpful');
    notHelpfulBtn.classList.remove('active-nothelpful');
    showToast('👍 Thanks for your feedback!');
  });

  // Not Helpful button
  const notHelpfulBtn = document.createElement('button');
  notHelpfulBtn.className = 'response-action-btn';
  notHelpfulBtn.innerHTML = '👎 Not Helpful';
  notHelpfulBtn.setAttribute('aria-label', 'Mark response as not helpful');
  notHelpfulBtn.addEventListener('click', () => {
    notHelpfulBtn.classList.toggle('active-nothelpful');
    helpfulBtn.classList.remove('active-helpful');
    showToast('👎 Feedback noted. We\'ll improve!');
  });

  row.appendChild(copyBtn);
  row.appendChild(helpfulBtn);
  row.appendChild(notHelpfulBtn);
  return row;
}

/** Auto-scroll chat to latest message */
function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

/** Show a toast notification */
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ==========================================================================
//  Global setSuggestion (used by chips + welcome cards)
// ==========================================================================
window.setSuggestion = function(val) {
  if (userInput) {
    userInput.value = val;
    userInput.focus();
  }
};

// ==========================================================================
//  Structured Response Parser
// ==========================================================================
const WIDGET_ICONS = {
  'reasoning':                '🧠 Reasoning',
  'confidence level':         '🎯 Confidence Level',
  'conclusion':               '📋 Summary',
  'recommended crops':        '🌾 Recommended Crops',
  'why these crops?':         '🌱 Why These Crops?',
  'expected benefits':        '💰 Expected Benefits',
  'cultivation tips':         '🛠 Cultivation Tips',
  'possible diagnostics':     '🐛 Possible Diagnostics',
  'symptom analysis':         '🔍 Symptom Analysis',
  'preventive measures':      '🛡 Preventive Measures',
  'recommended actions':      '⚡ Recommended Actions',
  'safety disclaimer':        '⚠️ Safety Disclaimer',
  'relevant schemes':         '🏛 Relevant Schemes',
  'eligibility criteria':     '👥 Eligibility Criteria',
  'key benefits':             '🎁 Key Benefits',
  'application guidance':     '📝 Application Guidance',
  'practical advice':         '💡 Practical Advice',
  'practical farming advice': '💡 Practical Farming Advice',
  'out of domain':            '🚫 Out of Domain',
  'tips':                     '💡 Tips',
  'warnings':                 '⚠️ Warnings',
  'best practices':           '🌟 Best Practices'
};

function parseStructuredResponse(md) {
  const sections = md.split(/^### /gm);

  if (sections.length <= 1) {
    return `<p>${parseMarkdown(md)}</p>`;
  }

  let html = '';

  if (sections[0].trim()) {
    html += `<p>${parseMarkdown(sections[0].trim())}</p>`;
  }

  const cards = [];

  for (let i = 1; i < sections.length; i++) {
    const lines   = sections[i].split('\n');
    const title   = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();
    if (!content) continue;

    const key    = title.toLowerCase().replace(/[:\d%]/g, '').trim();
    const header = WIDGET_ICONS[key] || title;

    let cardClass = 'widget-card';
    if (key.includes('disclaimer') || key.includes('warning') || key.includes('safety')) {
      cardClass = 'highlight-block-warn';
    } else if (key.includes('benefit') || key.includes('action') || key.includes('recommended')) {
      cardClass = 'highlight-block-success';
    }

    const parsed = parseMarkdown(content);

    if (cardClass === 'widget-card') {
      cards.push(`<div class="${cardClass}"><h4>${header}</h4><div>${parsed}</div></div>`);
    } else {
      cards.push(`<div class="${cardClass}"><strong>${header}</strong><div style="margin-top:0.35rem;">${parsed}</div></div>`);
    }
  }

  html += `<div class="response-widget-container">${cards.join('')}</div>`;
  return html;
}

function parseMarkdown(md) {
  let html = md;
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim,  '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
  html = html.replace(/<\/ul>\s*<ul>/g, '');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g,     '<em>$1</em>');
  html = html.replace(/\n/g, '<br>');
  return html;
}

// ==========================================================================
//  Diagnostics Test Suite
// ==========================================================================
const testQueries = [
  // Crop Recommendation (8)
  { q: "Which crop should I grow in clay soil during winter?",           expected: "CROP_RECOMMENDATION" },
  { q: "What is suitable to grow in sandy loam soil in summer?",        expected: "CROP_RECOMMENDATION" },
  { q: "Suggest crops for monsoon season in red soil.",                  expected: "CROP_RECOMMENDATION" },
  { q: "Which seeds are best for cultivation in black soil?",            expected: "CROP_RECOMMENDATION" },
  { q: "Recommend crops for dry land.",                                  expected: "CROP_RECOMMENDATION" },
  { q: "Best crop to grow in alluvial soil in winter season.",           expected: "CROP_RECOMMENDATION" },
  { q: "What should I grow in black soil during monsoon?",               expected: "CROP_RECOMMENDATION" },
  { q: "Which seeds should I sow in sandy soil for winter?",             expected: "CROP_RECOMMENDATION" },

  // Pest & Disease (8)
  { q: "My rice leaves have strange yellow spots, what is it?",          expected: "PEST_DISEASE_GUIDANCE" },
  { q: "There are holes in my tomatoes, looks like worms are eating them.", expected: "PEST_DISEASE_GUIDANCE" },
  { q: "White insect patches on cotton leaves, please help.",             expected: "PEST_DISEASE_GUIDANCE" },
  { q: "Fungus infection on potato stalks, leaf rot seen.",               expected: "PEST_DISEASE_GUIDANCE" },
  { q: "How to cure root rot disease in sugarcane?",                      expected: "PEST_DISEASE_GUIDANCE" },
  { q: "Cotton leaves showing yellow spots and tiny whitefly insects.",   expected: "PEST_DISEASE_GUIDANCE" },
  { q: "My tomato crop is suffering from fruit borer worms.",             expected: "PEST_DISEASE_GUIDANCE" },
  { q: "Rice paddy blast fungal spots seen on leaves.",                   expected: "PEST_DISEASE_GUIDANCE" },

  // Government Schemes (7)
  { q: "Is there any subsidy available for buying a tractor?",           expected: "GOVERNMENT_SCHEME" },
  { q: "How to register for the PM Kisan Samman Nidhi scheme?",          expected: "GOVERNMENT_SCHEME" },
  { q: "What government help can I get for drought crop insurance?",      expected: "GOVERNMENT_SCHEME" },
  { q: "Are there loans or benefits for small organic farmers?",          expected: "GOVERNMENT_SCHEME" },
  { q: "Tell me about agricultural subsidies in my region.",              expected: "GOVERNMENT_SCHEME" },
  { q: "PMFBY crop insurance scheme enrollment criteria.",                expected: "GOVERNMENT_SCHEME" },
  { q: "Government pension schemes for old age farmers.",                 expected: "GOVERNMENT_SCHEME" },

  // General Farming (5)
  { q: "How do I make organic compost manure at home?",                  expected: "GENERAL_ADVICE" },
  { q: "What is the best way to save water using drip irrigation?",      expected: "GENERAL_ADVICE" },
  { q: "How often should I rotate my crops to keep soil healthy?",       expected: "GENERAL_ADVICE" },
  { q: "Tips for weeding vegetables without chemicals.",                  expected: "GENERAL_ADVICE" },
  { q: "How to build a compost pile using cow dung?",                    expected: "GENERAL_ADVICE" },

  // Out of Domain (2)
  { q: "Write a python function to sort an array of numbers.",           expected: "OUT_OF_DOMAIN" },
  { q: "Who directed the movie Inception?",                              expected: "OUT_OF_DOMAIN" }
];

const runDiagnosticsBtn = document.getElementById('run-diagnostics-btn');
const diagnosticsResults = document.getElementById('diagnostics-results');

if (runDiagnosticsBtn) {
  runDiagnosticsBtn.addEventListener('click', async () => {
    diagnosticsResults.style.display = 'block';
    diagnosticsResults.innerHTML = '<strong>Running Router Test Suite...</strong><br>';

    let passed = 0;
    const apiKey    = apiKeyInput.value.trim();
    const startTime = performance.now();

    const diagApiStatus   = document.getElementById('diag-api-status');
    const diagResponseTime = document.getElementById('diag-response-time');
    if (diagApiStatus) diagApiStatus.textContent = 'Testing...';

    for (let i = 0; i < testQueries.length; i++) {
      const item = testQueries[i];
      try {
        const res       = await processFarmerQuery(item.q, apiKey);
        const isCorrect = res.category === item.expected;
        if (isCorrect) passed++;

        const line = document.createElement('div');
        line.style.margin = '0.3rem 0';
        line.style.color  = isCorrect ? 'var(--emerald)' : 'var(--pest-red)';
        line.innerHTML    = `Q${i + 1}: "${item.q.substring(0, 22)}..." ➜ ${res.category} [${isCorrect ? '✅ PASS' : '❌ FAIL'}]`;
        diagnosticsResults.appendChild(line);
        diagnosticsResults.scrollTop = diagnosticsResults.scrollHeight;
      } catch (err) {
        const errorLine = document.createElement('div');
        errorLine.style.color = 'var(--pest-red)';
        errorLine.textContent = `Q${i + 1}: Failed. Error: ${err.message}`;
        diagnosticsResults.appendChild(errorLine);
      }
      await delay(80);
    }

    const duration    = Math.round(performance.now() - startTime);
    const avgResponse = Math.round(duration / testQueries.length);

    if (diagResponseTime) diagResponseTime.textContent = `${avgResponse} ms`;
    if (diagApiStatus) {
      diagApiStatus.innerHTML = apiKey
        ? '<span class="status-dot-green"></span> Live API'
        : 'Offline Mode';
    }

    const summary = document.createElement('div');
    summary.style.cssText = 'margin-top:0.5rem;font-weight:800;border-top:1px solid var(--border-glass);padding-top:0.5rem;color:var(--forest-green);';
    summary.innerHTML = `✅ Summary: Passed ${passed}/${testQueries.length} (${Math.round((passed / testQueries.length) * 100)}%)`;
    diagnosticsResults.appendChild(summary);
    diagnosticsResults.scrollTop = diagnosticsResults.scrollHeight;
  });
}
