import { describe, it, expect } from 'test-anywhere';
import {
  createDoubletsUnicodeStore,
  createDoubletsWebUnicodeStore,
  createInMemoryDoubletsEngine,
  decodeUnicodeString,
  encodeUnicodeString,
} from '../src/index.js';

describe('doublets unicode string storage', () => {
  it('round trips multilingual strings as Unicode code points', () => {
    const value = 'Привет こんにちは ✅';
    const codePoints = encodeUnicodeString(value);

    expect(codePoints.includes(0x2705)).toBe(true);
    expect(decodeUnicodeString(codePoints)).toBe(value);
  });

  it('writes an ordered link chain into the in-memory doublets engine', () => {
    const engine = createInMemoryDoubletsEngine();
    const store = createDoubletsUnicodeStore({ engine });
    const id = store.storeString('A✅B', { purpose: 'test' });
    const record = store.getRecord(id);

    expect(record.codePoints.length).toBe(3);
    expect(record.codePointLinks.length).toBe(3);
    expect(engine.count()).toBe(4);
    expect(store.readString(id)).toBe('A✅B');
  });

  it('can construct a store from a doublets-web compatible module', async () => {
    class LinksConstants {
      constructor() {
        this.any = 0;
      }
    }

    class UnitedLinks {
      constructor(constants) {
        this.constants = constants;
        this.links = [];
      }

      create() {
        const id = this.links.length + 1;
        this.links.push({ id, from_id: 0, to_id: 0 });
        return id;
      }

      update(id, from_id, to_id) {
        this.links[id - 1] = { id, from_id, to_id };
        return id;
      }

      count() {
        return this.links.length;
      }
    }

    const store = await createDoubletsWebUnicodeStore({
      importer: async () => ({ LinksConstants, UnitedLinks }),
      allowFallback: false,
    });
    const id = store.storeString('Sao Paulo ✅');

    expect(store.backend).toBe('doublets-web');
    expect(store.readString(id)).toBe('Sao Paulo ✅');
    expect(store.getStats().linkCount > 1).toBe(true);
  });
});
