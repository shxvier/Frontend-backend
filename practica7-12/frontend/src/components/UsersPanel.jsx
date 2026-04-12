import React, { useMemo } from 'react';
import { getRoleLabel } from '../labels';

function getRoleTone(role) {
  if (role === 'admin') return 'danger';
  if (role === 'moderator') return 'warning';
  return 'success';
}

export default function UsersPanel({ users, loading, currentUserId, pendingUserId, onReload, onToggleBlock }) {
  const stats = useMemo(() => {
    return users.reduce(
      (accumulator, user) => {
        accumulator.total += 1;
        accumulator.sessions += user.activeSessions;
        accumulator.products += user.productsCreated;
        accumulator.blocked += user.isBlocked ? 1 : 0;
        accumulator[user.role] += 1;
        return accumulator;
      },
      {
        total: 0,
        sessions: 0,
        products: 0,
        blocked: 0,
        admin: 0,
        moderator: 0,
        user: 0
      }
    );
  }, [users]);

  return (
    <section className="panel users-panel">
      <div className="panel__header">
        <div>
          <span className="eyebrow">Админ</span>
          <h3>Пользователи</h3>
          <p>Роли, сессии и созданные товары.</p>
        </div>
        <button type="button" className="button-secondary" onClick={onReload} disabled={loading}>
          {loading ? 'Загрузка...' : 'Обновить'}
        </button>
      </div>

      <div className="users-panel__stats">
        <div>
          <strong>{stats.total}</strong>
          <span>всего</span>
        </div>
        <div>
          <strong>{stats.admin + stats.moderator}</strong>
          <span>с правами</span>
        </div>
        <div>
          <strong>{stats.sessions}</strong>
          <span>сессии</span>
        </div>
        <div>
          <strong>{stats.products}</strong>
          <span>товары</span>
        </div>
        <div>
          <strong>{stats.blocked}</strong>
          <span>заблокированы</span>
        </div>
      </div>

      {users.length === 0 && !loading ? <div className="empty-state empty-state--compact">Пользователи не найдены.</div> : null}

      <div className="users-grid">
        {users.map((user) => (
          <article key={user.id} className="user-card">
            <div className="user-card__top">
              <div>
                <h4>{user.username}</h4>
                <p>{user.id}</p>
              </div>
              <div className="badge-stack">
                <span className={`badge badge--${getRoleTone(user.role)}`}>{getRoleLabel(user.role)}</span>
                <span className={`badge badge--${user.isBlocked ? 'danger' : 'success'}`}>
                  {user.isBlocked ? 'Заблокирован' : 'Активен'}
                </span>
              </div>
            </div>

            <dl className="user-card__meta">
              <div>
                <dt>Создан</dt>
                <dd>{new Date(user.createdAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Товаров</dt>
                <dd>{user.productsCreated}</dd>
              </div>
              <div>
                <dt>Сессий</dt>
                <dd>{user.activeSessions}</dd>
              </div>
              <div>
                <dt>Статус</dt>
                <dd>{user.isBlocked ? 'Блок' : 'Доступен'}</dd>
              </div>
              {user.blockedAt ? (
                <div>
                  <dt>Блокировка</dt>
                  <dd>{new Date(user.blockedAt).toLocaleString()}</dd>
                </div>
              ) : null}
            </dl>

            <div className="user-card__actions">
              <button
                type="button"
                className={user.isBlocked ? 'button-secondary' : 'button-danger'}
                onClick={() => onToggleBlock(user)}
                disabled={pendingUserId === user.id || currentUserId === user.id}
              >
                {pendingUserId === user.id ? 'Обработка...' : user.isBlocked ? 'Разблокировать' : 'Заблокировать'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
