import React, { useMemo } from 'react';
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

export const localParticipant = {
  id: 'reviewer',
  name: 'You',
  role: 'Reviewer',
};

export function Avatar({ label, accent, className = 'avatar' }) {
  return (
    <span className={className} style={{ '--avatar-accent': accent }}>
      {label}
    </span>
  );
}

export function stripMarkdown(value) {
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

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
}

function SurfaceFrame({ children, className, messages, rendererId, snapshot }) {
  return (
    <div
      className={`library-frame ${className}`}
      data-message-count={messages.length}
      data-renderer-id={rendererId}
      data-testid="demo-surface"
      style={{ '--surface-accent': snapshot.accent }}
    >
      {children}
    </div>
  );
}

function ChatScopePreview({ messages, participants, snapshot }) {
  const participantMap = useMemo(
    () => createParticipantMap(participants),
    [participants]
  );

  return (
    <SurfaceFrame
      className="chatscope-frame"
      messages={messages}
      rendererId="chatscope"
      snapshot={snapshot}
    >
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
    </SurfaceFrame>
  );
}

function ReactChatElementsPreview({ messages, participants, snapshot }) {
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
    <SurfaceFrame
      className="rce-frame"
      messages={messages}
      rendererId="react-chat-elements"
      snapshot={snapshot}
    >
      <ReactChatElementsMessageList
        lockable
        toBottomHeight="100%"
        dataSource={dataSource}
      />
    </SurfaceFrame>
  );
}

function DeepChatPreview({ messages, snapshot }) {
  const history = messages.map((message) => ({
    role: message.authorId === localParticipant.id ? 'user' : 'ai',
    text: message.text,
  }));

  return (
    <SurfaceFrame
      className="deep-chat-frame"
      messages={messages}
      rendererId="deep-chat"
      snapshot={snapshot}
    >
      <DeepChat
        history={history}
        textInput={{
          disabled: true,
          placeholder: { text: 'Use the composer below' },
        }}
        chatStyle={{ height: '360px', width: '100%' }}
      />
    </SurfaceFrame>
  );
}

