import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// 1. Point to the build folder (where Vue's index.html lives)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Example API route
app.get('/api/cards', (req, res) => {
    res.json([
        { id: 1, title: 'Info', icon: 'user' },
        { id: 2, title: 'Work', icon: 'briefcase' },
        { id: 3, title: 'Play', icon: 'gamepad' },
        { id: 4, title: 'Solution', icon: 'lightbulb' }
    ]);
});

// 2. Catch-all: If user refreshes or visits any page, serve index.html (SPA History Mode)
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

