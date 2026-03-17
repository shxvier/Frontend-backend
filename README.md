# Практики по фронтенду и бэкенду

Этот репозиторий содержит несколько учебных практик. Актуальный итоговый проект по заданиям 7-12 находится в папке `practica7-12/`.

## Основной проект

`practica7-12` — fullstack-приложение на React + Express + SQLite:

- регистрация и вход
- хеширование паролей через `bcrypt`
- `JWT` access/refresh токены
- хранение токенов на фронте
- `RBAC` (`admin`, `moderator`, `user`)
- `blacklist` токенов
- защищенный CRUD товаров

Подробное описание и команды запуска: [practica7-12/README.md](./practica7-12/README.md)

## Быстрый запуск

Backend:

```bash
cd practica7-12/backend
npm install
npm run dev
```

Frontend:

```bash
cd practica7-12/frontend
npm install
npm start
```

Проверка backend:

```bash
cd practica7-12/backend
npm run smoke
```
