// Mock cache implementation when Redis is not available
module.exports = () => {
    console.log('Redis not available using mock cache (no persistence)');

    const mockCache = {};

    return {
        search: {
            createIndex: async () => { return true; },
            find: async () => { return { count: 0, docs: [], time: '0ms' }; }
        },
        hyperlog: {
            add: async () => { return true; },
            count: async () => { return 0; },
            merge: async () => { return 0; }
        },
        hash: {
            set: async ({ key, data }) => { mockCache[key] = data; return true; },
            remove: async () => { return true; },
            incrby: async () => { return 1; },
            get: async ({ key }) => { return mockCache[key] || {}; },
            setField: async ({ key, fieldKey, data }) => {
                if (!mockCache[key]) mockCache[key] = {};
                mockCache[key][fieldKey] = data;
                return true;
            },
            getField: async ({ key, fieldKey }) => {
                return mockCache[key] ? mockCache[key][fieldKey] : null;
            },
            getFields: async ({ key, fields }) => {
                const result = {};
                fields.forEach(f => result[f] = mockCache[key] ? mockCache[key][f] : null);
                return result;
            }
        },
        key: {
            expire: async () => { return true; },
            exists: async ({ key }) => { return !!mockCache[key]; },
            delete: async ({ key }) => { delete mockCache[key]; return true; },
            set: async ({ key, data }) => { mockCache[key] = data; return true; },
            get: async ({ key }) => { return mockCache[key] || ''; }
        },
        set: {
            add: async ({ key, arr }) => {
                if (!mockCache[key]) mockCache[key] = new Set();
                arr.forEach(item => mockCache[key].add(item));
                return arr.length;
            },
            remove: async ({ key, arr }) => {
                if (!mockCache[key]) return 0;
                arr.forEach(item => mockCache[key].delete(item));
                return arr.length;
            },
            get: async ({ key }) => {
                return mockCache[key] ? Array.from(mockCache[key]) : [];
            }
        },
        sorted: {
            get: async () => { return []; },
            update: async () => { return true; },
            addIfNotExists: async () => { return true; },
            set: async () => { return true; },
            incrBy: async () => { return true; },
            remove: async () => { return true; },
            getRandom: async () => { return []; }
        }
    };
};
