import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Example API route
app.get('/api/cards', (req, res) => {
    res.json([
        { id: 1, title: 'Info', icon: 'user' },
        { id: 2, title: 'Work', icon: 'briefcase' },
        { id: 3, title: 'Play', icon: 'gamepad' },
        { id: 4, title: 'Solution', icon: 'lightbulb' }
    ]);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
