const createMessage = (id, authorId, sentAt, status, text, meta = {}) => ({
  id,
  authorId,
  sentAt,
  status,
  text,
  ...meta,
});

const normalizeSourceCode = (sourceCode) => sourceCode.trim();

const createIntegration = (integration) => {
  const sourceCode = normalizeSourceCode(integration.sourceCode);

  return {
    ...integration,
    sourceCode,
    codeLineCount: sourceCode.split('\n').length,
    codeSymbolCount: sourceCode.length,
  };
};

const chatDemoSources = {
  streamTeam: `
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';

export function StreamTeamDemo({ client, channel }) {
  return (
    <Chat client={client}>
      <Channel channel={channel}>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
}`,
  sendbirdMarketplace: `
import SendbirdProvider from '@sendbird/uikit-react/SendbirdProvider';
import GroupChannel from '@sendbird/uikit-react/GroupChannel';
import '@sendbird/uikit-react/dist/index.css';

export function SendbirdMarketplaceDemo({ appId, userId, channelUrl }) {
  return (
    <SendbirdProvider appId={appId} userId={userId}>
      <GroupChannel channelUrl={channelUrl} />
    </SendbirdProvider>
  );
}`,
  cometchatSupport: `
import {
  CometChatConversationsWithMessages,
  CometChatUIKit,
} from '@cometchat/chat-uikit-react';
import '@cometchat/chat-uikit-react/css-variables.css';

export async function mountCometChatSupportDemo(settings) {
  await CometChatUIKit.init(settings);

  return <CometChatConversationsWithMessages />;
}`,
  talkjsCommerce: `
import Talk from 'talkjs';
import { Chatbox, Session } from '@talkjs/react';

export function TalkJsCommerceDemo({ appId, user, conversationId }) {
  return (
    <Session appId={appId} userId={user.id}>
      <Chatbox conversationId={conversationId} style={{ height: 520 }} />
    </Session>
  );
}`,
  chatscopeCommunity: `
import {
  ChatContainer,
  MainContainer,
  Message,
  MessageList,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

export function ChatScopeCommunityDemo({ messages }) {
  return (
    <MainContainer>
      <ChatContainer>
        <MessageList>
          {messages.map((message) => (
            <Message key={message.id} model={message.model} />
          ))}
        </MessageList>
      </ChatContainer>
    </MainContainer>
  );
}`,
  reactChatElements: `
import {
  MessageList,
} from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';

export function ReactChatElementsDemo({ messages }) {
  return (
    <MessageList
      lockable
      toBottomHeight="100%"
      dataSource={messages}
    />
  );
}`,
  deepChatAi: `
import { DeepChat } from 'deep-chat-react';

export function DeepChatAiDemo({ history }) {
  return (
    <DeepChat
      history={history}
      textInput={{ disabled: true }}
      chatStyle={{ height: '360px', width: '100%' }}
    />
  );
}`,
  assistantCopilot: `
import {
  AssistantRuntimeProvider,
  ThreadPrimitive,
} from '@assistant-ui/react';

export function AssistantUiCopilotDemo({ runtime }) {
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadPrimitive.Root>
        <ThreadPrimitive.Viewport />
        <ThreadPrimitive.Composer />
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
}`,
};

export const themeOptions = [
  {
    id: 'light',
    label: 'Light',
    description: 'Neutral canvas with clear contrast for review sessions.',
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'Low-glare workspace for operations and support teams.',
  },
  {
    id: 'contrast',
    label: 'Contrast',
    description: 'High contrast controls and message surfaces.',
  },
];

