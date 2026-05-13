import React, { Profiler, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createChatDemoStore,
  getComparisonMatrix,
  languageOptions,
  themeOptions,
} from '../../../src/index.js';
import {
  Avatar,
  DemoSurface,
  localParticipant,
  stripMarkdown,
} from './demo-surfaces.jsx';
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

function Metric({ label, value }) {
  return (
    <span className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </span>
  );
}

function formatStars(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return String(value);
}

function getMemoryUsageLabel() {
  const memory = performance.memory;

  if (!memory?.usedJSHeapSize) {
    return 'n/a';
  }

  return `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB`;
}

function stripReplyPreview(value) {
  return stripMarkdown(value).slice(0, 72);
}

function DemoNavigation({ demos, selectedDemoId, onSelect }) {
  function renderDemoRow(demo, index) {
    return (
      <div
        key={demo.id}
        className={`demo-tab-row ${demo.isOwn ? 'is-own' : ''}`}
      >
        <button
          className="demo-tab"
          data-testid="demo-tab"
          data-demo-id={demo.id}
          aria-pressed={demo.id === selectedDemoId}
          onClick={() => onSelect(demo.id)}
          type="button"
        >
          <Avatar label={demo.avatar} accent={demo.accent} />
          <span>
            <strong>{demo.name}</strong>
            <small>{demo.packageName}</small>
            <em>{demo.integrationMode}</em>
            <b className="score-chip">
              #{index + 1} score {demo.score}
            </b>
          </span>
        </button>
        <a
          className="demo-open"
          data-testid="demo-open-link"
          href={`./profiles/${demo.id}.html`}
          title="Open isolated micro-frontend"
        >
          Open
        </a>
      </div>
    );
  }

  return (
    <nav className="demo-nav" aria-label="Chat demos">
      <p className="demo-nav-label">Ranked profiles</p>
      {demos.map((demo, index) => renderDemoRow(demo, index))}
    </nav>
  );
}

function Toolbar({
  languageId,
  setLanguageId,
  themeId,
  setThemeId,
  strings,
  toggles,
  setToggles,
  composerKind,
  setComposerKind,
  view,
  setView,
}) {
  return (
    <div className="toolbar" data-testid="demo-toolbar">
      <div className="toolbar-tabs" role="tablist">
        <button
          type="button"
          data-testid="view-tab-demo"
          role="tab"
          aria-selected={view === 'demo'}
          onClick={() => setView('demo')}
        >
          Demo
        </button>
        <button
          type="button"
          data-testid="view-tab-compare"
          role="tab"
          aria-selected={view === 'compare'}
          onClick={() => setView('compare')}
        >
          Compare
        </button>
      </div>
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
      <div className="toggle-group" role="group" aria-label="Chrome toggles">
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
  );
}