function OwnChatPreview({ snapshot, messages, participants, toggles }) {
  const participantMap = useMemo(
    () => createParticipantMap(participants),
    [participants]
  );
  const messageMap = useMemo(
    () => new Map(messages.map((message) => [message.id, message])),
    [messages]
  );

  return (
    <SurfaceFrame
      className="own-chat-frame"
      messages={messages}
      rendererId="own-chat"
      snapshot={snapshot}
    >
      <ul className="own-chat-list">
        {messages.map((message) => {
          const author = participantMap.get(message.authorId);
          const isLocal = message.authorId === localParticipant.id;
          const replyTarget =
            toggles.showReplies && message.replyToId
              ? messageMap.get(message.replyToId)
              : null;
          const replyAuthor = replyTarget
            ? participantMap.get(replyTarget.authorId)
            : null;

          return (
            <li
              key={message.id}
              className={`own-chat-message ${isLocal ? 'is-local' : ''}`}
              data-testid="demo-message"
            >
              {toggles.showAvatar && (
                <span
                  className="own-chat-avatar"
                  style={{ background: snapshot.accent }}
                >
                  {getInitials(author?.name ?? '?')}
                </span>
              )}
              <div className="own-chat-body">
                {toggles.showSenderName && (
                  <strong data-testid="demo-message-author">
                    {author?.name ?? 'Participant'}
                  </strong>
                )}
                {replyTarget && (
                  <blockquote
                    className="reply-quote"
                    data-testid="demo-message-reply"
                  >
                    <strong>{replyAuthor?.name ?? 'Participant'}</strong>
                    <span>{stripMarkdown(replyTarget.text).slice(0, 80)}</span>
                  </blockquote>
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
    </SurfaceFrame>
  );
}

function AdapterThread({ snapshot, messages, participants, toggles }) {
  const participantMap = useMemo(
    () => createParticipantMap(participants),
    [participants]
  );
  const messageMap = useMemo(
    () => new Map(messages.map((message) => [message.id, message])),
    [messages]
  );

  return (
    <div className="adapter-thread" role="log">
      {messages.map((message) => {
        const author = participantMap.get(message.authorId);
        const isLocal = message.authorId === localParticipant.id;
        const replyTarget =
          toggles.showReplies && message.replyToId
            ? messageMap.get(message.replyToId)
            : null;
        const replyAuthor = replyTarget
          ? participantMap.get(replyTarget.authorId)
          : null;

        return (
          <article
            className={`adapter-message ${isLocal ? 'is-local' : ''}`}
            data-testid="demo-message"
            key={message.id}
          >
            {toggles.showAvatar && (
              <Avatar
                accent={snapshot.accent}
                className="adapter-avatar"
                label={getInitials(author?.name ?? 'User')}
              />
            )}
            <div className="adapter-bubble">
              {(toggles.showSenderName || toggles.showTimestamp) && (
                <div className="adapter-meta">
                  {toggles.showSenderName && (
                    <strong data-testid="demo-message-author">
                      {author?.name ?? 'Participant'}
                    </strong>
                  )}
                  {toggles.showTimestamp && <time>{message.sentAt}</time>}
                </div>
              )}
              {replyTarget && (
                <blockquote
                  className="reply-quote"
                  data-testid="demo-message-reply"
                >
                  <strong>{replyAuthor?.name ?? 'Participant'}</strong>
                  <span>{stripMarkdown(replyTarget.text).slice(0, 80)}</span>
                </blockquote>
              )}
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function OfflineAdapterPreview({ snapshot, messages, participants, toggles }) {
  return (
    <SurfaceFrame
      className="adapter-chat-frame"
      messages={messages}
      rendererId={snapshot.integration.rendererId}
      snapshot={snapshot}
    >
      <AdapterThread
        messages={messages}
        participants={participants}
        snapshot={snapshot}
        toggles={toggles}
      />
    </SurfaceFrame>
  );
}

const HOSTED_SOURCE_RENDERERS = new Set([
  'stream-source',
  'sendbird-source',
  'cometchat-source',
  'talkjs-source',
  'livechat-source',
]);

function HostedSourcePreview({ snapshot, messages, participants, toggles }) {
  const raw = snapshot.integration.sourceCode?.raw ?? '';
  return (
    <SurfaceFrame
      className="hosted-source-frame"
      messages={messages}
      rendererId={snapshot.integration.rendererId}
      snapshot={snapshot}
    >
      <div className="hosted-source-grid">
        <aside className="hosted-source-panel">
          <header>
            <strong>Hosted SDK source</strong>
            <span>{snapshot.integration.status}</span>
          </header>
          <pre>
            <code>{raw || snapshot.integration.packageImport}</code>
          </pre>
        </aside>
        <div className="hosted-source-transcript">
          <AdapterThread
            messages={messages}
            participants={participants}
            snapshot={snapshot}
            toggles={toggles}
          />
        </div>
      </div>
    </SurfaceFrame>
  );
}

export function DemoSurface({ snapshot, messages, participants, toggles }) {
  const rendererId = snapshot.integration.rendererId;
  switch (rendererId) {
    case 'chatscope':
      return (
        <ChatScopePreview
          messages={messages}
          participants={participants}
          snapshot={snapshot}
        />
      );
    case 'react-chat-elements':
      return (
        <ReactChatElementsPreview
          messages={messages}
          participants={participants}
          snapshot={snapshot}
        />
      );
    case 'deep-chat':
      return <DeepChatPreview messages={messages} snapshot={snapshot} />;
    case 'own-chat':
      return (
        <OwnChatPreview
          messages={messages}
          participants={participants}
          snapshot={snapshot}
          toggles={toggles}
        />
      );
    default:
      if (HOSTED_SOURCE_RENDERERS.has(rendererId)) {
        return (
          <HostedSourcePreview
            messages={messages}
            participants={participants}
            snapshot={snapshot}
            toggles={toggles}
          />
        );
      }
      return (
        <OfflineAdapterPreview
          messages={messages}
          participants={participants}
          snapshot={snapshot}
          toggles={toggles}
        />
      );
  }
}
