import { App } from './components.js';

const config = window.PROMPT_CONFIG;
const { text: promptText, styles } = config;
const appRoot = document.querySelector('#app');
appRoot.innerHTML = App(styles);

const fields = ['keep', 'remove', 'change', 'background'];
const byId = id => document.querySelector(`#${id}`);
const value = id => byId(id).value.trim();
const checked = name => document.querySelector(`input[name="${name}"]:checked`).value;
const items = text => text.split(/\n+/).map(item => item.trim()).filter(Boolean);
const section = (title, lines) => `【${title}】\n${lines.map(line => `・${line}`).join('\n')}`;

const settingsPanel = byId('settings-panel');
const promptDialog = byId('prompt-dialog');
const mobileQuery = matchMedia('(max-width: 899px)');

function compositionRules() {
  const type = checked('composition');
  const rules = promptText.compositions;
  if (type === 'custom') {
    const custom = rules.custom;
    const background = value('background') ? items(value('background')) : [custom.defaultBackground];
    return section(promptText.headings.composition, [custom.before, ...background, custom.after]);
  }
  return section(promptText.headings.composition, rules[type]);
}

function updateSummary() {
  const labels = {
    whole: '写真全体を描く',
    simplify: '背景を簡略化',
    custom: value('background') || '白い背景'
  };
  const count = ['keep', 'remove', 'change'].filter(id => value(id)).length;
  byId('settings-summary').textContent = `${labels[checked('composition')]}・${count ? `追加指定 ${count}件` : '追加指定なし'}`;
  byId('series-composition-summary').textContent = labels[checked('composition')];
  byId('series-instruction-summary').textContent = count ? `${count}件` : 'なし';
  ['keep', 'remove', 'change'].forEach(id => {
    const summary = byId(`${id}-summary`);
    summary.textContent = value(id) || '未入力';
    summary.classList.toggle('has-value', Boolean(value(id)));
  });
}

function updateMode(openSettingsForContinue = false) {
  const continuing = checked('mode') === 'continue';
  document.querySelector('.style-picker').classList.toggle('is-continuing', continuing);
  document.querySelector('.style-grid').hidden = continuing;
  byId('series-workspace').hidden = !continuing;
  byId('style-title').textContent = continuing ? '今回の写真を調整' : '画風を選ぶ';
  byId('style-description').textContent = continuing ? 'シリーズ基準画像の画風を引き継ぎます' : '同じ静物で、画材による違いを比べます';
  byId('style-badge').textContent = continuing ? '継続' : '静物';
  document.querySelectorAll('input[name="style"]').forEach(input => { input.disabled = continuing; });
  if (continuing && openSettingsForContinue && mobileQuery.matches && !settingsPanel.open) settingsPanel.showModal();
}

function updateConditionalFields() {
  byId('background-row').hidden = checked('composition') !== 'custom';
}

function buildPrompt() {
  const selectedStyle = styles.find(style => style.id === checked('style'));
  const continuing = checked('mode') === 'continue';
  const headings = promptText.headings;
  const parts = [continuing ? promptText.intro.continue : promptText.intro.new];

  if (continuing) parts.push(section(headings.series, promptText.series));
  if (value('keep')) parts.push(section(headings.keep, items(value('keep'))));
  if (value('remove')) parts.push(section(headings.remove, items(value('remove'))));
  if (value('change')) parts.push(section(headings.change, items(value('change'))));

  parts.push(compositionRules());
  parts.push(section(headings.subject, promptText.subject));

  if (!continuing) {
    const colorRules = selectedStyle.id === 'ink-wash' ? promptText.colorRules.inkWash : promptText.colorRules.default;
    const labels = promptText.styleLabels;
    parts.push(section(headings.color, colorRules));
    parts.push(section(`${headings.stylePrefix}${selectedStyle.name}`, [
      `${labels.material}：${selectedStyle.material}`,
      `${labels.line}：${selectedStyle.line}`,
      `${labels.paint}：${selectedStyle.paint}`,
      `${labels.color}：${selectedStyle.color}`,
      `${labels.texture}：${selectedStyle.texture}`
    ]));
    parts.push(section(headings.avoid, [...selectedStyle.avoid, promptText.noAttribution]));
  }

  return parts.join('\n\n');
}

