const { owner, repo, branch = 'main' } = window.PORTFOLIO_GITHUB || {};
const loginPanel = document.querySelector('#login-panel');
const adminPanel = document.querySelector('#admin-panel');
const loginForm = document.querySelector('#login-form');
const loginMessage = document.querySelector('#login-message');
let token = '';

function showError(element, message) {
  element.style.color = '#bd577c';
  element.textContent = message;
}

function contentsUrl(path, includeRef = false) {
  const safePath = path.split('/').map(encodeURIComponent).join('/');
  return `https://api.github.com/repos/${owner}/${repo}/contents/${safePath}${includeRef ? `?ref=${encodeURIComponent(branch)}` : ''}`;
}

async function github(path, method = 'GET', payload) {
  const response = await fetch(contentsUrl(path, method === 'GET'), {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(payload ? { 'Content-Type': 'application/json' } : {})
    },
    ...(payload ? { body: JSON.stringify(payload) } : {})
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || `GitHub API повернув помилку ${response.status}.`);
  return result;
}

function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

function fromBase64(text) {
  const binary = atob(text.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function readWorks() {
  const file = await github('works.json');
  return { works: JSON.parse(fromBase64(file.content)), sha: file.sha };
}

async function writeWorks(works, sha, message) {
  return github('works.json', 'PUT', {
    message,
    content: toBase64(`${JSON.stringify(works, null, 2)}\n`),
    sha,
    branch
  });
}

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  loginMessage.textContent = '';
  const button = loginForm.querySelector('button');
  button.disabled = true;
  token = new FormData(loginForm).get('token').trim();
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' }
    });
    if (!response.ok) throw new Error('GitHub не прийняв токен. Перевір токен і його права.');
    const user = await response.json();
    await readWorks();
    loginPanel.hidden = true;
    adminPanel.hidden = false;
    document.querySelector('#signed-in').textContent = `Увійшов як ${user.login}`;
    loginForm.reset();
    await loadWorks();
  } catch (error) {
    token = '';
    showError(loginMessage, error.message);
  } finally {
    button.disabled = false;
  }
});

document.querySelector('#sign-out').addEventListener('click', () => {
  token = '';
  adminPanel.hidden = true;
  loginPanel.hidden = false;
});

const fileInput = document.querySelector('#image');
const preview = document.querySelector('#preview');
const fileLabel = document.querySelector('#file-label');
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
  fileLabel.textContent = file.name;
});

async function loadWorks() {
  const { works } = await readWorks();
  const host = document.querySelector('#works');
  host.replaceChildren();
  document.querySelector('#count').textContent = `${works.length} робіт`;
  for (const work of works) {
    const row = document.createElement('article');
    row.className = 'work';
    const img = document.createElement('img');
    img.src = new URL(work.image, document.baseURI).href;
    img.alt = '';
    const info = document.createElement('div');
    info.className = 'work-info';
    const title = document.createElement('strong');
    title.textContent = work.title;
    const category = document.createElement('small');
    category.textContent = ({ portrait: 'Портрети', illustration: 'Ілюстрації', character: 'Персонажі' })[work.category];
    info.append(title, category);
    const remove = document.createElement('button');
    remove.className = 'delete';
    remove.textContent = 'Видалити';
    remove.addEventListener('click', () => deleteWork(work));
    row.append(img, info, remove);
    host.append(row);
  }
}

async function uploadImage(file, path) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  await github(path, 'PUT', { message: `Add portfolio image ${path.split('/').pop()}`, content: btoa(binary), branch });
}

async function deleteWork(work) {
  if (!confirm(`Видалити «${work.title}»?`)) return;
  const message = document.querySelector('#form-message');
  try {
    const { works, sha } = await readWorks();
    await writeWorks(works.filter(item => item.id !== work.id), sha, `Remove portfolio work: ${work.title}`);
    const image = await github(work.image);
    await github(work.image, 'DELETE', { message: `Remove portfolio image ${work.image.split('/').pop()}`, sha: image.sha, branch });
    message.textContent = 'Роботу видалено. GitHub Pages оновить сайт за кілька хвилин.';
    await loadWorks();
  } catch (error) {
    showError(message, error.message);
  }
}

document.querySelector('#work-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const message = document.querySelector('#form-message');
  message.textContent = '';
  button.disabled = true;
  try {
    const file = fileInput.files[0];
    const title = form.elements.title.value.trim();
    const category = form.elements.category.value;
    if (!file || file.size > 8 * 1024 * 1024) throw new Error('Вибери зображення розміром до 8 МБ.');
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) throw new Error('Формат має бути JPG, PNG, WEBP або GIF.');
    const extension = file.name.split('.').pop().toLowerCase();
    const image = `images/works/${crypto.randomUUID()}.${extension}`;
    await uploadImage(file, image);
    const { works, sha } = await readWorks();
    const descriptions = { portrait: 'Digital Portrait', illustration: 'Digital Illustration', character: 'Character' };
    works.unshift({ id: crypto.randomUUID(), title, category, description: descriptions[category], image });
    await writeWorks(works, sha, `Add portfolio work: ${title}`);
    form.reset();
    preview.hidden = true;
    fileLabel.textContent = 'Завантаж зображення';
    message.textContent = 'Роботу додано. GitHub Pages опублікує її за кілька хвилин.';
    await loadWorks();
  } catch (error) {
    showError(message, `Не вдалося зберегти роботу: ${error.message}`);
  } finally {
    button.disabled = false;
  }
});
