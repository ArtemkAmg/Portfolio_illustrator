const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const root = __dirname;
const dataDir = path.join(root, 'data');
const uploadsDir = path.join(root, 'uploads');
const dbPath = path.join(dataDir, 'works.json');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(root, { index: 'index.html' }));
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype))
});
const readWorks = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const writeWorks = works => fs.writeFileSync(dbPath, JSON.stringify(works, null, 2));

app.get('/admin', (_req, res) => res.sendFile(path.join(root, 'admin.html')));
app.get('/api/works', (_req, res) => res.json(readWorks()));
app.post('/api/works', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Завантаж JPG, PNG, WEBP або GIF до 8 МБ.' });
  const title = (req.body.title || '').trim();
  const category = req.body.category;
  const labels = { portrait: 'Portrait', illustration: 'Illustration', character: 'Character' };
  if (!title || title.length > 80 || !labels[category]) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Вкажи назву до 80 символів і категорію.' });
  }
  const works = readWorks();
  const work = { id: crypto.randomUUID(), title, category, description: labels[category], image: `/uploads/${req.file.filename}` };
  works.unshift(work);
  writeWorks(works);
  res.status(201).json(work);
});
app.delete('/api/works/:id', (req, res) => {
  const works = readWorks();
  const work = works.find(item => item.id === req.params.id);
  if (!work) return res.status(404).json({ error: 'Роботу не знайдено.' });
  writeWorks(works.filter(item => item.id !== req.params.id));
  if (work.image.startsWith('/uploads/')) fs.rmSync(path.join(uploadsDir, path.basename(work.image)), { force: true });
  res.status(204).end();
});
app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err instanceof multer.MulterError ? 'Файл завеликий (максимум 8 МБ).' : 'Не вдалося завантажити файл. Спробуй JPG, PNG, WEBP або GIF.' });
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Portfolio running at http://localhost:${port}`));
