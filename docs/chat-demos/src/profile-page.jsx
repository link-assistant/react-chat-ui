import React, { useMemo, useRef, useState } from 'react';
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
const localParticipant = { id: 'reviewer', name: 'You', role: 'Reviewer' };

function getInitialToggles() {
  return FEATURE_TOGGLES.reduce(
    (current, toggle) => ({ ...current, [toggle.id]: toggle.defaultValue }),
    {}
  );
}

function stripMarkdown(value) {
  return value
    .replaceAll('**', '')
    .replaceAll('__', '')
    .replaceAll('`', '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1');
}

function createParticipantMap(participants) {
  return new Map(participants.map((p) => [p.id, p]));
}

function Avatar({ label, accent }) {
  return (
    <span className="avatar" style={{ '--avatar-accent': accent }}>
      {label}
    </span>
  );
}

function MarkdownMessage({ text }) {
  return (
    <div className="markdown-message">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}

function Transcript({ snapshot, messages, participants, toggles }) {
  const participantMap = useMemo(
    () => createParticipantMap(participants),
    [participants]
  );
  const messageMap = useMemo(
    () => new Map(messages.map((m) => [m.id, m])),
    [messages]
  );

  return (
    <div className="message-list" data-testid="message-list">
      {messages.map((message) => {
        const author = participantMap.get(message.authorId);
        const replyTarget =
          toggles.showReplies && message.replyToId
            ? messageMap.get(message.replyToId)
            : null;
        const replyAuthor = replyTarget
          ? participantMap.get(replyTarget.authorId)
          : null;

        return (
          <article
            className="message"
            data-testid="chat-message"
            key={message.id}
          >
            {toggles.showAvatar ? (
              <Avatar
                label={(author?.name ?? 'User')
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)}
                accent={snapshot.accent}
              />
            ) : (
              <span aria-hidden="true" />
            )}
            <div className="message-body">
              {(toggles.showSenderName || toggles.showTimestamp) && (
                <div className="message-meta">
                  {toggles.showSenderName && (
                    <strong data-testid="chat-message-author">
                      {author?.name ?? 'Unknown'}
                    </strong>
                  )}
                  {toggles.showTimestamp && (
                    <time data-testid="chat-message-time">
                      {message.sentAt}
                    </time>
                  )}
                </div>
              )}
              {replyTarget && (
                <blockquote
                  className="reply-quote"
                  data-testid="chat-message-reply"
                >
                  <strong>{replyAuthor?.name ?? 'Participant'}</strong>
                  <span>{stripMarkdown(replyTarget.text).slice(0, 80)}</span>
                </blockquote>
              )}
              <MarkdownMessage text={message.text} />
            </div>
          </article>
        );
      })}
    </div>
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

function OwnChatPreview({ snapshot, messages, participants, toggles }) {
  const participantMap = useMemo(
    () => createParticipantMap(participants),
    [participants]
  );

  return (
    <div className="library-frame own-chat-frame" data-testid="own-chat-frame">
      <ul className="own-chat-list">
        {messages.map((message) => {
          const author = participantMap.get(message.authorId);
          const isLocal = message.authorId === localParticipant.id;
          return (
            <li
              key={message.id}
              className={`own-chat-message ${isLocal ? 'is-local' : ''}`}
              data-testid="own-chat-message"
            >
              {toggles.showAvatar && (
                <span
                  className="own-chat-avatar"
                  style={{ background: snapshot.accent }}
                >
                  {(author?.name ?? '?').slice(0, 2)}
                </span>
              )}
              <div className="own-chat-body">
                {toggles.showSenderName && (
                  <strong>{author?.name ?? 'Participant'}</strong>
                )}
                <ReactMarkdown>{message.text}</ReactMarkdown>
                {toggles.showTimestamp && (
                  <time className="own-chat-time">{message.sentAt}</time>
                )}
              </div>
            </li>
          );
        })}
      </ul>
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

function LibraryRenderer({ snapshot, messages, participants, toggles }) {
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
    case 'own-chat':
      return (
        <OwnChatPreview
          snapshot={snapshot}
          messages={messages}
          participants={participants}
          toggles={toggles}
        />
      );
    default:
      return <ReferencePreview snapshot={snapshot} />;
  }
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
            <h1>{snapshot.name}</h1>
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
          <Transcript
            snapshot={snapshot}
            messages={messages}
            participants={participants}
            toggles={toggles}
          />
          <section className="library-preview">
            <header>
              <div>
                <p>{snapshot.integration.mode}</p>
                <h2>Real integration preview</h2>
              </div>
              <span>{snapshot.integration.rendererId}</span>
            </header>
            <LibraryRenderer
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
