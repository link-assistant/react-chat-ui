const ANY = 0;
const doubletsWebPackageName = 'doublets-web';

function matchesPart(queryValue, actualValue) {
  return queryValue === ANY || actualValue === queryValue;
}

function matchesQuery(link, query) {
  if (!query) {
    return true;
  }

  const id = query.id ?? query.index ?? query[0] ?? ANY;
  const fromId = query.from_id ?? query.source ?? query[1] ?? ANY;
  const toId = query.to_id ?? query.target ?? query[2] ?? ANY;

  return (
    matchesPart(id, link.id) &&
    matchesPart(fromId, link.from_id) &&
    matchesPart(toId, link.to_id)
  );
}

export function encodeUnicodeString(value) {
  if (typeof value !== 'string') {
    throw new TypeError('Unicode store accepts strings only.');
  }

  return Array.from(value, (character) => character.codePointAt(0));
}

export function decodeUnicodeString(codePoints) {
  return String.fromCodePoint(...codePoints);
}

export function createInMemoryDoubletsEngine() {
  let nextId = 1;
  const links = new Map();

  return {
    constants: { any: ANY },
    create() {
      const id = nextId;
      nextId += 1;
      links.set(id, { id, from_id: ANY, to_id: ANY });
      return id;
    },
    update(id, from_id, to_id) {
      links.set(id, { id, from_id, to_id });
      return id;
    },
    count(query = null) {
      return this.snapshot().filter((link) => matchesQuery(link, query)).length;
    },
    each(closure, query = null) {
      let count = 0;
      for (const link of this.snapshot()) {
        if (matchesQuery(link, query)) {
          closure(link);
          count += 1;
        }
      }
      return count;
    },
    snapshot() {
      return Array.from(links.values()).map((link) => ({ ...link }));
    },
  };
}

export function createDoubletsUnicodeStore(options = {}) {
  const engine = options.engine ?? createInMemoryDoubletsEngine();
  const backend = options.backend ?? 'in-memory-doublets';
  const records = new Map();

  function storeString(value, metadata = {}) {
    const codePoints = encodeUnicodeString(value);
    const rootLinkId = engine.create();
    let previousLinkId = rootLinkId;
    const codePointLinks = [];

    engine.update(rootLinkId, rootLinkId, rootLinkId);

    for (const codePoint of codePoints) {
      const linkId = engine.create();
      engine.update(linkId, previousLinkId, codePoint);
      codePointLinks.push(linkId);
      previousLinkId = linkId;
    }

    const record = {
      id: rootLinkId,
      value,
      codePoints,
      codePointLinks,
      metadata: { ...metadata },
    };
    records.set(rootLinkId, record);
    return rootLinkId;
  }

  function readString(id) {
    const record = records.get(id);
    if (!record) {
      throw new Error(`String record ${id} was not found.`);
    }
    return decodeUnicodeString(record.codePoints);
  }

  function getRecord(id) {
    const record = records.get(id);
    if (!record) {
      throw new Error(`String record ${id} was not found.`);
    }

    return {
      ...record,
      codePoints: [...record.codePoints],
      codePointLinks: [...record.codePointLinks],
      metadata: { ...record.metadata },
    };
  }

  function listRecords() {
    return Array.from(records.keys()).map((id) => getRecord(id));
  }

  function getStats() {
    const storedStrings = records.size;
    const storedCodePoints = listRecords().reduce(
      (total, record) => total + record.codePoints.length,
      0
    );
    const linkCount =
      typeof engine.count === 'function'
        ? engine.count()
        : storedStrings + storedCodePoints;

    return {
      backend,
      storedStrings,
      storedCodePoints,
      linkCount,
    };
  }

  return {
    backend,
    engine,
    storeString,
    readString,
    getRecord,
    listRecords,
    getStats,
  };
}

export async function createDoubletsWebUnicodeStore(options = {}) {
  const importer =
    options.importer ??
    (() => import(/* @vite-ignore */ doubletsWebPackageName));
  const allowFallback = options.allowFallback ?? true;

  try {
    const module = await importer();
    const constants = new module.LinksConstants();
    const engine = new module.UnitedLinks(constants);

    return createDoubletsUnicodeStore({
      engine,
      backend: 'doublets-web',
    });
  } catch (error) {
    if (!allowFallback) {
      throw error;
    }

    const store = createDoubletsUnicodeStore({
      backend: 'in-memory-doublets-fallback',
    });
    return {
      ...store,
      warning: error.message,
    };
  }
}
