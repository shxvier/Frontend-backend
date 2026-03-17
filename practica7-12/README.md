# practica7-12

Integrated practice for tasks 7-12:

- password hashing with `bcrypt`
- JWT access tokens
- refresh token rotation
- React frontend with token storage and axios interceptors
- RBAC (`admin`, `moderator`, `user`)
- token blacklist on logout
- protected CRUD for products
- SQLite persistence for users, products, refresh sessions and blacklist

Run backend:

```bash
cd backend
npm install
npm run dev
```

The backend stores data in `backend/practice-7-12.sqlite`.
Configuration is loaded from `backend/.env` when present.
For a quick API check you can also run:

```bash
cd backend
npm run smoke
```

Example backend environment file:

```bash
cd backend
copy .env.example .env
```

Run frontend:

```bash
cd frontend
npm install
npm start
```

Demo users:

- `admin / admin123`
- `moderator / mod12345`
- `user / user12345`

Notes:

- public registration creates only the `user` role
- higher roles are available through the demo accounts above
- the frontend can be pointed to another backend with `REACT_APP_API_URL`
