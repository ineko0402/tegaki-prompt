const styleImages = {
  'colored-pencil': './images/styles/colored-pencil.webp',
  crayon: './images/styles/crayon.webp',
  watercolor: './images/styles/watercolor.webp',
  'ink-wash': './images/styles/ink-wash.webp',
  'felt-tip': './images/styles/colored-ballpoint.webp',
  marker: './images/styles/marker.webp'
};

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

export function icon(name) {
  const paths = {
    brush: '<path d="m4 20 4.5-1 10-10-3.5-3.5-10 10L4 20Z"/><path d="m13.5 7 3.5 3.5"/>',
    sliders: '<path d="M4 7h10M18 7h2M14 4v6M4 17h2M10 17h10M7 14v6"/>',
    document: '<path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 11h6M9 15h6"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 20"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
}

function Brand() {
  return `<div class="brand"><span class="brand__mark">${icon('brush')}</span><span class="brand__name">手描きプロンプト</span></div>`;
}

function ModeSwitch() {
  return `<fieldset class="mode-switch">
    <legend>作成方法</legend>
    <label class="mode-switch__option"><input type="radio" name="mode" value="new" checked><span>新しく作る</span></label>
    <label class="mode-switch__option"><input type="radio" name="mode" value="continue"><span>同じ雰囲気で続ける</span></label>
  </fieldset>`;
}

function AppHeader() {
  return `<header class="app-header"><div class="app-header__inner">${Brand()}${ModeSwitch()}</div></header>`;
}

function PanelHeader({ title, description, badge }) {
  return `<div class="panel-header"><div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>${badge ? `<span class="badge">${escapeHtml(badge)}</span>` : ''}</div>`;
}

function StyleCard(style) {
  const image = styleImages[style.id];
  return `<label class="style-card">
    <input type="radio" name="style" value="${escapeHtml(style.id)}" ${style.id === 'colored-pencil' ? 'checked' : ''}>
    <span class="style-card__surface">
      <span class="style-card__image"><img src="${image}" alt="${escapeHtml(style.name)}の見本" width="384" height="384"><span class="style-card__check">${icon('check')}</span></span>
      <span class="style-card__body"><strong>${escapeHtml(style.name)}</strong><small>${escapeHtml(style.desc)}</small></span>
    </span>
  </label>`;
}

function StyleGrid(styles) {
  return `<fieldset class="style-grid"><legend>画風</legend>${styles.map(StyleCard).join('')}</fieldset>`;
}

function StylePicker(styles) {
  return `<section class="panel style-picker" aria-labelledby="style-title">
    ${PanelHeader({ title: '画風を選ぶ', description: '同じ静物で、画材による違いを比べます', badge: '静物' })}
    <div class="series-message" id="series-message" hidden><strong>画風はシリーズ基準画像から引き継ぎます</strong><span>今回の写真に必要な変更だけを指定してください。</span></div>
    ${StyleGrid(styles)}
  </section>`;
}

function InstructionField({ id, label, help, placeholder }) {
  return `<label class="field" for="${id}"><span class="field__label">${label}</span><span class="field__help">${help}</span><textarea id="${id}" placeholder="${placeholder}"></textarea></label>`;
}

function CompositionOption({ value, name, description, checked = false }) {
  return `<label class="choice-card"><input type="radio" name="composition" value="${value}" ${checked ? 'checked' : ''}><span class="choice-card__surface"><span class="choice-card__dot"></span><span><strong>${name}</strong><small>${description}</small></span></span></label>`;
}

function PhotoSettings() {
  return `<dialog class="settings-panel" id="settings-panel" aria-labelledby="settings-title">
    <div class="settings-panel__header"><div><span class="eyebrow">写真ごとの設定</span><h2 id="settings-title">写真に合わせて調整</h2></div><button class="icon-button settings-panel__close" id="close-settings" type="button" aria-label="調整画面を閉じる">${icon('close')}</button></div>
    <div class="settings-panel__content">
      <section class="settings-group" aria-labelledby="instruction-title"><h3 id="instruction-title">被写体への指示</h3>
        ${InstructionField({ id: 'keep', label: '必ず残すもの', help: '形・個数・模様など', placeholder: '例：取っ手、蓋の花柄' })}
        ${InstructionField({ id: 'remove', label: '取り除くもの', help: 'ラベル・値札・不要な小物など', placeholder: '例：青いラベル' })}
        ${InstructionField({ id: 'change', label: '今回だけの変更', help: '色・位置・大きさなど', placeholder: '例：花の色を青にする' })}
      </section>
      <section class="settings-group" aria-labelledby="composition-title"><h3 id="composition-title">構図・背景</h3><fieldset class="choice-list"><legend>構図・背景の扱い</legend>
        ${CompositionOption({ value: 'whole', name: '写真全体を描く', description: '風景・建物・室内向け', checked: true })}
        ${CompositionOption({ value: 'simplify', name: '背景を簡略化', description: '主役を残して背景を整理' })}
        ${CompositionOption({ value: 'custom', name: '背景を指定', description: '白背景などへ変更' })}
      </fieldset></section>
      <div id="background-row" hidden>${InstructionField({ id: 'background', label: '指定する背景', help: '未入力の場合は白背景', placeholder: '例：白い背景' })}</div>
    </div>
    <div class="settings-panel__footer"><button class="button button--quiet" id="reset" type="button">入力を戻す</button><button class="button button--primary settings-panel__done" id="close-settings-done" type="button">完了</button></div>
  </dialog>`;
}

function AppMain(styles) {
  return `<main class="workspace">${StylePicker(styles)}${PhotoSettings()}</main>`;
}

function ActionDock() {
  return `<section class="action-dock" aria-label="プロンプト操作"><div class="action-dock__inner">
    <button class="settings-summary" id="open-settings" type="button"><span class="settings-summary__icon">${icon('sliders')}</span><span class="settings-summary__text"><strong>写真に合わせて調整</strong><small id="settings-summary">写真全体を描く・追加指定なし</small></span><span class="settings-summary__arrow">${icon('chevron')}</span></button>
    <div class="action-dock__actions"><button class="button button--secondary" id="show-prompt" type="button">${icon('document')}<span>プロンプト表示</span></button><button class="button button--primary copy-button" id="copy" type="button">${icon('copy')}<span class="copy-ready">コピー</span><span class="copy-done">コピー済み</span></button></div>
  </div></section>`;
}

function AppFooter() {
  return `<footer class="app-footer">API不使用・入力内容は外部へ送信されません</footer>`;
}

function PromptDialog() {
  return `<dialog class="prompt-dialog" id="prompt-dialog"><div class="prompt-dialog__header"><div><span class="eyebrow">生成結果</span><h2>作成されたプロンプト</h2></div><span class="prompt-count" id="count">0字</span><button class="icon-button" id="close-prompt" type="button" aria-label="プロンプトを閉じる">${icon('close')}</button></div><textarea id="output" readonly aria-label="作成されたプロンプト"></textarea><div class="prompt-dialog__footer"><button class="button button--primary copy-button" id="copy-dialog" type="button">${icon('copy')}<span class="copy-ready">コピー</span><span class="copy-done">コピー済み</span></button></div></dialog>`;
}

function UpdateNotice() {
  return `<aside class="update-notice" id="update-notice" role="status" hidden><p>新しい版を利用できます。</p><button class="button button--primary" type="button" id="reload-app">再読み込み</button></aside>`;
}

export function App(styles) {
  return `<div class="app-shell">${AppHeader()}${AppMain(styles)}${ActionDock()}${AppFooter()}</div>${PromptDialog()}<p class="sr-only" id="status" role="status" aria-live="polite"></p>${UpdateNotice()}`;
}

export const componentTree = Object.freeze({
  App: ['AppHeader', 'AppMain', 'ActionDock', 'AppFooter', 'PromptDialog', 'UpdateNotice'],
  AppHeader: ['Brand', 'ModeSwitch'],
  AppMain: ['StylePicker', 'PhotoSettings'],
  StylePicker: ['PanelHeader', 'StyleGrid'],
  StyleGrid: ['StyleCard'],
  PhotoSettings: ['InstructionField', 'CompositionOption']
});
