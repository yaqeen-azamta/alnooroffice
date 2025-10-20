import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch"; // استدعاء fetch يدوياً
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const WEBFLOW_API_URL = "https://api.webflow.com/v2/collections/68e59af8f6869eeb19ac0731/items";
const WEBFLOW_TOKEN = process.env.WEBFLOW_TOKEN;

app.post("/save-to-webflow", async (req, res) => {
    try {
        const records = req.body;

        if (!Array.isArray(records)) {
            return res.status(400).json({ error: "Invalid data format" });
        }

        const results = [];

        for (const record of records) {
            const response = await fetch(WEBFLOW_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${WEBFLOW_TOKEN}`,
                },
                body: JSON.stringify({
                    isArchived: false,
                    isDraft: false,
                    fields: {
                        name: record.name || "No Name",
                        "id-number": record.idNumber,
                        "court-place": record.courtPlace,
                        "court-type": record.courtType,
                        "court-date": record.courtDate,
                        slug: `${record.idNumber}-${Date.now()}` // slug فريد
                    },
                }),
            });

            const data = await response.json();
            results.push(data);
        }

        res.json({ success: true, results });

    } catch (error) {
        console.error("Error saving to Webflow:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