export const languageOptions = [
  {
    id: 'en',
    label: 'English',
    shortLabel: 'EN',
    strings: {
      activeUsers: 'Active users',
      attachments: 'Attachments',
      configurable: 'Configurable',
      demoSelector: 'Chat demo',
      designDefaults: 'Design defaults',
      features: 'Features',
      language: 'Language',
      messagePlaceholder: 'Write a reply...',
      messages: 'Messages',
      theme: 'Theme',
      storage: 'Doublets storage',
      tryDemo: 'Open demo',
    },
  },
  {
    id: 'es',
    label: 'Espanol',
    shortLabel: 'ES',
    strings: {
      activeUsers: 'Usuarios activos',
      attachments: 'Adjuntos',
      configurable: 'Configurable',
      demoSelector: 'Demo de chat',
      designDefaults: 'Valores de diseno',
      features: 'Funciones',
      language: 'Idioma',
      messagePlaceholder: 'Escribe una respuesta...',
      messages: 'Mensajes',
      theme: 'Tema',
      storage: 'Almacenamiento Doublets',
      tryDemo: 'Abrir demo',
    },
  },
  {
    id: 'ja',
    label: 'Japanese',
    shortLabel: 'JA',
    strings: {
      activeUsers: 'Active users',
      attachments: 'Attachments',
      configurable: 'Configurable',
      demoSelector: 'Chat demo',
      designDefaults: 'Design defaults',
      features: 'Features',
      language: 'Language',
      messagePlaceholder: 'Write a reply...',
      messages: 'Messages',
      theme: 'Theme',
      storage: 'Doublets storage',
      tryDemo: 'Open demo',
    },
  },
];

