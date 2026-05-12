const ownChatSource = `
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export function OwnChat({ participants, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');

  function send(text) {
    if (!text.trim()) return;
    setMessages((current) => [
      ...current,
      { id: \`reply-\${current.length + 1}\`, author: 'you', text },
    ]);
    setDraft('');
  }

  return (
    <section className="own-chat" role="log">
      <ul className="own-chat-list">
        {messages.map((message) => (
          <li key={message.id} className={\`own-chat-message own-chat-author-\${message.author}\`}>
            <span className="own-chat-avatar">{message.author.slice(0, 2)}</span>
            <div className="own-chat-body">
              <strong>{participants[message.author]?.name ?? message.author}</strong>
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          </li>
        ))}
      </ul>
      <form
        className="own-chat-composer"
        onSubmit={(event) => {
          event.preventDefault();
          send(draft);
        }}
      >
        <textarea
          aria-label="Compose"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </section>
  );
}
`.trim();

export const ownChatProfile = {
  id: 'link-assistant-own',
  name: 'Our own chat UI',
  packageName: '@link-assistant/react-chat-ui',
  marketPosition: 'Built-in React chat surface, GPTutor-derived',
  sourceUrls: [
    'https://github.com/link-assistant/react-chat-ui',
    'https://github.com/deep-assistant/GPTutor',
  ],
  maintenance: {
    githubUrl: 'https://github.com/deep-assistant/GPTutor',
    license: 'Unlicense',
    latestVersion: '0.10.0',
    lastReleaseAt: '2025-10-25',
    stars: 24,
  },
  integration: {
    rendererId: 'own-chat',
    mode: 'Built-in React component',
    status:
      'Rendered locally by docs/chat-demos/profiles/link-assistant-own; ported from GPTutor as a small, dependency-free React component.',
    packageImport:
      "import { OwnChat } from '@link-assistant/react-chat-ui/own-chat';",
    sourceCode: ownChatSource,
    codeLineCount: ownChatSource.split('\n').length,
    codeSymbolCount: ownChatSource.length,
  },
  accent: '#1d4ed8',
  background: '#e0e7ff',
  avatar: 'LA',
  audience: 'Teams that want a small built-in chat surface they fully control.',
  featureHighlights: [
    'Avatar toggle',
    'Name toggle',
    'Reply target',
    'Markdown messages',
    'Markdown composer',
    'Single-file React component',
    'Telegram-style reply chain',
  ],
  configurableSurfaces: [
    'Avatar visibility',
    'Sender name visibility',
    'Reply chain visibility',
    'Composer kind (textarea/markdown/input)',
    'Theme and language',
  ],
  designRecommendations: [
    'Keep the chrome configurable so the same component covers chatbot, support, and team modes.',
    'Render replies in a quoted block, not in a tooltip, so they survive screenshots.',
    'Preserve markdown source verbatim when persisting messages.',
  ],
  featureMatrix: {
    avatar: true,
    senderName: true,
    timestamp: true,
    reply: true,
    markdownMessages: true,
    markdownComposer: true,
    textAreaComposer: true,
    contentEditableComposer: true,
    inlineComposer: true,
    threads: false,
    typing: true,
    reactions: false,
    fileAttachments: false,
    aiStreaming: false,
    moderation: false,
  },
  limitations: [
    'No hosted backend.',
    'No file upload primitives.',
    'No reactions or threads yet.',
  ],
  lockIns: [
    'None - the component is MIT-style Unlicense and ships in this repository.',
  ],
  participants: [
    { id: 'alex', name: 'Alex Morgan', role: 'Reviewer' },
    { id: 'jules', name: 'Jules Martin', role: 'Contributor' },
    { id: 'mina', name: 'Mina Tan', role: 'Reviewer' },
  ],
  messages: [
    {
      id: 'own-1',
      authorId: 'alex',
      sentAt: '08:30',
      status: 'read',
      replyToId: null,
      text: {
        en: 'Our **own** chat is now a dedicated entry, not a library row.',
        es: 'Nuestro chat **propio** ahora es una entrada dedicada.',
        ja: '私たちの**独自**チャットは専用エントリになりました。',
      },
    },
    {
      id: 'own-2',
      authorId: 'jules',
      sentAt: '08:32',
      status: 'read',
      replyToId: 'own-1',
      text: {
        en: 'Replying to Alex: avatar, name, and reply chain are toggleable.',
        es: 'Respondiendo a Alex: avatar, nombre y respuestas son alternables.',
        ja: 'Alex への返信: アバター、名前、返信は切替可能です。',
      },
    },
    {
      id: 'own-3',
      authorId: 'mina',
      sentAt: '08:34',
      status: 'sent',
      replyToId: null,
      text: {
        en: 'Markdown lists work too:\n\n- Avatar toggle\n- Reply preview\n- Composer kind',
        es: 'Listas markdown también funcionan:\n\n- Avatar\n- Vista de respuesta\n- Tipo de redactor',
        ja: 'Markdown一覧も機能します:\n\n- アバター\n- 返信プレビュー\n- 入力種別',
      },
    },
  ],
};
