import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createChatDemoStore,
  languageOptions,
  themeOptions,
} from '../../../src/index.js';
import { DemoSurface, localParticipant } from './demo-surfaces.jsx';
import { debugEnabled, debugLog } from './debug.js';
import './styles.css';

const FEATURE_TOGGLES = [
  { id: 'showAvatar', label: 'Avatars', defaultValue: true },
  { id: 'showSenderName', label: 'Sender name', defaultValue: true },
  { id: 'showTimestamp', label: 'Timestamps', defaultValue: true },
  { id: 'showReplies', label: 'Replies', defaultValue: true },
];

const COMPOSER_KINDS = [
  { id: 'textarea', label: 'Textarea (markdown)' },
  { id: 'contenteditable', label: 'ContentEditable' },
  { id: 'input', label: 'Single-line input' },
];

const store = createChatDemoStore();

function getInitialToggles() {
  return FEATURE_TOGGLES.reduce(
    (current, toggle) => ({ ...current, [toggle.id]: toggle.defaultValue }),
    {}
  );
}

function Composer({ placeholder, onSend, composerKind }) {
  const [value, setValue] = useState('');
  const editableRef = useRef(null);

  function submit(rawText) {
    const trimmed = rawText.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
    if (editableRef.current) editableRef.current.textContent = '';
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (composerKind === 'contenteditable') {
      submit(editableRef.current?.textContent ?? '');
      return;
    }
    submit(value);
  }

  return (
    <form
      className={`composer composer-${composerKind}`}
      data-testid="chat-composer"
      data-composer-kind={composerKind}
      onSubmit={handleSubmit}
    >
      {composerKind === 'textarea' && (
        <textarea
          aria-label={placeholder}
          data-testid="chat-composer-input"
          placeholder={placeholder}
          rows={2}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      )}
      {composerKind === 'input' && (
        <input
          type="text"
          aria-label={placeholder}
          data-testid="chat-composer-input"
          placeholder={placeholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      )}
      {composerKind === 'contenteditable' && (
        <div
          aria-label={placeholder}
          className="composer-contenteditable"
          contentEditable
          data-placeholder={placeholder}
          data-testid="chat-composer-input"
          ref={editableRef}
          role="textbox"
          suppressContentEditableWarning
          onInput={(event) => setValue(event.currentTarget.textContent ?? '')}
        />
      )}
      <button data-testid="chat-composer-submit" type="submit">
        Send
      </button>
    </form>
  );
}

function ProfilePage({ demoId }) {
  const [languageId, setLanguageId] = useState(languageOptions[0].id);
  const [themeId, setThemeId] = useState(themeOptions[0].id);
  const [toggles, setToggles] = useState(getInitialToggles);
  const [composerKind, setComposerKind] = useState(COMPOSER_KINDS[0].id);
  const [composed, setComposed] = useState([]);
  const snapshot = store.getDemoSnapshot({ demoId, languageId, themeId });
  const participants = useMemo(
    () => [...snapshot.participants, localParticipant],
    [snapshot.participants]
  );
  const messages = useMemo(
    () => [...snapshot.messages, ...composed],
    [composed, snapshot.messages]
  );

  function handleSend(text) {
    debugLog('send', { demoId, length: text.length });
    setComposed((current) => [
      ...current,
      {
        id: `${demoId}-reply-${current.length + 1}`,
        authorId: localParticipant.id,
        sentAt: 'now',
        status: 'sent',
        text,
        storageId: `local-${current.length + 1}`,
        codePointCount: Array.from(text).length,
        replyToId: snapshot.messages.at(-1)?.id ?? null,
      },
    ]);
  }

  return (
    <main
      className="app-shell"
      data-theme={themeId}
      style={{
        '--accent': snapshot.accent,
        '--demo-background': snapshot.background,
      }}
    >
      <section
        className="workspace profile-workspace"
        data-testid="chat-demo-app"
        data-demo-id={demoId}
      >
        <header className="workspace-header">
          <div>
            <p>{snapshot.packageName}</p>
            <h1>
              {snapshot.name}
              {debugEnabled ? (
                <span className="debug-chip" data-testid="debug-chip">
                  debug
                </span>
              ) : null}
            </h1>
          </div>
          <div className="toolbar" data-testid="demo-toolbar">
            <a className="back-link" href="../index.html">
              All demos
            </a>
            <label>
              <span>{snapshot.language.strings.theme}</span>
              <select
                data-testid="theme-switcher"
                value={themeId}
                onChange={(event) => setThemeId(event.target.value)}
              >
                {themeOptions.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{snapshot.language.strings.language}</span>
              <select
                data-testid="language-switcher"
                value={languageId}
                onChange={(event) => setLanguageId(event.target.value)}
              >
                {languageOptions.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Composer</span>
              <select
                data-testid="composer-kind"
                value={composerKind}
                onChange={(event) => setComposerKind(event.target.value)}
              >
                {COMPOSER_KINDS.map((kind) => (
                  <option key={kind.id} value={kind.id}>
                    {kind.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="toggle-group" role="group">
              {FEATURE_TOGGLES.map((toggle) => (
                <label key={toggle.id} className="toggle">
                  <input
                    type="checkbox"
                    data-testid={`toggle-${toggle.id}`}
                    checked={Boolean(toggles[toggle.id])}
                    onChange={(event) =>
                      setToggles((current) => ({
                        ...current,
                        [toggle.id]: event.target.checked,
                      }))
                    }
                  />
                  <span>{toggle.label}</span>
                </label>
              ))}
            </div>
          </div>
        </header>
        <div className="profile-body">
          <section className="library-preview">
            <header>
              <div>
                <p>{snapshot.integration.mode}</p>
                <h2>Real integration preview</h2>
              </div>
              <span>{snapshot.integration.rendererId}</span>
            </header>
            <DemoSurface
              snapshot={snapshot}
              messages={messages}
              participants={participants}
              toggles={toggles}
            />
          </section>
          <Composer
            composerKind={composerKind}
            placeholder={snapshot.language.strings.messagePlaceholder}
            onSend={handleSend}
          />
        </div>
      </section>
    </main>
  );
}

export function mountProfilePage(demoId) {
  createRoot(document.getElementById('root')).render(
    <ProfilePage demoId={demoId} />
  );
}
