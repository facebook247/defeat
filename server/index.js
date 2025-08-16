"use strict";

const express = require("express");
const cors = require("cors");
const path = require("node:path");
const fs = require("node:fs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let messages = [{ id: 1, text: "Hello from the server" }];

app.get("/api/health", (req, res) => {
	res.json({ status: "ok", uptimeSeconds: Math.round(process.uptime()), timestamp: new Date().toISOString() });
});

app.get("/api/messages", (req, res) => {
	res.json({ messages });
});

app.post("/api/messages", (req, res) => {
	const { text } = req.body || {};
	if (typeof text !== "string" || text.trim().length === 0) {
		return res.status(400).json({ error: "Field 'text' is required" });
	}
	const nextId = messages.length > 0 ? messages[messages.length - 1].id + 1 : 1;
	const message = { id: nextId, text: text.trim() };
	messages.push(message);
	return res.status(201).json({ message });
});

app.post("/api/echo", (req, res) => {
	res.json({ received: req.body });
});

const distPath = path.join(__dirname, "..", "client", "dist");
const indexHtmlPath = path.join(distPath, "index.html");
if (fs.existsSync(indexHtmlPath)) {
	app.use(express.static(distPath));
	app.get(/.*/, (req, res) => {
		res.sendFile(indexHtmlPath);
	});
}

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});