"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fuzzyMatchInputToPartNum = fuzzyMatchInputToPartNum;
const fuzzball_1 = __importDefault(require("fuzzball"));
const fishbowl_service_1 = require("../services/fishbowl.service");
async function fuzzyMatchInputToPartNum(input) {
    const inputnormalized = input.toUpperCase();
    const fbs = fishbowl_service_1.FishbowlService.getInstance();
    const partnums = await fbs.getAllActivePartNums();
    let res = [];
    for (const partnum of partnums) {
        const score = fuzzball_1.default.ratio(inputnormalized, partnum);
        res.push([score, partnum]);
    }
    res.sort((a, b) => b[0] - a[0]);
    const top5 = res.slice(0, 5);
    console.log(top5);
    return top5;
}
//# sourceMappingURL=fuzzymatch.js.map