function renderPrompt() {
  const prompt = buildPrompt();
  byId('output').value = prompt;
  byId('count').textContent = `${prompt.length}字`;
  updateSummary();
}

function render() {
  updateMode();
  updateConditionalFields();
  renderPrompt();
}

function configureSettingsPanel() {
  if (settingsPanel.open) settingsPanel.close();
  if (!mobileQuery.matches) settingsPanel.show();
}

function openSettings() {
  if (mobileQuery.matches) {
    if (!settingsPanel.open) settingsPanel.showModal();
    return;
  }
  settingsPanel.querySelector('textarea')?.focus();
}

function closeSettings() {
  if (mobileQuery.matches && settingsPanel.open) {
    settingsPanel.close();
    byId('open-settings').focus();
  }
}

function closePrompt() {
  if (promptDialog.open) promptDialog.close();
  byId('show-prompt').focus();
}

function toggleAccordion(id) {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    const isTarget = trigger.dataset.accordion === id;
    const willOpen = isTarget && trigger.getAttribute('aria-expanded') !== 'true';
    trigger.setAttribute('aria-expanded', String(willOpen));
    byId(`${trigger.dataset.accordion}-panel`).hidden = !willOpen;
    if (willOpen) byId(trigger.dataset.accordion).focus();
  });
}

let copyTimer;
async function copyPrompt() {
  const output = byId('output');
  try {
    await navigator.clipboard.writeText(output.value);
  } catch (error) {
    output.focus();
    output.select();
    document.execCommand('copy');
    output.setSelectionRange(0, 0);
  }
  clearTimeout(copyTimer);
  document.querySelectorAll('.copy-button').forEach(button => button.classList.add('is-copied'));
  byId('status').textContent = 'プロンプトをコピーしました。';
  copyTimer = setTimeout(() => {
    document.querySelectorAll('.copy-button').forEach(button => button.classList.remove('is-copied'));
    byId('status').textContent = '';
  }, 1600);
}

document.querySelectorAll('input[name="style"]').forEach(input => input.addEventListener('change', renderPrompt));
document.querySelectorAll('input[name="mode"]').forEach(input => input.addEventListener('change', () => {
  updateMode(true);
  updateConditionalFields();
  renderPrompt();
}));
document.querySelectorAll('input[name="composition"]').forEach(input => input.addEventListener('change', () => {
  updateConditionalFields();
  renderPrompt();
}));
fields.forEach(id => byId(id).addEventListener('input', renderPrompt));
document.querySelectorAll('.accordion-trigger').forEach(trigger => trigger.addEventListener('click', () => toggleAccordion(trigger.dataset.accordion)));

byId('open-settings').addEventListener('click', openSettings);
byId('open-series-settings').addEventListener('click', openSettings);
byId('close-settings').addEventListener('click', closeSettings);
byId('close-settings-done').addEventListener('click', closeSettings);
settingsPanel.addEventListener('click', event => { if (mobileQuery.matches && event.target === settingsPanel) closeSettings(); });

byId('show-prompt').addEventListener('click', () => {
  promptDialog.showModal();
  byId('output').scrollTop = 0;
});
byId('close-prompt').addEventListener('click', closePrompt);
promptDialog.addEventListener('click', event => { if (event.target === promptDialog) closePrompt(); });
byId('copy').addEventListener('click', copyPrompt);
byId('copy-dialog').addEventListener('click', copyPrompt);

mobileQuery.addEventListener('change', configureSettingsPanel);
configureSettingsPanel();
render();

if ('serviceWorker' in navigator) {
  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) byId('update-notice').hidden = false;
  });
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
  byId('reload-app').addEventListener('click', () => location.reload());
}
