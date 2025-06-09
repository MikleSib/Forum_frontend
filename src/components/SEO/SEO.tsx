import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  ogImage = 'https://xn----9sbd2aijefbenj3bl0hg.xn--p1ai/logo.svg',
  ogType = 'website',
  canonical,
}) => {
  const siteTitle = 'Рыболовный форум';
  const fullTitle = `${title} | ${siteTitle}`;
  const baseUrl = 'https://xn----9sbd2aijefbenj3bl0hg.xn--p1ai';
  const fullCanonical = canonical || window.location.href;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {canonical && <link rel="canonical" href={canonical} />}
    </Helmet>
  );
}; 