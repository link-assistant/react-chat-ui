export interface ThemeOption {
  id: string;
  label: string;
  description: string;
}

export interface LanguageOption {
  id: string;
  label: string;
  shortLabel: string;
  strings: Record<string, string>;
}

export interface ChatParticipant {
  id: string;
  name: string;
  role: string;
}

export interface ChatMessage {
  id: string;
  authorId: string;
  sentAt: string;
  status: string;
  text: Record<string, string>;
}

export interface ChatDemo {
  id: string;
  name: string;
  packageName: string;
  marketPosition: string;
  sourceUrls: string[];
  accent: string;
  background: string;
  avatar: string;
  audience: string;
  featureHighlights: string[];
  configurableSurfaces: string[];
  designRecommendations: string[];
  participants: ChatParticipant[];
  messages: ChatMessage[];
}

export interface StoredChatMessage {
  id: string;
  authorId: string;
  sentAt: string;
  status: string;
  text: string;
  storageId: number;
  codePointCount: number;
}

export interface ChatDemoSnapshot extends Omit<
  ChatDemo,
  'messages' | 'participants'
> {
  participants: ChatParticipant[];
  messages: StoredChatMessage[];
  language: LanguageOption;
  theme: ThemeOption;
  storage: DoubletsStoreStats;
}

export interface DoubletsStoreStats {
  backend: string;
  storedStrings: number;
  storedCodePoints: number;
  linkCount: number;
}

export interface DoubletsUnicodeRecord {
  id: number;
  value: string;
  codePoints: number[];
  codePointLinks: number[];
  metadata: Record<string, string>;
}

export interface DoubletsUnicodeStore {
  backend: string;
  engine: object;
  storeString(value: string, metadata?: Record<string, string>): number;
  readString(id: number): string;
  getRecord(id: number): DoubletsUnicodeRecord;
  listRecords(): DoubletsUnicodeRecord[];
  getStats(): DoubletsStoreStats;
}

export const chatDemoCatalog: ChatDemo[];
export const languageOptions: LanguageOption[];
export const themeOptions: ThemeOption[];

export function getChatDemoById(demoId?: string): ChatDemo;
export function getLanguageOption(languageId?: string): LanguageOption;
export function getLocalizedText(
  localizedText: Record<string, string>,
  languageId?: string
): string;
export function getRequirementCoverage(): {
  requirement: string;
  implementation: string;
}[];
export function getThemeOption(themeId?: string): ThemeOption;
export function listChatDemoSummaries(): Omit<
  ChatDemo,
  | 'sourceUrls'
  | 'featureHighlights'
  | 'configurableSurfaces'
  | 'designRecommendations'
  | 'participants'
  | 'messages'
>[];

export function createInMemoryDoubletsEngine(): object;
export function createDoubletsUnicodeStore(options?: {
  engine?: object;
  backend?: string;
}): DoubletsUnicodeStore;
export function createDoubletsWebUnicodeStore(options?: {
  importer?: () => Promise<object>;
  allowFallback?: boolean;
}): Promise<DoubletsUnicodeStore & { warning?: string }>;
export function decodeUnicodeString(codePoints: number[]): string;
export function encodeUnicodeString(value: string): number[];
export function createChatDemoStore(options?: {
  unicodeStore?: DoubletsUnicodeStore;
}): {
  listDemos(): ReturnType<typeof listChatDemoSummaries>;
  getDemoSnapshot(options?: {
    demoId?: string;
    languageId?: string;
    themeId?: string;
  }): ChatDemoSnapshot;
  getStorageStats(): DoubletsStoreStats;
  unicodeStore: DoubletsUnicodeStore;
};
