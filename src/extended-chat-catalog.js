const sources = {
  minchat: `
import { MainContainer, MessageInput, MessageList, MessageContainer } from '@minchat/react-chat-ui';

export function MinChatDemo({ messages, currentUserId }) {
  return (
    <MainContainer style={{ height: 420 }}>
      <MessageContainer>
        <MessageList currentUserId={currentUserId} messages={messages} />
        <MessageInput placeholder="Type message..." />
      </MessageContainer>
    </MainContainer>
  );
}`,
  reactSimpleChatbot: `
import ChatBot from 'react-simple-chatbot';

export function ReactSimpleChatbotDemo() {
  return (
    <ChatBot
      steps={[
        { id: '1', message: 'Hello!', trigger: '2' },
        { id: '2', message: 'Type something:', trigger: '3' },
        { id: '3', user: true, end: true },
      ]}
    />
  );
}`,
  reactChatbotKit: `
import Chatbot from 'react-chatbot-kit';
import config from './config';
import MessageParser from './MessageParser';
import ActionProvider from './ActionProvider';

export function ReactChatbotKitDemo() {
  return (
    <Chatbot
      config={config}
      messageParser={MessageParser}
      actionProvider={ActionProvider}
    />
  );
}`,
  nlux: `
import { AiChat } from '@nlux/react';

export function NluxDemo({ adapter }) {
  return (
    <AiChat adapter={adapter} personaOptions={{ assistant: { name: 'Helper' } }} />
  );
}`,
  livechat: `
import { LiveChatWidget } from '@livechat/widget-react';

export function LiveChatDemo({ license }) {
  return <LiveChatWidget license={license} visibility="maximized" />;
}`,
  rocketChat: `
import { Box, Avatar, MessageHeader } from '@rocket.chat/fuselage';

export function RocketChatFuselageDemo({ message }) {
  return (
    <Box>
      <MessageHeader>
        <Avatar url={message.avatar} />
        <strong>{message.author}</strong>
      </MessageHeader>
      <Box>{message.body}</Box>
    </Box>
  );
}`,
  vercelAi: `
import { useChat } from 'ai/react';

export function VercelAiDemo() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>{m.role}: {m.content}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}`,
};

function normalize(sourceCode) {
  const trimmed = sourceCode.trim();
  return {
    sourceCode: trimmed,
    codeLineCount: trimmed.split('\n').length,
    codeSymbolCount: trimmed.length,
  };
}

function integration(rendererId, mode, status, packageImport, raw) {
  return {
    rendererId,
    mode,
    status,
    packageImport,
    ...normalize(raw),
  };
}

function localizedText(en, es, ja) {
  return { en, es, ja };
}

