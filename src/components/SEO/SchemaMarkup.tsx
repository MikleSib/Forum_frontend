import React from 'react';

interface SchemaMarkupProps {
  type: 'WebSite' | 'Forum' | 'NewsArticle' | 'Product' | 'WebPage';
  data: any;
}

export const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ type, data }) => {
  const getSchema = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': type,
    };

    switch (type) {
      case 'WebSite':
        return {
          ...baseSchema,
          name: 'Рыболовный форум',
          url: 'https://рыбный-форум.рф',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://рыбный-форум.рф/search?q={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        };
      case 'Forum':
        return {
          ...baseSchema,
          name: data.title,
          description: data.description,
          url: `https://рыбный-форум.рф/forum/${data.id}`,
          datePublished: data.datePublished,
          author: {
            '@type': 'Person',
            name: data.author
          }
        };
      case 'NewsArticle':
        return {
          ...baseSchema,
          headline: data.title,
          description: data.description,
          image: data.image,
          datePublished: data.datePublished,
          author: {
            '@type': 'Person',
            name: data.author
          }
        };
      case 'Product':
        return {
          ...baseSchema,
          name: data.title,
          description: data.description,
          image: data.image,
          offers: {
            '@type': 'Offer',
            price: data.price,
            priceCurrency: 'RUB',
            availability: data.availability
          }
        };
      case 'WebPage':
        return {
          ...baseSchema,
          name: data.name,
          description: data.description,
          url: data.url
        };
      default:
        return baseSchema;
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(getSchema()) }}
    />
  );
}; 