export const chatDemoCatalog = [
  {
    id: 'stream-team',
    name: 'Stream Team Chat',
    packageName: 'stream-chat-react',
    marketPosition: 'Hosted activity-feed and team messaging SDK',
    sourceUrls: [
      'https://getstream.io/chat/docs/sdk/react/',
      'https://www.npmjs.com/package/stream-chat-react',
    ],
    maintenance: {
      githubUrl: 'https://github.com/GetStream/stream-chat-react',
      license: 'SEE LICENSE IN LICENSE',
      latestVersion: '14.1.0',
      lastReleaseAt: '2026-05-04',
      stars: 831,
    },
    integration: createIntegration({
      rendererId: 'credential-gated',
      mode: 'Hosted SDK source',
      status:
        'Requires a Stream app, user token, and channel; the gallery shows the real import source without mocking a hosted session.',
      packageImport:
        "import { Chat, Channel, MessageList, MessageInput } from 'stream-chat-react';",
      sourceCode: chatDemoSources.streamTeam,
    }),
    accent: '#0f9f8f',
    background: '#e7f6f2',
    avatar: 'ST',
    audience: 'Product teams that need a Slack-like channel UI quickly.',
    featureHighlights: [
      'Channel list',
      'Thread replies',
      'Typing state',
      'Reactions',
      'Moderation hooks',
    ],
    configurableSurfaces: [
      'Component overrides',
      'Message renderers',
      'Theme tokens',
      'Channel filters',
    ],
    designRecommendations: [
      'Keep channel density high and reserve color for unread and mention states.',
      'Group sequential messages by sender to reduce repeated avatar noise.',
      'Expose thread context next to the main timeline on desktop.',
    ],
    participants: [
      { id: 'alex', name: 'Alex Morgan', role: 'Product' },
      { id: 'nina', name: 'Nina Patel', role: 'Design' },
      { id: 'kai', name: 'Kai Chen', role: 'Engineering' },
    ],
    messages: [
      createMessage('st-1', 'alex', '09:12', 'read', {
        en: 'The release room is open. Can we pin the Unicode storage checklist?',
        es: 'La sala de lanzamiento esta abierta. Podemos fijar la lista de almacenamiento Unicode?',
        ja: 'リリース部屋を開きました。Unicode保存チェックリストを固定できますか?',
      }),
      createMessage('st-2', 'nina', '09:14', 'read', {
        en: 'Pinned. I also added before and after screenshots for the chat demos.',
        es: 'Fijado. Tambien agregue capturas antes y despues para los demos de chat.',
        ja: '固定しました。チャットデモの前後スクリーンショットも追加しました。',
      }),
      createMessage('st-3', 'kai', '09:18', 'sent', {
        en: 'Doublets graph now stores Привет, こんにちは, and emoji ✅ without truncation.',
        es: 'El grafo Doublets guarda Привет, こんにちは y emoji ✅ sin truncar.',
        ja: 'Doubletsグラフは Привет、こんにちは、絵文字✅ を欠落なく保存します。',
      }),
    ],
  },
  {
    id: 'sendbird-marketplace',
    name: 'Sendbird Marketplace Inbox',
    packageName: '@sendbird/uikit-react',
    marketPosition: 'Hosted UIKit for transactional and community chat',
    sourceUrls: [
      'https://sendbird.com/docs/chat/uikit/v3/react/overview',
      'https://www.npmjs.com/package/@sendbird/uikit-react',
    ],
    maintenance: {
      githubUrl: 'https://github.com/sendbird/sendbird-uikit-react',
      license: 'SEE LICENSE IN LICENSE.md',
      latestVersion: '3.17.12',
      lastReleaseAt: '2026-03-26',
      stars: 235,
    },
    integration: createIntegration({
      rendererId: 'credential-gated',
      mode: 'Hosted UIKit source',
      status:
        'Requires a Sendbird app ID, user ID, and channel URL; the exact React provider source is shown for credentialed trials.',
      packageImport:
        "import SendbirdProvider from '@sendbird/uikit-react/SendbirdProvider';",
      sourceCode: chatDemoSources.sendbirdMarketplace,
    }),
    accent: '#6b5cff',
    background: '#eeeafd',
    avatar: 'SB',
    audience: 'Marketplaces and communities needing user-to-user messaging.',
    featureHighlights: [
      'User list',
      'Delivery states',
      'Moderation',
      'File sharing',
      'Push-ready events',
    ],
    configurableSurfaces: [
      'UIKit providers',
      'Color set',
      'Message search',
      'Channel module composition',
    ],
    designRecommendations: [
      'Make transaction context visible without forcing users out of chat.',
      'Keep seller and buyer actions close to the composer.',
      'Use status labels for trust, delivery, and response expectations.',
    ],
    participants: [
      { id: 'maya', name: 'Maya Ross', role: 'Buyer' },
      { id: 'omar', name: 'Omar Ali', role: 'Seller' },
      { id: 'system', name: 'Marketplace', role: 'System' },
    ],
    messages: [
      createMessage('sb-1', 'system', '11:02', 'read', {
        en: 'Order #4821 is linked to this conversation.',
        es: 'El pedido #4821 esta vinculado a esta conversacion.',
        ja: '注文 #4821 がこの会話にリンクされています。',
      }),
      createMessage('sb-2', 'maya', '11:04', 'read', {
        en: 'Can you ship tomorrow? I need the laptop sleeve before Friday.',
        es: 'Puedes enviarlo manana? Necesito la funda antes del viernes.',
        ja: '明日発送できますか? 金曜日までにラップトップケースが必要です。',
      }),
      createMessage('sb-3', 'omar', '11:06', 'sent', {
        en: 'Yes. I uploaded the packing photo and tracking estimate.',
        es: 'Si. Subi la foto del paquete y la estimacion de seguimiento.',
        ja: 'はい。梱包写真と追跡予定をアップロードしました。',
      }),
    ],
  },
  {
    id: 'cometchat-support',
    name: 'CometChat Support Desk',
    packageName: '@cometchat/chat-uikit-react',
    marketPosition: 'UIKit for in-app support, calls, and collaboration',
    sourceUrls: [
      'https://www.cometchat.com/docs/ui-kit/react/overview',
      'https://www.npmjs.com/package/@cometchat/chat-uikit-react',
    ],
    maintenance: {
      githubUrl: 'https://github.com/cometchat/cometchat-uikit-react',
      license: 'CometChat legal terms',
      latestVersion: '6.4.3',
      lastReleaseAt: '2026-04-20',
      stars: 771,
    },
    integration: createIntegration({
      rendererId: 'credential-gated',
      mode: 'Hosted UIKit source',
      status:
        'Requires CometChat initialization settings; the shown source uses the published UIKit import path.',
      packageImport:
        "import { CometChatConversationsWithMessages } from '@cometchat/chat-uikit-react';",
      sourceCode: chatDemoSources.cometchatSupport,
    }),
    accent: '#ff6b4a',
    background: '#fff0eb',
    avatar: 'CC',
    audience: 'Support teams that need rich media and escalation paths.',
    featureHighlights: [
      'Agent assignment',
      'Voice/video entry',
      'Rich media',
      'Read receipts',
      'Conversation actions',
    ],
    configurableSurfaces: [
      'UIKit theme',
      'Action menus',
      'Message templates',
      'Extension points',
    ],
    designRecommendations: [
      'Put customer health and SLA signals in the same scan path as messages.',
      'Separate private agent notes from customer-visible replies.',
      'Keep escalation controls reachable but visually quieter than reply actions.',
    ],
    participants: [
      { id: 'ira', name: 'Ira Novak', role: 'Customer' },
      { id: 'zoe', name: 'Zoe King', role: 'Agent' },
      { id: 'sam', name: 'Sam Lee', role: 'Specialist' },
    ],
    messages: [
      createMessage('cc-1', 'ira', '13:20', 'read', {
        en: 'The invoice panel shows mojibake for "Sao Paulo" and "Muenchen".',
        es: 'El panel de factura muestra caracteres rotos para "Sao Paulo" y "Muenchen".',
        ja: '請求パネルで "Sao Paulo" と "Muenchen" が文字化けします。',
      }),
      createMessage('cc-2', 'zoe', '13:22', 'read', {
        en: 'Thanks. I can reproduce it with Portuguese and German customer names.',
        es: 'Gracias. Lo reproduzco con nombres de clientes portugueses y alemanes.',
        ja: 'ありがとうございます。ポルトガル語とドイツ語の顧客名で再現できます。',
      }),
      createMessage('cc-3', 'sam', '13:25', 'sent', {
        en: 'I attached a patched string codec trace for review.',
        es: 'Adjunte una traza corregida del codec de cadenas para revisar.',
        ja: '修正した文字列コーデックのトレースを添付しました。',
      }),
    ],
  },
  {
    id: 'talkjs-commerce',
    name: 'TalkJS Commerce Thread',
    packageName: '@talkjs/react',
    marketPosition: 'Embeddable cross-user conversation UI',
    sourceUrls: [
      'https://talkjs.com/docs/UI_Components/React/',
      'https://www.npmjs.com/package/@talkjs/react',
    ],
    maintenance: {
      githubUrl: 'https://github.com/talkjs/talkjs-react',
      license: 'MIT',
      latestVersion: '0.1.12',
      lastReleaseAt: '2026-02-02',
      stars: 16,
    },
    integration: createIntegration({
      rendererId: 'credential-gated',
      mode: 'Hosted embed source',
      status:
        'Requires a TalkJS app ID and conversation; the source block shows the real Session and Chatbox import path.',
      packageImport: "import { Chatbox, Session } from '@talkjs/react';",
      sourceCode: chatDemoSources.talkjsCommerce,
    }),
    accent: '#006adc',
    background: '#e8f2ff',
    avatar: 'TJ',
    audience: 'Apps that need fast embedded buyer, seller, or expert chat.',
    featureHighlights: [
      'Embeddable inbox',
      'Conversation sync',
      'Email fallback',
      'Custom data',
      'Role-based access',
    ],
    configurableSurfaces: [
      'Session data',
      'Inbox layout',
      'Custom fields',
      'Notification policy',
    ],
    designRecommendations: [
      'Make the embedded frame feel native by matching spacing and typography.',
      'Show object context so the thread does not become detached from the task.',
      'Use clear fallback states when a counterparty is offline.',
    ],
    participants: [
      { id: 'lena', name: 'Lena Ortiz', role: 'Host' },
      { id: 'ravi', name: 'Ravi Singh', role: 'Guest' },
      { id: 'bot', name: 'Booking Bot', role: 'Automation' },
    ],
    messages: [
      createMessage('tj-1', 'bot', '15:38', 'read', {
        en: 'Reservation request for May 12 is ready for confirmation.',
        es: 'La solicitud del 12 de mayo esta lista para confirmar.',
        ja: '5月12日の予約リクエストは確認待ちです。',
      }),
      createMessage('tj-2', 'ravi', '15:41', 'read', {
        en: 'Can we check in after 21:00? Our train arrives late.',
        es: 'Podemos registrarnos despues de las 21:00? Nuestro tren llega tarde.',
        ja: '21:00以降にチェックインできますか? 電車が遅く到着します。',
      }),
      createMessage('tj-3', 'lena', '15:44', 'sent', {
        en: 'Yes, the smart lock code will arrive two hours before check-in.',
        es: 'Si, el codigo de la cerradura llegara dos horas antes.',
        ja: 'はい、スマートロックのコードはチェックイン2時間前に届きます。',
      }),
    ],
  },
  {
    id: 'chatscope-community',
    name: 'ChatScope Community Room',
    packageName: '@chatscope/chat-ui-kit-react',
    marketPosition: 'Open-source React chat component kit',
    sourceUrls: [
      'https://chatscope.io/storybook/react/',
      'https://www.npmjs.com/package/@chatscope/chat-ui-kit-react',
    ],
    maintenance: {
      githubUrl: 'https://github.com/chatscope/chat-ui-kit-react',
      license: 'MIT',
      latestVersion: '2.1.1',
      lastReleaseAt: '2025-05-15',
      stars: 1745,
    },
    integration: createIntegration({
      rendererId: 'chatscope',
      mode: 'Live local package',
      status:
        'Rendered in this gallery through @chatscope/chat-ui-kit-react with fixture messages and the shared working composer.',
      packageImport:
        "import { MainContainer, ChatContainer, MessageList, Message } from '@chatscope/chat-ui-kit-react';",
      sourceCode: chatDemoSources.chatscopeCommunity,
    }),
    accent: '#2f855a',
    background: '#e8f5ed',
    avatar: 'CS',
    audience: 'Teams that want composable open-source chat primitives.',
    featureHighlights: [
      'Conversation list',
      'Message list',
      'Typing indicator',
      'Avatar primitives',
      'Composer controls',
    ],
    configurableSurfaces: [
      'Component composition',
      'CSS variables',
      'Layout primitives',
      'Message model',
    ],
    designRecommendations: [
      'Use the kit for primitives, then own the domain-specific state model.',
      'Keep token naming close to the product design system.',
      'Add accessibility tests around every custom composer action.',
    ],
    participants: [
      { id: 'elena', name: 'Elena Petrova', role: 'Maintainer' },
      { id: 'jules', name: 'Jules Martin', role: 'Contributor' },
      { id: 'mina', name: 'Mina Tan', role: 'Reviewer' },
    ],
    messages: [
      createMessage('cs-1', 'jules', '17:03', 'read', {
        en: 'The message list stays stable when Japanese text wraps.',
        es: 'La lista de mensajes permanece estable cuando el japones salta de linea.',
        ja: '日本語テキストが折り返されてもメッセージ一覧は安定しています。',
      }),
      createMessage('cs-2', 'mina', '17:06', 'read', {
        en: 'Good. Please add a high contrast snapshot before merge.',
        es: 'Bien. Agrega una captura de alto contraste antes de fusionar.',
        ja: '良いです。マージ前に高コントラストのスナップショットを追加してください。',
      }),
      createMessage('cs-3', 'elena', '17:08', 'sent', {
        en: 'Done. The screenshot is generated by the browser-commander test.',
        es: 'Listo. La captura la genera la prueba con browser-commander.',
        ja: '完了です。スクリーンショットはbrowser-commanderテストで生成します。',
      }),
    ],
  },
  {
    id: 'react-chat-elements',
    name: 'React Chat Elements',
    packageName: 'react-chat-elements',
    marketPosition: 'Open-source component set for common chat building blocks',
    sourceUrls: [
      'https://detaysoft.github.io/docs-react-chat-elements/',
      'https://www.npmjs.com/package/react-chat-elements',
    ],
    maintenance: {
      githubUrl: 'https://github.com/Detaysoft/react-chat-elements',
      license: 'MIT',
      latestVersion: '12.0.18',
      lastReleaseAt: '2025-03-18',
      stars: 1387,
    },
    integration: createIntegration({
      rendererId: 'react-chat-elements',
      mode: 'Live local package',
      status:
        'Rendered in this gallery through react-chat-elements using real MessageList dataSource props.',
      packageImport: "import { MessageList } from 'react-chat-elements';",
      sourceCode: chatDemoSources.reactChatElements,
    }),
    accent: '#805ad5',
    background: '#f1eafe',
    avatar: 'RCE',
    audience:
      'Teams that need lightweight chat widgets and message primitives.',
    featureHighlights: [
      'Message boxes',
      'Chat list',
      'Input controls',
      'Avatar states',
      'Popup widgets',
    ],
    configurableSurfaces: [
      'Message props',
      'Input behavior',
      'Avatar content',
      'Container layout',
    ],
    designRecommendations: [
      'Use the primitives when the product already owns data and routing.',
      'Pair lightweight widgets with strict spacing and typography tokens.',
      'Add your own accessibility checks for any custom input composition.',
    ],
    participants: [
      { id: 'noah', name: 'Noah Wright', role: 'PM' },
      { id: 'sara', name: 'Sara Kim', role: 'Frontend' },
      { id: 'li', name: 'Li Wei', role: 'QA' },
    ],
    messages: [
      createMessage('rce-1', 'noah', '19:10', 'read', {
        en: 'Can this widget sit inside the account details drawer?',
        es: 'Este widget puede vivir dentro del panel de cuenta?',
        ja: 'このウィジェットをアカウント詳細ドロワー内に置けますか?',
      }),
      createMessage('rce-2', 'sara', '19:12', 'read', {
        en: 'Yes. The primitives are small enough for the drawer layout.',
        es: 'Si. Los componentes son suficientemente pequenos para el panel.',
        ja: 'はい。プリミティブはドロワーレイアウトに十分小さいです。',
      }),
      createMessage('rce-3', 'li', '19:14', 'sent', {
        en: 'I verified wrapping for Arabic, Japanese, and emoji ✅.',
        es: 'Verifique ajuste de linea para arabe, japones y emoji ✅.',
        ja: 'アラビア語、日本語、絵文字✅の折り返しを確認しました。',
      }),
    ],
  },
  {
    id: 'deep-chat-ai',
    name: 'Deep Chat AI Widget',
    packageName: 'deep-chat-react',
    marketPosition: 'React wrapper for a configurable AI chat web component',
    sourceUrls: [
      'https://deepchat.dev/docs/installation/',
      'https://www.npmjs.com/package/deep-chat-react',
    ],
    maintenance: {
      githubUrl: 'https://github.com/OvidijusParsiunas/deep-chat',
      license: 'MIT',
      latestVersion: '2.4.2',
      lastReleaseAt: '2026-01-31',
      stars: 3601,
    },
    integration: createIntegration({
      rendererId: 'deep-chat',
      mode: 'Live local package',
      status:
        'Rendered in this gallery through deep-chat-react with static history and the shared working composer.',
      packageImport: "import { DeepChat } from 'deep-chat-react';",
      sourceCode: chatDemoSources.deepChatAi,
    }),
    accent: '#d53f8c',
    background: '#fdebf5',
    avatar: 'DC',
    audience: 'Teams adding AI chat widgets across several model providers.',
    featureHighlights: [
      'AI provider hooks',
      'File uploads',
      'Speech options',
      'HTML messages',
      'Programmatic methods',
    ],
    configurableSurfaces: [
      'Connection adapter',
      'Message styles',
      'Intro panel',
      'Direct methods',
    ],
    designRecommendations: [
      'Treat model and transport settings as configuration, not UI copy.',
      'Make multimodal affordances explicit without crowding the composer.',
      'Log prompt and response strings through Unicode-safe persistence.',
    ],
    participants: [
      { id: 'ren', name: 'Ren Brooks', role: 'User' },
      { id: 'deep', name: 'Deep Chat', role: 'Assistant' },
      { id: 'files', name: 'File Tool', role: 'Tool' },
    ],
    messages: [
      createMessage('dc-1', 'ren', '20:05', 'read', {
        en: 'Draft a concise reply using the uploaded invoice image.',
        es: 'Redacta una respuesta breve usando la imagen de factura.',
        ja: 'アップロードした請求書画像を使って短い返信を書いてください。',
      }),
      createMessage('dc-2', 'files', '20:06', 'read', {
        en: 'Parsed totals and customer name from the attachment.',
        es: 'Se extrajeron totales y nombre del cliente del adjunto.',
        ja: '添付から合計金額と顧客名を解析しました。',
      }),
      createMessage('dc-3', 'deep', '20:07', 'sent', {
        en: 'Reply ready. It preserves "東京", "Munchen", and totals exactly.',
        es: 'Respuesta lista. Conserva "東京", "Munchen" y totales exactamente.',
        ja: '返信準備完了。"東京"、"Munchen"、合計を正確に保持します。',
      }),
    ],
  },
  {
    id: 'assistant-copilot',
    name: 'assistant-ui Copilot',
    packageName: '@assistant-ui/react',
    marketPosition: 'AI assistant conversation components for React',
    sourceUrls: [
      'https://www.assistant-ui.com/docs',
      'https://www.npmjs.com/package/@assistant-ui/react',
    ],
    maintenance: {
      githubUrl: 'https://github.com/assistant-ui/assistant-ui',
      license: 'MIT',
      latestVersion: '0.14.0',
      lastReleaseAt: '2026-05-07',
      stars: 9968,
    },
    integration: createIntegration({
      rendererId: 'runtime-gated',
      mode: 'Runtime adapter source',
      status:
        'Requires an assistant-ui runtime adapter; the source block shows the real provider and thread primitives for runtime trials.',
      packageImport:
        "import { AssistantRuntimeProvider, ThreadPrimitive } from '@assistant-ui/react';",
      sourceCode: chatDemoSources.assistantCopilot,
    }),
    accent: '#b7791f',
    background: '#fff7df',
    avatar: 'AI',
    audience: 'Apps embedding AI copilots with streamed responses.',
    featureHighlights: [
      'Thread primitives',
      'Tool calls',
      'Composer state',
      'Markdown-ready output',
      'Runtime adapters',
    ],
    configurableSurfaces: [
      'Runtime provider',
      'Thread renderer',
      'Composer actions',
      'Tool result cards',
    ],
    designRecommendations: [
      'Keep tool execution cards compact and inspectable.',
      'Differentiate generated answers from user-authored messages.',
      'Persist prompts and outputs through the same Unicode-safe store.',
    ],
    participants: [
      { id: 'pat', name: 'Pat Rivera', role: 'Operator' },
      { id: 'copilot', name: 'Copilot', role: 'Assistant' },
      { id: 'data', name: 'Data Tool', role: 'Tool' },
    ],
    messages: [
      createMessage('ai-1', 'pat', '18:30', 'read', {
        en: 'Summarize unread launch risks in two bullets.',
        es: 'Resume los riesgos no leidos del lanzamiento en dos puntos.',
        ja: '未読のローンチリスクを2つの箇条書きで要約してください。',
      }),
      createMessage('ai-2', 'data', '18:31', 'read', {
        en: 'Tool result: 3 open UI review tasks and 1 pending CI screenshot.',
        es: 'Resultado: 3 tareas de revision UI y 1 captura de CI pendiente.',
        ja: 'ツール結果: UIレビュー3件、CIスクリーンショット1件が保留中です。',
      }),
      createMessage('ai-3', 'copilot', '18:32', 'sent', {
        en: 'Main risks: visual regression coverage and post-deploy page checks.',
        es: 'Riesgos principales: cobertura visual y chequeos post-despliegue.',
        ja: '主なリスク: ビジュアル回帰の網羅性とデプロイ後ページ確認です。',
      }),
    ],
  },
];

