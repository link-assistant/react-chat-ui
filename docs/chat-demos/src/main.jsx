import React, { Profiler, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ReactMarkdown from 'react-markdown';
import {
  ChatContainer,
  MainContainer,
  Message as ChatScopeMessage,
  MessageList as ChatScopeMessageList,
} from '@chatscope/chat-ui-kit-react';
import { MessageList as ReactChatElementsMessageList } from 'react-chat-elements';
import { DeepChat } from 'deep-chat-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import 'react-chat-elements/dist/main.css';
import {
  createChatDemoStore,
  languageOptions,
  themeOptions,
} from '../../../src/index.js';
import './styles.css';

const store = createChatDemoStore();
const localParticipant = {
  id: 'reviewer',
  name: 'You',
  role: 'Reviewer',
};

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

function stripMarkdown(value) {
  return value
    .replaceAll('**', '')
    .replaceAll('__', '')
    .replaceAll('`', '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1');
}

function createParticipantMap(participants) {
  return new Map(
    participants.map((participant) => [participant.id, participant])
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
            <em>{demo.integrationMode}</em>
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

function MarkdownMessage({ text }) {
  return (
    <div className="markdown-message">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}

function Transcript({ snapshot, messages, participants }) {
  const participantMap = useMemo(
    () => createParticipantMap(participants),
    [participants]
  );

  return (
    <div className="message-list" data-testid="message-list">
      {messages.map((message) => {
        const author = participantMap.get(message.authorId);
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
              <MarkdownMessage text={message.text} />
              <small>
                #{message.storageId} / {message.codePointCount} code points
              </small>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Composer({ placeholder, onSend }) {
  const [value, setValue] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      return;
    }

    onSend(trimmed);
    setValue('');
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <textarea
        aria-label={placeholder}
        data-testid="chat-composer-input"
        placeholder={placeholder}
        rows={2}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button data-testid="chat-composer-submit" type="submit">
        Send
      </button>
    </form>
  );
}

function ChatScopePreview({ messages, participants }) {
  const participantMap = useMemo(
    () => createParticipantMap(participants),
    [participants]
  );

  return (
    <div className="library-frame chatscope-frame">
      <MainContainer responsive>
        <ChatContainer>
          <ChatScopeMessageList>
            {messages.map((message) => {
              const author = participantMap.get(message.authorId);
              return (
                <ChatScopeMessage
                  key={message.id}
                  model={{
                    direction:
                      message.authorId === localParticipant.id
                        ? 'outgoing'
                        : 'incoming',
                    message: stripMarkdown(message.text),
                    position: 'single',
                    sender: author?.name ?? 'Participant',
                    sentTime: message.sentAt,
                  }}
                />
              );
            })}
          </ChatScopeMessageList>
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

function ReactChatElementsPreview({ messages, participants }) {
  const participantMap = useMemo(
    () => createParticipantMap(participants),
    [participants]
  );
  const dataSource = messages.map((message) => {
    const author = participantMap.get(message.authorId);

    return {
      id: message.id,
      position: message.authorId === localParticipant.id ? 'right' : 'left',
      type: 'text',
      title: author?.name ?? 'Participant',
      text: stripMarkdown(message.text),
      dateString: message.sentAt,
      status: message.status,
    };
  });

  return (
    <div className="library-frame rce-frame">
      <ReactChatElementsMessageList
        lockable
        toBottomHeight="100%"
        dataSource={dataSource}
      />
    </div>
  );
}

function DeepChatPreview({ messages }) {
  const history = messages.map((message) => ({
    role: message.authorId === localParticipant.id ? 'user' : 'ai',
    text: message.text,
  }));

  return (
    <div className="library-frame deep-chat-frame">
      <DeepChat
        history={history}
        textInput={{
          disabled: true,
          placeholder: { text: 'Use the shared composer below' },
        }}
        chatStyle={{ height: '360px', width: '100%' }}
      />
    </div>
  );
}

function ReferencePreview({ snapshot }) {
  return (
    <div className="reference-preview">
      <strong>{snapshot.integration.mode}</strong>
      <p>{snapshot.integration.status}</p>
      <code>{snapshot.integration.packageImport}</code>
    </div>
  );
}

function LibraryRenderer({ snapshot, messages, participants }) {
  switch (snapshot.integration.rendererId) {
    case 'chatscope':
      return (
        <ChatScopePreview messages={messages} participants={participants} />
      );
    case 'react-chat-elements':
      return (
        <ReactChatElementsPreview
          messages={messages}
          participants={participants}
        />
      );
    case 'deep-chat':
      return <DeepChatPreview messages={messages} />;
    default:
      return <ReferencePreview snapshot={snapshot} />;
  }
}

function LibraryPreview({ snapshot, messages, participants, onMetricsChange }) {
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
        <LibraryRenderer
          snapshot={snapshot}
          messages={messages}
          participants={participants}
        />
      </Profiler>
    </section>
  );
}

function MessageList({
  snapshot,
  messages,
  participants,
  onSend,
  onMetricsChange,
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
      <Transcript
        snapshot={snapshot}
        messages={messages}
        participants={participants}
      />
      <LibraryPreview
        snapshot={snapshot}
        messages={messages}
        participants={participants}
        onMetricsChange={onMetricsChange}
      />
      <Composer
        placeholder={snapshot.language.strings.messagePlaceholder}
        onSend={onSend}
      />
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

function App() {
  const demos = store.listDemos();
  const [selectedDemoId, setSelectedDemoId] = useState(demos[0].id);
  const [languageId, setLanguageId] = useState(languageOptions[0].id);
  const [themeId, setThemeId] = useState(themeOptions[0].id);
  const [composedMessages, setComposedMessages] = useState({});
  const [renderMetrics, setRenderMetrics] = useState({});
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

  function handleSend(text) {
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
      };

      return {
        ...current,
        [selectedDemoId]: [...existing, message],
      };
    });
  }

  function handleMetricsChange(demoId, metrics) {
    setRenderMetrics((current) => ({
      ...current,
      [demoId]: metrics,
    }));
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
      <section className="workspace" data-testid="chat-demo-app">
        <header className="workspace-header">
          <div>
            <p>React chat UI</p>
            <h1>Comparison lab</h1>
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
          <MessageList
            snapshot={snapshot}
            messages={messages}
            participants={participants}
            onSend={handleSend}
            onMetricsChange={handleMetricsChange}
          />
          <DetailRail
            snapshot={snapshot}
            messages={messages}
            participants={participants}
            renderMetrics={renderMetrics[selectedDemoId] ?? {}}
          />
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
