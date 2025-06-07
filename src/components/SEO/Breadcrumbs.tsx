import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbsProps {
  items: Array<{
    label: string;
    path: string;
  }>;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://xn----9sbyncijf1ah6ec.xn--p1ai${item.path}`
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Хлебные крошки" className="breadcrumbs">
        <ol>
          <li>
            <Link to="/">Главная</Link>
          </li>
          {items.map((item, index) => (
            <li key={index}>
              {index === items.length - 1 ? (
                <span aria-current="page">{item.label}</span>
              ) : (
                <Link to={item.path}>{item.label}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}; 