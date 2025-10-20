const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const COLLECTION_ID = '68e59af8f6869eeb19ac0731';
const WEBFLOW_TOKEN = '75be07dd8bc36754d2df5befb45ec6e7a8d306f054afcb9653e20c4b103f3dd0';

app.post('/save-to-webflow', async (req, res) => {
    const rows = req.body.rows;
    if (!rows || !Array.isArray(rows) || !rows.length) {
        return res.status(400).json({ error: 'No data provided' });
    }

    try {
        const results = [];
        for (const row of rows) {
            const payload = {
                fields: {
                    name: row.name,
                    'id-number': row.idNumber,
                    'court-place': row.courtPlace,
                    'court-type': row.courtType,
                    'court-date': row.courtDate,
                    _archived: false,
                    _draft: false
                }
            };

            const response = await fetch(`https://api.webflow.com/collections/${COLLECTION_ID}/items`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${WEBFLOW_TOKEN}`,
                    'accept-version': '1.0.0',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            results.push(data);
        }

        res.json({ success: true, results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error connecting to Webflow API' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
