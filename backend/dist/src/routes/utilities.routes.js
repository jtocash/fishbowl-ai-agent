"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fuzzymatch_1 = require("../utility/fuzzymatch");
const router = (0, express_1.Router)();
router.get('/fuzzymatchpartnumbers', async (req, res) => {
    try {
        const partnum = req.query.MPN;
        if (!partnum) {
            return res.status(400).json({ error: 'MPN query parameter is required' });
        }
        const result = await (0, fuzzymatch_1.fuzzyMatchInputToPartNum)(partnum);
        res.json(result);
    }
    catch (error) {
        console.error('Error fuzzy matching:', error.message);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=utilities.routes.js.map