export const extendedChatProfiles = [
  {
    id: 'minchat-react-chat-ui',
    name: 'MinChat React Chat UI',
    packageName: '@minchat/react-chat-ui',
    marketPosition: 'Drop-in React chat components with a hosted SDK option',
    sourceUrls: [
      'https://minchat.io',
      'https://www.npmjs.com/package/@minchat/react-chat-ui',
    ],
    maintenance: {
      githubUrl: 'https://github.com/MinChatHQ/minchat-react-chat-ui',
      license: 'ISC',
      latestVersion: '1.5.2',
      lastReleaseAt: '2025-09-12',
      stars: 220,
    },
    integration: integration(
      'minchat',
      'Offline verified package demo',
      'Interactive local surface verifies message rendering and sending; the source block shows the @minchat/react-chat-ui MessageList and MessageInput import path.',
      "import { MainContainer, MessageList, MessageInput } from '@minchat/react-chat-ui';",
      sources.minchat
    ),
    accent: '#0ea5e9',
    background: '#dff5fe',
    avatar: 'MC',
    audience: 'Teams that want a drop-in chat UI with optional hosted backend.',
    featureHighlights: [
      'Message list',
      'Message input',
      'Conversation list',
      'Loading states',
      'Header slots',
    ],
    configurableSurfaces: ['Props', 'Theme tokens', 'Layout', 'Avatar slots'],
    designRecommendations: [
      'Use the kit when the product owns persistence and routing.',
      'Pair MessageInput with explicit aria-labels for screen readers.',
      'Keep avatar slots customizable for branded chats.',
    ],
    featureMatrix: {
      avatar: true,
      senderName: true,
      timestamp: true,
      reply: false,
      markdownMessages: false,
      markdownComposer: false,
      textAreaComposer: false,
      contentEditableComposer: false,
      inlineComposer: true,
      threads: false,
      typing: true,
      reactions: false,
      fileAttachments: false,
      aiStreaming: false,
      moderation: false,
    },
    limitations: [
      'No markdown rendering in messages.',
      'Composer is a single input, not a textarea.',
    ],
    lockIns: ['Hosted MinChat backend is optional but recommended.'],
    participants: [
      { id: 'rae', name: 'Rae Smith', role: 'Operator' },
      { id: 'bot', name: 'MinBot', role: 'Assistant' },
    ],
    messages: [
      {
        id: 'mc-1',
        authorId: 'rae',
        sentAt: '10:01',
        status: 'read',
        text: localizedText(
          'Quick onboarding question please.',
          'Pregunta rapida de onboarding por favor.',
          'オンボーディングの簡単な質問です。'
        ),
      },
      {
        id: 'mc-2',
        authorId: 'bot',
        sentAt: '10:02',
        status: 'read',
        text: localizedText(
          'Sure. What feature do you need first?',
          'Claro. Que funcion necesitas primero?',
          'もちろん。最初に必要な機能は?'
        ),
      },
      {
        id: 'mc-3',
        authorId: 'rae',
        sentAt: '10:03',
        status: 'sent',
        text: localizedText(
          'A message list that wraps Japanese cleanly.',
          'Una lista de mensajes que ajuste bien el japones.',
          '日本語を綺麗に折り返すメッセージ一覧。'
        ),
      },
    ],
  },
  {
    id: 'react-simple-chatbot',
    name: 'react-simple-chatbot',
    packageName: 'react-simple-chatbot',
    marketPosition: 'Scripted chatbot UI with steps and decisions',
    sourceUrls: [
      'https://lucasbassetti.com.br/react-simple-chatbot/',
      'https://www.npmjs.com/package/react-simple-chatbot',
    ],
    maintenance: {
      githubUrl: 'https://github.com/lucasbassetti/react-simple-chatbot',
      license: 'MIT',
      latestVersion: '0.6.1',
      lastReleaseAt: '2024-11-19',
      stars: 1757,
    },
    integration: integration(
      'react-simple-chatbot',
      'Offline echo source demo',
      'react-simple-chatbot is a self-contained component; the live surface renders the offline echo runtime against the real ChatBot import shown below.',
      "import ChatBot from 'react-simple-chatbot';",
      sources.reactSimpleChatbot
    ),
    accent: '#16a34a',
    background: '#e6f6ec',
    avatar: 'SC',
    audience: 'Onboarding flows and product tours with fixed scripts.',
    featureHighlights: [
      'Step graph',
      'User input steps',
      'Trigger logic',
      'Themed bubbles',
      'Bot avatar',
    ],
    configurableSurfaces: [
      'Steps array',
      'Theme provider',
      'Bot avatar',
      'Header title',
    ],
    designRecommendations: [
      'Use it for product tours, not for live agent chat.',
      'Keep step trees flat to stay maintainable.',
      'Surface the underlying state for testing rather than asserting on UI.',
    ],
    featureMatrix: {
      avatar: true,
      senderName: true,
      timestamp: false,
      reply: false,
      markdownMessages: false,
      markdownComposer: false,
      textAreaComposer: false,
      contentEditableComposer: false,
      inlineComposer: true,
      threads: false,
      typing: true,
      reactions: false,
      fileAttachments: false,
      aiStreaming: false,
      moderation: false,
    },
    limitations: [
      'Not a free-form chat: every reply is part of a scripted step.',
    ],
    lockIns: [
      'Steps DSL is library-specific; portability across other chats is low.',
    ],
    participants: [
      { id: 'guide', name: 'Onboarding Bot', role: 'Bot' },
      { id: 'user', name: 'Visitor', role: 'User' },
    ],
    messages: [
      {
        id: 'sc-1',
        authorId: 'guide',
        sentAt: '12:00',
        status: 'read',
        text: localizedText(
          'Welcome! Which workspace are you setting up?',
          'Bienvenido! Que workspace configuras?',
          'ようこそ! どのワークスペースを設定しますか?'
        ),
      },
      {
        id: 'sc-2',
        authorId: 'user',
        sentAt: '12:01',
        status: 'read',
        text: localizedText(
          'Team space.',
          'Espacio de equipo.',
          'チームスペース。'
        ),
      },
      {
        id: 'sc-3',
        authorId: 'guide',
        sentAt: '12:01',
        status: 'sent',
        text: localizedText(
          'Got it. Next step: invite teammates.',
          'Entendido. Siguiente: invita al equipo.',
          'OK。次はメンバー招待です。'
        ),
      },
    ],
  },
  {
    id: 'react-chatbot-kit',
    name: 'react-chatbot-kit',
    packageName: 'react-chatbot-kit',
    marketPosition: 'Configurable React chatbot widget',
    sourceUrls: [
      'https://fredrikoseberg.github.io/react-chatbot-kit-docs/',
      'https://www.npmjs.com/package/react-chatbot-kit',
    ],
    maintenance: {
      githubUrl: 'https://github.com/FredrikOseberg/react-chatbot-kit',
      license: 'MIT',
      latestVersion: '2.2.2',
      lastReleaseAt: '2023-12-16',
      stars: 376,
    },
    integration: integration(
      'react-chatbot-kit',
      'Offline echo source demo',
      'react-chatbot-kit ships config, parser, and provider modules; the live surface renders the offline echo runtime against the real Chatbot import shown below.',
      "import Chatbot from 'react-chatbot-kit';",
      sources.reactChatbotKit
    ),
    accent: '#f59e0b',
    background: '#fef3c7',
    avatar: 'CK',
    audience: 'Apps embedding chatbots driven by classifier or rule output.',
    featureHighlights: [
      'Config object',
      'Message parser',
      'Action provider',
      'Custom widgets',
      'Stateful messages',
    ],
    configurableSurfaces: [
      'Initial messages',
      'Widgets list',
      'Bot name',
      'Action providers',
    ],
    designRecommendations: [
      'Lock down the message parser interface before opening it to handlers.',
      'Store conversation state externally so it survives navigation.',
      'Treat widgets as small components, not entire pages.',
    ],
    featureMatrix: {
      avatar: true,
      senderName: true,
      timestamp: false,
      reply: false,
      markdownMessages: false,
      markdownComposer: false,
      textAreaComposer: true,
      contentEditableComposer: false,
      inlineComposer: false,
      threads: false,
      typing: false,
      reactions: false,
      fileAttachments: false,
      aiStreaming: false,
      moderation: false,
    },
    limitations: [
      'Less active: latest release in 2023.',
      'No streaming AI integration out of the box.',
    ],
    lockIns: ['Custom DSL for config + parser + provider triple.'],
    participants: [
      { id: 'bot', name: 'Helper', role: 'Bot' },
      { id: 'visitor', name: 'Visitor', role: 'User' },
    ],
    messages: [
      {
        id: 'rck-1',
        authorId: 'bot',
        sentAt: '13:00',
        status: 'read',
        text: localizedText(
          'Pick an option to continue.',
          'Elige una opcion para continuar.',
          '続けるオプションを選んでください。'
        ),
      },
      {
        id: 'rck-2',
        authorId: 'visitor',
        sentAt: '13:01',
        status: 'read',
        text: localizedText(
          'Account help.',
          'Ayuda de cuenta.',
          'アカウントヘルプ。'
        ),
      },
      {
        id: 'rck-3',
        authorId: 'bot',
        sentAt: '13:02',
        status: 'sent',
        text: localizedText(
          'Opening account widget.',
          'Abriendo widget de cuenta.',
          'アカウントウィジェットを開いています。'
        ),
      },
    ],
  },
  {
    id: 'nlux-react',
    name: 'NLUX React',
    packageName: '@nlux/react',
    marketPosition: 'Conversational AI UI primitives for React',
    sourceUrls: [
      'https://docs.nlkit.com/nlux/',
      'https://www.npmjs.com/package/@nlux/react',
    ],
    maintenance: {
      githubUrl: 'https://github.com/nlkitai/nlux',
      license: 'MPL-2.0',
      latestVersion: '2.17.1',
      lastReleaseAt: '2024-08-15',
      stars: 1376,
    },
    integration: integration(
      'nlux',
      'Offline echo adapter demo',
      'NLUX needs an LLM adapter; the live surface renders the offline echo runtime against the real AiChat import shown below.',
      "import { AiChat } from '@nlux/react';",
      sources.nlux
    ),
    accent: '#7c3aed',
    background: '#ede9fe',
    avatar: 'NX',
    audience: 'AI chat surfaces that need persona, prompts, and streaming.',
    featureHighlights: [
      'AiChat component',
      'Adapter pattern',
      'Persona options',
      'Streaming responses',
      'Themable UI',
    ],
    configurableSurfaces: [
      'Adapter implementations',
      'Persona options',
      'Theme tokens',
      'Composer behavior',
    ],
    designRecommendations: [
      'Keep adapters thin so swapping providers is one file.',
      'Stream tokens to the client so latency is visible early.',
      'Avoid baking prompts into the UI; treat them as configuration.',
    ],
    featureMatrix: {
      avatar: true,
      senderName: true,
      timestamp: true,
      reply: false,
      markdownMessages: true,
      markdownComposer: false,
      textAreaComposer: true,
      contentEditableComposer: false,
      inlineComposer: false,
      threads: false,
      typing: true,
      reactions: false,
      fileAttachments: false,
      aiStreaming: true,
      moderation: false,
    },
    limitations: [
      'Hosted-only telemetry is not part of the React kit.',
      'Adapter author is responsible for retries.',
    ],
    lockIns: ['MPL-2.0 obligations apply to source modifications.'],
    participants: [
      { id: 'user', name: 'Operator', role: 'User' },
      { id: 'ai', name: 'Assistant', role: 'AI' },
    ],
    messages: [
      {
        id: 'nlux-1',
        authorId: 'user',
        sentAt: '14:00',
        status: 'read',
        text: localizedText(
          'Plan a release retro outline.',
          'Esquema para un retro de release.',
          'リリース振り返りのアウトラインを作成。'
        ),
      },
      {
        id: 'nlux-2',
        authorId: 'ai',
        sentAt: '14:00',
        status: 'read',
        text: localizedText(
          '## Outline\n\n1. Wins\n2. Risks\n3. Actions',
          '## Esquema\n\n1. Logros\n2. Riesgos\n3. Acciones',
          '## アウトライン\n\n1. 成果\n2. リスク\n3. アクション'
        ),
      },
      {
        id: 'nlux-3',
        authorId: 'user',
        sentAt: '14:01',
        status: 'sent',
        text: localizedText(
          'Add owner column.',
          'Agrega columna de responsable.',
          '担当者列を追加。'
        ),
      },
    ],
  },
  {
    id: 'livechat-widget-react',
    name: 'LiveChat Widget',
    packageName: '@livechat/widget-react',
    marketPosition: 'Hosted LiveChat widget React wrapper',
    sourceUrls: [
      'https://developers.livechat.com/docs/extending-chat-widget/react-widget',
      'https://www.npmjs.com/package/@livechat/widget-react',
    ],
    maintenance: {
      githubUrl: 'https://github.com/livechat/widget-react',
      license: 'MIT',
      latestVersion: '1.4.0',
      lastReleaseAt: '2026-02-20',
      stars: 32,
    },
    integration: integration(
      'livechat-source',
      'Hosted widget source preview',
      'LiveChatWidget requires a paid LiveChat licence; the live surface shows the published widget source plus an offline transcript that exercises the composer.',
      "import { LiveChatWidget } from '@livechat/widget-react';",
      sources.livechat
    ),
    accent: '#dc2626',
    background: '#fee2e2',
    avatar: 'LC',
    audience: 'Marketing or support sites that already use LiveChat.',
    featureHighlights: [
      'Hosted widget',
      'Agent inbox',
      'Visitor tracking',
      'Survey forms',
      'Mobile parity',
    ],
    configurableSurfaces: [
      'License id',
      'Visibility prop',
      'Customer name',
      'Event callbacks',
    ],
    designRecommendations: [
      'Treat the widget as opaque: cover with feature flags rather than DOM hacks.',
      'Keep visibility transitions accessible (focus restoration).',
      'Use the React events to bridge analytics to your stack.',
    ],
    featureMatrix: {
      avatar: true,
      senderName: true,
      timestamp: true,
      reply: false,
      markdownMessages: false,
      markdownComposer: false,
      textAreaComposer: true,
      contentEditableComposer: false,
      inlineComposer: false,
      threads: false,
      typing: true,
      reactions: false,
      fileAttachments: true,
      aiStreaming: false,
      moderation: true,
    },
    limitations: [
      'Hosted-only; no offline rendering.',
      'Customization is bounded by LiveChat settings.',
    ],
    lockIns: ['Requires LiveChat license.'],
    participants: [
      { id: 'visitor', name: 'Visitor', role: 'User' },
      { id: 'agent', name: 'Agent', role: 'Support' },
    ],
    messages: [
      {
        id: 'lc-1',
        authorId: 'visitor',
        sentAt: '15:00',
        status: 'read',
        text: localizedText(
          'My invoice is wrong, can you help?',
          'Mi factura esta mal, puedes ayudar?',
          '請求書が間違っています、助けてください。'
        ),
      },
      {
        id: 'lc-2',
        authorId: 'agent',
        sentAt: '15:01',
        status: 'read',
        text: localizedText(
          'I can. Sharing the invoice number please.',
          'Si puedo. Comparte el numero de factura.',
          '対応します。請求書番号を共有してください。'
        ),
      },
      {
        id: 'lc-3',
        authorId: 'visitor',
        sentAt: '15:02',
        status: 'sent',
        text: localizedText('INV-3982.', 'INV-3982.', 'INV-3982。'),
      },
    ],
  },
  {
    id: 'rocketchat-fuselage',
    name: 'Rocket.Chat Fuselage',
    packageName: '@rocket.chat/fuselage',
    marketPosition: 'Design system primitives behind Rocket.Chat',
    sourceUrls: [
      'https://developer.rocket.chat/customize-and-embed/embed-rocket.chat',
      'https://www.npmjs.com/package/@rocket.chat/fuselage',
    ],
    maintenance: {
      githubUrl: 'https://github.com/RocketChat/fuselage',
      license: 'MIT',
      latestVersion: '0.78.0',
      lastReleaseAt: '2026-05-04',
      stars: 155,
    },
    integration: integration(
      'rocket-chat-fuselage',
      'Offline echo primitive demo',
      'Rocket.Chat Fuselage ships UI primitives; the live surface composes Box, Avatar, and MessageHeader against the offline echo runtime.',
      "import { Box, Avatar, MessageHeader } from '@rocket.chat/fuselage';",
      sources.rocketChat
    ),
    accent: '#0f766e',
    background: '#ccfbf1',
    avatar: 'RC',
    audience: 'Teams that want Rocket.Chat-style primitives for chat.',
    featureHighlights: [
      'Box primitive',
      'Avatar',
      'Message header',
      'Theme tokens',
      'Accessibility primitives',
    ],
    configurableSurfaces: [
      'Theme tokens',
      'Component props',
      'Composable layout',
      'Avatar slots',
    ],
    designRecommendations: [
      'Use Fuselage primitives, then own the message model.',
      'Match tokens to your design system, not Rocket.Chat defaults.',
      'Add reduced motion and focus tests around custom message rows.',
    ],
    featureMatrix: {
      avatar: true,
      senderName: true,
      timestamp: true,
      reply: false,
      markdownMessages: false,
      markdownComposer: false,
      textAreaComposer: false,
      contentEditableComposer: false,
      inlineComposer: false,
      threads: false,
      typing: false,
      reactions: false,
      fileAttachments: false,
      aiStreaming: false,
      moderation: false,
    },
    limitations: [
      'Not a chat. You must compose the surface yourself.',
      'No state model included.',
    ],
    lockIns: ['Token names align with Rocket.Chat conventions.'],
    participants: [
      { id: 'maint', name: 'Maintainer', role: 'Engineer' },
      { id: 'contrib', name: 'Contributor', role: 'Engineer' },
    ],
    messages: [
      {
        id: 'rcf-1',
        authorId: 'maint',
        sentAt: '16:00',
        status: 'read',
        text: localizedText(
          'Use Fuselage for the message header only; keep the body in our own renderer.',
          'Usa Fuselage solo para el header; mantenemos el cuerpo en nuestro renderer.',
          'メッセージヘッダーのみFuselageを使い、本文は自前のレンダラーで。'
        ),
      },
      {
        id: 'rcf-2',
        authorId: 'contrib',
        sentAt: '16:01',
        status: 'read',
        text: localizedText(
          'Sounds good. Matching tokens now.',
          'Suena bien. Igualando tokens.',
          '了解。トークンを揃えています。'
        ),
      },
      {
        id: 'rcf-3',
        authorId: 'maint',
        sentAt: '16:02',
        status: 'sent',
        text: localizedText(
          'Add focus tests for the header avatar.',
          'Agrega pruebas de foco para el avatar.',
          'ヘッダーアバターのフォーカステストを追加。'
        ),
      },
    ],
  },
  {
    id: 'vercel-ai-sdk',
    name: 'Vercel AI SDK (useChat)',
    packageName: 'ai',
    marketPosition: 'Streaming AI chat primitives for React/Next.js',
    sourceUrls: ['https://ai-sdk.dev', 'https://www.npmjs.com/package/ai'],
    maintenance: {
      githubUrl: 'https://github.com/vercel/ai',
      license: 'Apache-2.0',
      latestVersion: '6.0.177',
      lastReleaseAt: '2026-05-11',
      stars: 24150,
    },
    integration: integration(
      'vercel-ai',
      'Offline echo runtime demo',
      'Vercel AI useChat normally calls an API route; the live surface runs the offline echo runtime so the composer round-trips a reply locally against the real hook source shown below.',
      "import { useChat } from 'ai/react';",
      sources.vercelAi
    ),
    accent: '#111827',
    background: '#e5e7eb',
    avatar: 'AI',
    audience: 'Next.js/React apps streaming AI completions.',
    featureHighlights: [
      'useChat hook',
      'Streaming completions',
      'Tool calls',
      'Multi-step messages',
      'Server actions integration',
    ],
    configurableSurfaces: [
      'API route',
      'Tools list',
      'Message rendering',
      'System prompt',
    ],
    designRecommendations: [
      'Stream to the UI; do not buffer the full message.',
      'Keep tool calls visible so users can audit decisions.',
      'Persist messages outside React state so they survive reloads.',
    ],
    featureMatrix: {
      avatar: false,
      senderName: true,
      timestamp: false,
      reply: false,
      markdownMessages: true,
      markdownComposer: true,
      textAreaComposer: true,
      contentEditableComposer: false,
      inlineComposer: true,
      threads: false,
      typing: true,
      reactions: false,
      fileAttachments: true,
      aiStreaming: true,
      moderation: false,
    },
    limitations: [
      'No prebuilt UI - you bring the message components.',
      'Server route is mandatory for streaming.',
    ],
    lockIns: [
      'Designed for Next.js but works with other servers via the AI SDK Core.',
    ],
    participants: [
      { id: 'user', name: 'Operator', role: 'User' },
      { id: 'ai', name: 'Assistant', role: 'AI' },
    ],
    messages: [
      {
        id: 'ai-vercel-1',
        authorId: 'user',
        sentAt: '17:00',
        status: 'read',
        text: localizedText(
          'Summarize the release notes file.',
          'Resume las notas de release.',
          'リリースノートを要約してください。'
        ),
      },
      {
        id: 'ai-vercel-2',
        authorId: 'ai',
        sentAt: '17:00',
        status: 'read',
        text: localizedText(
          '**Summary**\n\n- Streaming chat hook\n- Tool calls\n- Multi-step',
          '**Resumen**\n\n- Hook de chat\n- Herramientas\n- Multi-paso',
          '**まとめ**\n\n- 配信フック\n- ツール呼び出し\n- 多段ステップ'
        ),
      },
      {
        id: 'ai-vercel-3',
        authorId: 'user',
        sentAt: '17:01',
        status: 'sent',
        text: localizedText(
          'Add tool result examples.',
          'Agrega ejemplos de resultados.',
          'ツール結果の例を追加。'
        ),
      },
    ],
  },
];
