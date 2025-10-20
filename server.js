// server.js
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// استخدم Environment Variables بدل القيم الثابتة
const COLLECTION_ID = process.env.COLLECTION_ID;
const WEBFLOW_TOKEN = process.env.WEBFLOW_TOKEN;

if (!COLLECTION_ID || !WEBFLOW_TOKEN) {
    console.error("ERROR: COLLECTION_ID or WEBFLOW_TOKEN is not set in environment variables!");
    process.exit(1);
}

app.post('/save-to-webflow', async (req, res) => {
    const rows = req.body.rows;
    if (!rows || !Array.isArray(rows) || !rows.length) {
        return res.status(400).json({ error: 'No data provided' });
    }

    try {
        const results = [];
        for (const row of rows) {
            // أهم شي: كل البيانات داخل fields
            const payload = {
                fields: {
                    name: row.name || row.Name, // تأكد من الاسم
                    'id-number': row['id-number'],
                    'court-place': row['court-place'],
                    'court-type': row['court-type'],
                    'court-date': row['court-date'],
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
