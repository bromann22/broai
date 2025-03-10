process.noDeprecation = true;

const express = require("express");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

const app = express();
const CONFIG_FILE = "config.json";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Fungsi untuk memuat API Key
const loadApiKey = () => {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
            return config.apiKey || null;
        }
    } catch (err) {
        console.error("Error loading config:", err);
    }
    return null;
};

// Fungsi untuk menyimpan API Key
const saveApiKey = (apiKey) => {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ apiKey }, null, 2));
};

// Endpoint untuk generate konten
app.post("/api/generate", async (req, res) => {
    const prompt = req.body.prompt || "Write a story about a magical bag.";
    const apiKey = loadApiKey();

    if (!apiKey) {
        return res.status(400).json({ error: "API Key not found!" });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const generatedText = data.candidates[0].content.parts[0].text;
            res.json({ response: generatedText });
        } else {
            res.status(400).json({ error: "No results found." });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server error occurred." });
    }
});

// Endpoint untuk mengakses index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Fungsi untuk memulai server
const initializeServer = async () => {
    console.clear();
    let apiKey = loadApiKey();

    if (!apiKey) {
        console.log("\nAPI Key not found!\nPlease configure your API Key in config.json");
        return; // Keluar jika API Key belum ada
    }

    app.listen(3000, () => {
        console.log("=======================================");
        console.log("            Broo AI TOOLS            ");
        console.log("=======================================");
        console.log("Server is running at: http://localhost:3000");
        console.log("Use this tool to generate AI content.\n");
    });
};

initializeServer();
