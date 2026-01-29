"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffleObject = shuffleObject;
function shuffleObject(obj) {
    const entries = Object.entries(obj);
    for (let i = entries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [entries[i], entries[j]] = [entries[j], entries[i]];
    }
    return Object.fromEntries(entries);
}
//# sourceMappingURL=scramblejson.js.map