export function getLanguageOption(languageId = 'en') {
  return (
    languageOptions.find((language) => language.id === languageId) ??
    languageOptions[0]
  );
}

export function getThemeOption(themeId = 'light') {
  return themeOptions.find((theme) => theme.id === themeId) ?? themeOptions[0];
}

export function getChatDemoById(demoId = chatDemoCatalog[0].id) {
  return (
    chatDemoCatalog.find((demo) => demo.id === demoId) ?? chatDemoCatalog[0]
  );
}

export function getLocalizedText(localizedText, languageId = 'en') {
  return localizedText[languageId] ?? localizedText.en;
}

export function listChatDemoSummaries() {
  return chatDemoCatalog.map((demo) => ({
    id: demo.id,
    name: demo.name,
    packageName: demo.packageName,
    marketPosition: demo.marketPosition,
    audience: demo.audience,
    integrationMode: demo.integration.mode,
    integrationStatus: demo.integration.status,
    accent: demo.accent,
    avatar: demo.avatar,
  }));
}

export function getRequirementCoverage() {
  return [
    {
      requirement: 'Use real imports for React chat libraries where practical',
      implementation:
        'Live local adapters import ChatScope, React Chat Elements, and Deep Chat; hosted SDK source is shown with credential requirements.',
    },
    {
      requirement: 'Make the input composer work and support markdown text',
      implementation:
        'docs/chat-demos keeps per-demo composed messages and renders markdown through react-markdown.',
    },
    {
      requirement: 'Keep theme and language switchers available by default',
      implementation: 'themeOptions and languageOptions drive every snapshot.',
    },
    {
      requirement: 'Show comparison metadata for every library',
      implementation:
        'Each catalog entry includes package version, license, GitHub stars, release date, source code, and code cost.',
    },
    {
      requirement: 'Use fake data store with Unicode string storage',
      implementation:
        'createChatDemoStore stores localized messages as code points.',
    },
    {
      requirement: 'Document research and solution planning for issue 3',
      implementation: 'docs/case-studies/issue-3 captures data and analysis.',
    },
    {
      requirement: 'Cover input and demos with browser tests and screenshots',
      implementation:
        'npm run test:e2e exercises every demo, sends a message, and writes a screenshot.',
    },
  ];
}
