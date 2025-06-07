import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO/SEO';
import { SchemaMarkup } from '../components/SEO/SchemaMarkup';

export const NotFound: React.FC = () => {
  return (
    <>
      <SEO
        title="Страница не найдена"
        description="К сожалению, запрашиваемая страница не найдена. Вернитесь на главную страницу рыболовного форума."
        keywords="страница не найдена, 404, рыболовный форум"
      />
      <SchemaMarkup
        type="WebPage"
        data={{
          name: 'Страница не найдена',
          description: 'К сожалению, запрашиваемая страница не найдена. Вернитесь на главную страницу рыболовного форума.',
          url: 'https://рыбный-форум.рф/404'
        }}
      />
      <div className="not-found">
        <h1>404 - Страница не найдена</h1>
        <p>К сожалению, запрашиваемая страница не найдена.</p>
        <p>Возможно, вы ищете:</p>
        <ul>
          <li><Link to="/forum">Форум</Link> - обсуждение тем о рыбалке</li>
          <li><Link to="/news">Новости</Link> - последние новости из мира рыбалки</li>
          <li><Link to="/marketplace">Маркетплейс</Link> - покупка и продажа снастей</li>
        </ul>
        <Link to="/" className="home-button">
          Вернуться на главную
        </Link>
      </div>
    </>
  );
}; 