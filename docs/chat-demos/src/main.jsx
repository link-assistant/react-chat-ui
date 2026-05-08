import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createChatDemoStore,
  languageOptions,
  themeOptions,
} from '../../../src/index.js';
import './styles.css';

const store = createChatDemoStore();

function Avatar({ label, accent }) {
  return (
    <span className="avatar" style={{ '--avatar-accent': accent }}>
      {label}
    </span>
  );
}

function Metric({ label, value }) {
  return (
    <span className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </span>
  );
}

function DemoNavigation({ demos, selectedDemoId, onSelect }) {
  return (
    <nav className="demo-nav" aria-label="Chat demos">
      {demos.map((demo) => (
        <button
          key={demo.id}
          className="demo-tab"
          data-testid="demo-tab"
          aria-pressed={demo.id === selectedDemoId}
          onClick={() => onSelect(demo.id)}
          type="button"
        >
          <Avatar label={demo.avatar} accent={demo.accent} />
          <span>
            <strong>{demo.name}</strong>
            <small>{demo.packageName}</small>
          </span>
        </button>
      ))}
    </nav>
  );
}

function Toolbar({ languageId, setLanguageId, themeId, setThemeId, strings }) {
  return (
    <div className="toolbar" data-testid="demo-toolbar">
      <label>
        <span>{strings.theme}</span>
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
        <span>{strings.language}</span>
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
    </div>
  );
}

function MessageList({ snapshot }) {
  const participants = useMemo(
    () =>
      new Map(
        snapshot.participants.map((participant) => [
          participant.id,
          participant,
        ])
      ),
    [snapshot]
  );

  return (
    <section className="conversation" aria-label={snapshot.name}>
      <header className="conversation-header">
        <div>
          <p>{snapshot.packageName}</p>
          <h1>{snapshot.name}</h1>
        </div>
        <span className="status-pill">{snapshot.marketPosition}</span>
      </header>
      <div className="message-list" data-testid="message-list">
        {snapshot.messages.map((message) => {
          const author = participants.get(message.authorId);
          const isSystem = author?.role === 'System' || author?.role === 'Tool';

          return (
            <article
              className={isSystem ? 'message system-message' : 'message'}
              data-testid="chat-message"
              key={message.id}
            >
              <Avatar
                label={(author?.name ?? 'User')
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)}
                accent={snapshot.accent}
              />
              <div className="message-body">
                <div className="message-meta">
                  <strong>{author?.name ?? 'Unknown'}</strong>
                  <span>{author?.role ?? 'Participant'}</span>
                  <time>{message.sentAt}</time>
                </div>
                <p>{message.text}</p>
                <small>
                  #{message.storageId} / {message.codePointCount} code points
                </small>
              </div>
            </article>
          );
        })}
      </div>
      <form className="composer">
        <input
          aria-label={snapshot.language.strings.messagePlaceholder}
          placeholder={snapshot.language.strings.messagePlaceholder}
          readOnly
        />
        <button type="button">{snapshot.language.strings.tryDemo}</button>
      </form>
    </section>
  );
}

function DetailRail({ snapshot }) {
  const strings = snapshot.language.strings;

  return (
    <aside className="detail-rail">
      <img
        src="./chat-demo-preview.png"
        alt=""
        className="preview-image"
        loading="eager"
      />
      <div className="metric-row">
        <Metric label={strings.messages} value={snapshot.messages.length} />
        <Metric
          label={strings.activeUsers}
          value={snapshot.participants.length}
        />
        <Metric label={strings.storage} value={snapshot.storage.linkCount} />
      </div>
      <section>
        <h2>{strings.features}</h2>
        <div className="chip-list">
          {snapshot.featureHighlights.map((feature) => (
            <span className="chip" key={feature}>
              {feature}
            </span>
          ))}
        </div>
      </section>
      <section>
        <h2>{strings.configurable}</h2>
        <ul>
          {snapshot.configurableSurfaces.map((surface) => (
            <li key={surface}>{surface}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>{strings.designDefaults}</h2>
        <ul>
          {snapshot.designRecommendations.map((recommendation) => (
            <li key={recommendation}>{recommendation}</li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

function App() {
  const demos = store.listDemos();
  const [selectedDemoId, setSelectedDemoId] = useState(demos[0].id);
  const [languageId, setLanguageId] = useState(languageOptions[0].id);
  const [themeId, setThemeId] = useState(themeOptions[0].id);
  const snapshot = store.getDemoSnapshot({
    demoId: selectedDemoId,
    languageId,
    themeId,
  });

  return (
    <main
      className="app-shell"
      data-theme={themeId}
      style={{
        '--accent': snapshot.accent,
        '--demo-background': snapshot.background,
      }}
    >
      <section className="workspace" data-testid="chat-demo-app">
        <header className="workspace-header">
          <div>
            <p>React chat UI</p>
            <h1>Demo gallery</h1>
          </div>
          <Toolbar
            languageId={languageId}
            setLanguageId={setLanguageId}
            themeId={themeId}
            setThemeId={setThemeId}
            strings={snapshot.language.strings}
          />
        </header>
        <div className="workspace-grid">
          <DemoNavigation
            demos={demos}
            selectedDemoId={selectedDemoId}
            onSelect={setSelectedDemoId}
          />
          <MessageList snapshot={snapshot} />
          <DetailRail snapshot={snapshot} />
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
