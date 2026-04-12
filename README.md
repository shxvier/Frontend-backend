# Практики по фронтенду и бэкенду

В этом репозитории собраны учебные проекты по практическим занятиям. Основные итоговые работы сейчас находятся в двух отдельных папках.

## Основные проекты

### `practica7-12`

Fullstack-приложение на `React + Express + SQLite`:

- регистрация и вход
- `bcrypt`
- `JWT access/refresh`
- хранение токенов на фронте
- `RBAC`
- `blacklist`
- защищенный CRUD

Документация: [practica7-12/README.md](./practica7-12/README.md)

### `practica13-18`

Учебное `PWA` заметок на `HTML/CSS/JS + Express + Socket.IO + web-push`:

- `Service Worker` и офлайн-режим
- `Web App Manifest` и иконки PWA
- локальный `HTTPS` (mkcert / selfsigned)
- App Shell и динамическая загрузка страниц
- `WebSocket` и push-уведомления через VAPID
- напоминания с действием «Отложить на 5 минут»

Документация: [practica13-18/README.md](./practica13-18/README.md)

## Быстрый запуск

### Практики 7-12

```bash
cd practica7-12/backend
npm install
npm run dev
```

```bash
cd practica7-12/frontend
npm install
npm start
```

```bash
cd practica7-12/backend
npm run smoke
```

### Практики 13-18

```bash
cd practica13-18
npm install
npm start
```

Открыть `https://localhost:3000`.
