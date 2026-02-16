const app = require('../../index');

describe('Sanity Check', () => {
    it('should load the app successfully', () => {
        expect(app).toBeDefined();
    });
});
