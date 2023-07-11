import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';
import HomepageTweets from '../components/HomepageTweets';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro"
          >
            Get Started!
          </Link>
        </div>
      </div>
    </header>
  );
}

import Sponsors from '../../sponsors.json';

function HeadlineSponsors() {
  return (
    <div className={styles.sponsors}>
      <h3 className={styles.sponsorsHeader}>Headline Sponsors</h3>
      <div className={styles.sponsorsLogos}>
        {Sponsors.headliner.map((sponsor) => (
          <a
            className={styles.sponsorLogo}
            href={sponsor.url}
            key={sponsor.name}
          >
            <img
              src={sponsor.image}
              alt={`${sponsor.name} logo`}
              height="150"
              width="150"
            />
          </a>
        ))}
        <a href="https://github.com/sponsors/cheeriojs">…and you?</a>
      </div>
    </div>
  );
}

// Shows all sponsors
function CheerioIsUs(): JSX.Element {
  return (
    <div className={styles.sponsors}>
      <h3 className={styles.sponsorsHeader}>Cheerio is us</h3>
      <div className={styles.sponsorsLogos}>
        {Sponsors.sponsor.map((sponsor) => (
          <a
            className={styles.sponsorLogo}
            href={sponsor.url}
            key={sponsor.name}
          >
            <img
              src={sponsor.image}
              alt={`${sponsor.name} logo`}
              height="25"
              width="25"
            />
          </a>
        ))}
      </div>
    </div>
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
      <main>
        <HomepageFeatures />
      </main>
      <HeadlineSponsors />
      <HomepageTweets />
      <CheerioIsUs />
    </Layout>
  );
}
