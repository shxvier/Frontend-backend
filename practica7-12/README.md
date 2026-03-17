# Практики 7-12

Итоговый учебный проект по практическим занятиям 7-12 по дисциплине «Фронтенд и бэкенд разработка».

## Что реализовано

- хеширование паролей через `bcrypt`
- `JWT` access-токены
- refresh-токены с ротацией
- хранение токенов на фронте
- `RBAC` с ролями `admin`, `moderator`, `user`
- `blacklist` токенов при выходе
- защищенный CRUD товаров
- загрузка изображений
- SQLite для пользователей, товаров и сессий

## Стек

- frontend: React
- backend: Express
- database: SQLite

## Запуск backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

База данных создается в `backend/practice-7-12.sqlite`.

Для быстрой проверки API:

```bash
cd backend
npm run smoke
```

## Запуск frontend

```bash
cd frontend
npm install
npm start
```

По умолчанию frontend обращается к `http://localhost:3000`.
При необходимости адрес API можно переопределить через `REACT_APP_API_URL`.

## Демо-аккаунты

- `admin / admin123`
- `moderator / mod12345`
- `user / user12345`

## Особенности

- публичная регистрация создает только роль `user`
- редактирование товара открывается в модальном окне
- служебные админ-панели скрыты до отдельного открытия
