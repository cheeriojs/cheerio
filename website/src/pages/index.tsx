import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

// eslint-disable-next-line n/file-extension-in-import
import { HomepageFeatures } from '../components/homepage-features';
// eslint-disable-next-line n/file-extension-in-import
import { HomepageTweets } from '../components/homepage-tweets';
// eslint-disable-next-line n/file-extension-in-import
import { HeadlineSponsors } from '../components/homepage-sponsors';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className="hero hero--primary padding-vert--xl text--center">
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <Link className="button button--secondary button--lg" to="/docs/intro">
          Get Started!
        </Link>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="The industry standard for working with HTML in JavaScript"
      description={siteConfig.tagline}
    >
      <HomepageHeader />
      <HomepageFeatures />
      <HeadlineSponsors />
      <HomepageTweets />
      <div className="container">
        <Link
          className="button button--primary button--block margin-vert--lg padding-vert--md"
          to="/docs/intro"
        >
          Learn more about Cheerio ❯
        </Link>
      </div>
    </Layout>
  );
}
