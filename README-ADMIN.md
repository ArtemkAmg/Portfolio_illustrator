# Адмінка тільки на GitHub Pages

Сайт і роботи зберігаються в GitHub-репозиторії `artemkamg/Portfolio_illustrator`. Supabase і сервер не потрібні. Адмінка доступна за `/admin/`; для запису введи GitHub fine-grained personal access token. Токен тримається лише в пам’яті відкритої сторінки і не записується в репозиторій чи браузерне сховище.

## Підключення один раз

1. У GitHub відкрий **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Вибери тільки репозиторій `Portfolio_illustrator`; у **Repository permissions** постав **Contents: Read and write**. Створи токен і скопіюй його (GitHub показує його лише один раз).
3. Завантаж вміст папки цього проєкту в корінь репозиторію `artemkamg/Portfolio_illustrator`, замінюючи однойменні файли. Збережи зміни в гілку `main`.
4. Увімкни Pages: **Settings → Pages → Deploy from a branch → main → /(root)**.
5. Відкрий `https://artemkamg.github.io/Portfolio_illustrator/admin/`, встав токен і натисни **Підключити GitHub**.

Додавання робіт створює коміти в репозиторії: зображення потрапляє до `images/works/`, а список — до `works.json`. GitHub Pages оновлює публічний сайт автоматично, зазвичай за кілька хвилин.

Адреса `/admin/` видима, але записати щось може лише людина з токеном. Не вставляй токен у файли сайту, не надсилай його в чат і не створюй classic token із широким доступом. Якщо токен колись потрапить у публічне місце, відклич його в налаштуваннях GitHub.

Токен потрібен як ключ доступу GitHub, замість пароля від GitHub. API працює через GitHub REST Contents endpoints: https://docs.github.com/en/rest/repos/contents.
