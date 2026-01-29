import { Router } from "express"
import { fuzzyMatchInputToPartNum } from "../utility/fuzzymatch"
const router = Router();

router.get('/fuzzymatchpartnumbers', async (req, res) => {
    try {
        const partnum = req.query.MPN as string;

        if (!partnum) {
            return res.status(400).json({ error: 'MPN query parameter is required' });
        }

        const result = await fuzzyMatchInputToPartNum(partnum);
        res.json(result);
    } catch (error: any) {
        console.error('Error fuzzy matching:', error.message);
        res.status(500).json({ error: error.message });
    }
});

export default router;
