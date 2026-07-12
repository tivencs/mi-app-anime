import express from 'express';
import api from './dist/index.mjs';

const app = express();
const PORT = 3000;

// Permitir que tu index.html se conecte sin bloqueos de seguridad
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Ruta para buscar
app.get('/api/search', async (req, res) => {
    try {
        const result = await api.search(req.query.q);
        res.json(result ? result.animes : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ruta para capítulos
// Ruta para obtener la info real y cantidad de capítulos
app.get('/api/chapters', async (req, res) => {
    try {
        const result = await api.getExtraInfo(req.query.slug);
        
        // JKAnime guarda la lista de episodios dentro del objeto extra
        // Si no se encuentra, usamos un número base de 12 por seguridad
        const totalEpisodios = result && result.extra && result.extra.episodes 
            ? parseInt(result.extra.episodes) 
            : 12;

        res.json({ total: totalEpisodios });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Ruta para videos
app.get('/api/servers', async (req, res) => {
    try {
        const result = await api.getAnimeServers(req.query.slug, req.query.cap);
        res.json(result || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor de Anime corriendo en http://localhost:${PORT}`);
});