function Composer({
  canCompose,
  composerKind,
  disabledReason,
  onClearReply,
  onSend,
  placeholder,
  selectedReplyAuthorName,
  selectedReplyTarget,
}) {
  const [value, setValue] = useState('');
  const editableRef = useRef(null);

  if (!canCompose) {
    return (
      <div
        className="composer composer-unavailable"
        data-testid="composer-unavailable"
      >
        <strong>Local demo unavailable</strong>
        <span>{disabledReason}</span>
      </div>
    );
  }

  function submit(rawText) {
    const trimmed = rawText.trim();

    if (!trimmed) {
      return;
    }

    onSend(trimmed);
    setValue('');

    if (editableRef.current) {
      editableRef.current.textContent = '';
    }
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
      {selectedReplyTarget && (
        <div
          className="selected-reply-target"
          data-testid="selected-reply-target"
        >
          <span>
            Replying to {selectedReplyAuthorName}:{' '}
            {stripReplyPreview(selectedReplyTarget.text)}
          </span>
          <button type="button" onClick={onClearReply}>
            Clear
          </button>
        </div>
      )}
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

function LibraryPreview({
  messages,
  onMetricsChange,
  onSelectReply,
  participants,
  selectedReplyId,
  snapshot,
  toggles,
}) {
  const frameRef = useRef(null);

  function handleRender(id, phase, actualDuration) {
    requestAnimationFrame(() => {
      onMetricsChange(snapshot.id, {
        domNodes: frameRef.current?.querySelectorAll('*').length ?? 0,
        heap: getMemoryUsageLabel(),
        phase,
        renderMs: actualDuration.toFixed(1),
      });
    });
  }

  return (
    <section className="library-preview" ref={frameRef}>
      <header>
        <div>
          <p>{snapshot.integration.mode}</p>
          <h2>Real integration preview</h2>
        </div>
        <span>{snapshot.integration.rendererId}</span>
      </header>
      <Profiler id={snapshot.integration.rendererId} onRender={handleRender}>
        <DemoSurface
          snapshot={snapshot}
          messages={messages}
          onSelectReply={onSelectReply}
          participants={participants}
          selectedReplyId={selectedReplyId}
          toggles={toggles}
        />
      </Profiler>
    </section>
  );
}

function MessageList({
  canCompose,
  composerKind,
  disabledReason,
  messages,
  onClearReply,
  onMetricsChange,
  onSelectReply,
  onSend,
  participants,
  selectedReplyAuthorName,
  selectedReplyId,
  selectedReplyTarget,
  snapshot,
  toggles,
}) {
  return (
    <section className="conversation" aria-label={snapshot.name}>
      <header className="conversation-header">
        <div>
          <p>{snapshot.packageName}</p>
          <h1>{snapshot.name}</h1>
        </div>
        <span className="status-pill">{snapshot.marketPosition}</span>
      </header>
      <LibraryPreview
        snapshot={snapshot}
        messages={messages}
        onSelectReply={onSelectReply}
        participants={participants}
        selectedReplyId={selectedReplyId}
        toggles={toggles}
        onMetricsChange={onMetricsChange}
      />
      <Composer
        canCompose={canCompose}
        composerKind={composerKind}
        disabledReason={disabledReason}
        selectedReplyAuthorName={selectedReplyAuthorName}
        selectedReplyTarget={selectedReplyTarget}
        onClearReply={onClearReply}
        placeholder={snapshot.language.strings.messagePlaceholder}
        onSend={onSend}
      />
    </section>
  );
}

const COMPARE_FEATURE_COLUMNS = [
  { id: 'avatar', label: 'Avatar' },
  { id: 'senderName', label: 'Sender name' },
  { id: 'timestamp', label: 'Timestamp' },
  { id: 'reply', label: 'Replies' },
  { id: 'markdownMessages', label: 'Markdown msg' },
  { id: 'markdownComposer', label: 'Markdown composer' },
  { id: 'threads', label: 'Threads' },
  { id: 'typing', label: 'Typing' },
  { id: 'reactions', label: 'Reactions' },
  { id: 'fileAttachments', label: 'File attach' },
  { id: 'aiStreaming', label: 'AI streaming' },
  { id: 'moderation', label: 'Moderation' },
];

const TIER_LABEL = {
  A: { chip: '🟢 A', title: 'Live local package with working composer' },
  B: { chip: '🟡 B', title: 'Verified npm package source, not installed' },
  C: { chip: '🟠 C', title: 'Primitive or hook source, not a full chat UI' },
  D: { chip: '🔴 D', title: 'Credential-gated or unavailable locally' },
};

function FeatureBadge({ supported, label }) {
  if (supported === true) {
    return (
      <span
        className="feature-badge is-yes"
        role="img"
        aria-label={`${label}: supported`}
        title={`${label}: supported`}
      >
        ✅
      </span>
    );
  }
  if (supported === 'partial' || supported === 'maybe') {
    return (
      <span
        className="feature-badge is-partial"
        role="img"
        aria-label={`${label}: partial`}
        title={`${label}: partial`}
      >
        ⚠️
      </span>
    );
  }
  return (
    <span
      className="feature-badge is-no"
      role="img"
      aria-label={`${label}: not supported`}
      title={`${label}: not supported`}
    >
      ❌
    </span>
  );
}

function CompareView({ rows }) {
  return (
    <section className="compare-view" data-testid="compare-view">
      <header className="compare-header">
        <h2>Feature, limitation, and lock-in matrix</h2>
        <p>
          {rows.length} profiles ranked by computed score. Higher means richer
          features, better maintenance, and more configurable surfaces. The tier
          chip reflects how much of the library actually renders in this
          gallery: <span className="tier-chip tier-a">{TIER_LABEL.A.chip}</span>{' '}
          live local package,{' '}
          <span className="tier-chip tier-b">{TIER_LABEL.B.chip}</span> verified
          npm package source,{' '}
          <span className="tier-chip tier-c">{TIER_LABEL.C.chip}</span>{' '}
          primitive or hook source,{' '}
          <span className="tier-chip tier-d">{TIER_LABEL.D.chip}</span>{' '}
          credential-gated or unavailable locally.
        </p>
      </header>
      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Tier</th>
              <th>Score</th>
              <th>License</th>
              <th>Stars</th>
              <th>Released</th>
              {COMPARE_FEATURE_COLUMNS.map((column) => (
                <th key={column.id}>{column.label}</th>
              ))}
              <th>Limitations</th>
              <th>Lock-ins</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const tier = row.liveTier ?? 'D';
              const tierMeta = TIER_LABEL[tier] ?? TIER_LABEL.D;
              return (
                <tr key={row.id} data-testid="compare-row" data-tier={tier}>
                  <th scope="row">
                    <strong>{row.name}</strong>
                    <small>{row.packageName}</small>
                    <em>{row.integrationMode}</em>
                  </th>
                  <td>
                    <span
                      className={`tier-chip tier-${tier.toLowerCase()}`}
                      title={tierMeta.title}
                    >
                      {tierMeta.chip}
                    </span>
                  </td>
                  <td>
                    <strong>{row.score.total.toFixed(1)}</strong>
                  </td>
                  <td>{row.license}</td>
                  <td>{formatStars(row.stars)}</td>
                  <td>{row.lastReleaseAt}</td>
                  {COMPARE_FEATURE_COLUMNS.map((column) => (
                    <td
                      key={column.id}
                      aria-label={column.label}
                      data-feature-state={
                        row.featureMatrix[column.id] ? 'yes' : 'no'
                      }
                    >
                      <FeatureBadge
                        supported={row.featureMatrix[column.id]}
                        label={column.label}
                      />
                    </td>
                  ))}
                  <td>
                    <ul>
                      {row.limitations.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <ul>
                      {row.lockIns.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MetadataList({ snapshot }) {
  return (
    <dl className="metadata-list">
      <div>
        <dt>Version</dt>
        <dd>{snapshot.maintenance.latestVersion}</dd>
      </div>
      <div>
        <dt>License</dt>
        <dd>{snapshot.maintenance.license}</dd>
      </div>
      <div>
        <dt>Stars</dt>
        <dd>{formatStars(snapshot.maintenance.stars)}</dd>
      </div>
      <div>
        <dt>Release</dt>
        <dd>{snapshot.maintenance.lastReleaseAt}</dd>
      </div>
    </dl>
  );
}

function DetailRail({ snapshot, messages, participants, renderMetrics }) {
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
        <Metric label={strings.messages} value={messages.length} />
        <Metric label={strings.activeUsers} value={participants.length} />
        <Metric label={strings.storage} value={snapshot.storage.linkCount} />
        <Metric label="Render ms" value={renderMetrics.renderMs ?? 'n/a'} />
        <Metric label="Heap" value={renderMetrics.heap ?? 'n/a'} />
        <Metric label="DOM nodes" value={renderMetrics.domNodes ?? 'n/a'} />
      </div>
      <section>
        <h2>Maintenance</h2>
        <MetadataList snapshot={snapshot} />
        <a href={snapshot.maintenance.githubUrl}>GitHub repository</a>
      </section>
      <section>
        <h2>Source code</h2>
        <p className="integration-status">{snapshot.integration.status}</p>
        <div className="code-cost">
          <span>{snapshot.integration.codeLineCount} lines</span>
          <span>{snapshot.integration.codeSymbolCount} symbols</span>
        </div>
        <pre className="source-view" data-testid="source-code">
          <code>{snapshot.integration.sourceCode}</code>
        </pre>
      </section>
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

function getInitialToggles() {
  return FEATURE_TOGGLES.reduce(
    (current, toggle) => ({ ...current, [toggle.id]: toggle.defaultValue }),
    {}
  );
}

function App() {
  const demos = store.listDemos();
  const [selectedDemoId, setSelectedDemoId] = useState(demos[0].id);
  const [languageId, setLanguageId] = useState(languageOptions[0].id);
  const [themeId, setThemeId] = useState(themeOptions[0].id);
  const [composedMessages, setComposedMessages] = useState({});
  const [renderMetrics, setRenderMetrics] = useState({});
  const [selectedReplyByDemoId, setSelectedReplyByDemoId] = useState({});
  const [toggles, setToggles] = useState(getInitialToggles);
  const [composerKind, setComposerKind] = useState(COMPOSER_KINDS[0].id);
  const [view, setView] = useState('demo');
  const snapshot = store.getDemoSnapshot({
    demoId: selectedDemoId,
    languageId,
    themeId,
  });
  const participants = useMemo(
    () => [...snapshot.participants, localParticipant],
    [snapshot.participants]
  );
  const messages = useMemo(
    () => [...snapshot.messages, ...(composedMessages[selectedDemoId] ?? [])],
    [composedMessages, selectedDemoId, snapshot.messages]
  );
  const compareRows = useMemo(() => getComparisonMatrix(), []);
  const canCompose = Boolean(snapshot.integration.capability?.interactive);
  const selectedReplyId = selectedReplyByDemoId[selectedDemoId] ?? null;
  const selectedReplyTarget = useMemo(
    () => messages.find((message) => message.id === selectedReplyId) ?? null,
    [messages, selectedReplyId]
  );
  const participantMap = useMemo(
    () =>
      new Map(participants.map((participant) => [participant.id, participant])),
    [participants]
  );
  const selectedReplyAuthorName = selectedReplyTarget
    ? (participantMap.get(selectedReplyTarget.authorId)?.name ?? 'Participant')
    : null;

  function handleSend(text) {
    if (!canCompose) {
      return;
    }

    debugLog('send', { demoId: selectedDemoId, length: text.length });
    setComposedMessages((current) => {
      const existing = current[selectedDemoId] ?? [];
      const nextIndex = existing.length + 1;
      const message = {
        id: `${selectedDemoId}-reply-${nextIndex}`,
        authorId: localParticipant.id,
        sentAt: 'now',
        status: 'sent',
        text,
        storageId: `local-${nextIndex}`,
        codePointCount: Array.from(text).length,
        replyToId: selectedReplyId,
      };

      return {
        ...current,
        [selectedDemoId]: [...existing, message],
      };
    });
    setSelectedReplyByDemoId((current) => ({
      ...current,
      [selectedDemoId]: null,
    }));
  }

  function handleSelectReply(messageId) {
    setSelectedReplyByDemoId((current) => ({
      ...current,
      [selectedDemoId]: messageId,
    }));
  }

  function handleClearReply() {
    setSelectedReplyByDemoId((current) => ({
      ...current,
      [selectedDemoId]: null,
    }));
  }

  function handleMetricsChange(demoId, metrics) {
    debugLog('metrics', { demoId, ...metrics });
    setRenderMetrics((current) => ({
      ...current,
      [demoId]: metrics,
    }));
  }

  return (
    <main
      className="app-shell"
      data-theme={themeId}
      data-view={view}
      style={{
        '--accent': snapshot.accent,
        '--demo-background': snapshot.background,
      }}
    >
      <section
        className="workspace"
        data-testid="chat-demo-app"
        data-demo-id={selectedDemoId}
      >
        <header className="workspace-header">
          <div>
            <p>React chat UI</p>
            <h1>
              Comparison lab
              {debugEnabled ? (
                <span className="debug-chip" data-testid="debug-chip">
                  debug
                </span>
              ) : null}
            </h1>
          </div>
          <Toolbar
            composerKind={composerKind}
            languageId={languageId}
            setComposerKind={setComposerKind}
            setLanguageId={setLanguageId}
            setThemeId={setThemeId}
            setToggles={setToggles}
            setView={setView}
            strings={snapshot.language.strings}
            themeId={themeId}
            toggles={toggles}
            view={view}
          />
        </header>
        {view === 'demo' ? (
          <div className="workspace-grid">
            <DemoNavigation
              demos={demos}
              selectedDemoId={selectedDemoId}
              onSelect={setSelectedDemoId}
            />
            <MessageList
              canCompose={canCompose}
              composerKind={composerKind}
              disabledReason={snapshot.integration.capability?.reason}
              messages={messages}
              selectedReplyAuthorName={selectedReplyAuthorName}
              selectedReplyId={selectedReplyId}
              selectedReplyTarget={selectedReplyTarget}
              participants={participants}
              snapshot={snapshot}
              toggles={toggles}
              onClearReply={handleClearReply}
              onMetricsChange={handleMetricsChange}
              onSelectReply={handleSelectReply}
              onSend={handleSend}
            />
            <DetailRail
              messages={messages}
              participants={participants}
              renderMetrics={renderMetrics[selectedDemoId] ?? {}}
              snapshot={snapshot}
            />
          </div>
        ) : (
          <CompareView rows={compareRows} />
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
