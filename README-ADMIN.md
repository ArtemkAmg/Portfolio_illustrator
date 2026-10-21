# GitHub Pages + приватна адмінка

Сайт працює як статичний GitHub Pages сайт. Роботи та зображення зберігаються в Supabase, а адмінка `/admin/` вимагає вхід по email і паролю.

## Підключення

1. Створи Supabase проєкт і користувача в **Authentication → Users**. Вимкни public sign-ups, щоб ніхто не міг створити собі вхід.
2. Скопіюй UUID користувача з Authentication → Users. У `supabase-setup.sql` заміни обидва `5256bcd1-1ece-4bac-86f5-4d19d6c53a06` на цей UUID, потім виконай SQL у **SQL Editor**.
3. У налаштуваннях API проєкту скопіюй Project URL та publishable/anon key. Впиши їх у `supabase-config.js` замість `https://xupexdkbcnlwoqzebfov.supabase.co/rest/v1/` і `sb_publishable_NF9s7lq-6lrl_nXsYHFelw_924TZoyE`. У браузері можна використовувати лише publishable/anon key, ніколи не service_role key.
4. Завантаж вміст цієї папки у GitHub repository. У **Settings → Pages** обери джерело публікації (наприклад, Deploy from a branch та гілку `main`, папку `/ (root)`).
5. Після публікації відкрий `https://ТВІЙ-НІК.github.io/НАЗВА-РЕПОЗИТОРІЮ/admin/` і увійди email та паролем створеного користувача.

Основна сторінка читає роботи з Supabase і показує їх кожному відвідувачу. Лише UUID власника, вказаний у SQL політиках, може додавати або видаляти роботи. На стартовій сторінці лишаються вбудовані приклади; нові роботи додаються через адмінку.

Supabase JS підключається через офіційний CDN script за інструкцією Supabase: https://supabase.com/docs/reference/javascript/installing. Вхід використовує `signInWithPassword`: https://supabase.com/docs/reference/javascript/auth-signinwithpassword.
