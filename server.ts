import express from "express";
import { createServer as createViteServer } from "vite";
import { searchImages, SafeSearchType } from "duck-duck-scrape";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/search-image", async (req, res) => {
    const q = req.query.q as string;
    if (!q) {
      return res.status(400).json({ error: "Missing query" });
    }
    try {
      const searchResults = await searchImages(q, { safeSearch: SafeSearchType.STRICT });
      res.json(searchResults);
    } catch (error: any) {
      // Instead of failing with 500, we just return an empty array
      // so DuckDuckGo rate limiting doesn't crash the user's experience
      // or spam their console heavily.
      res.json({ results: [] });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express 4.x we use *
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
