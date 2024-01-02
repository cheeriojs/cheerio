import React from 'react';

interface FeatureItem {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
}

const FeatureList: FeatureItem[] = [
  {
    title: 'Proven syntax',
    Svg: require('@site/static/img/1F496.svg').default,
    description: (
      <>
        Cheerio implements a subset of core jQuery. Cheerio removes all the DOM
        inconsistencies and browser cruft from the jQuery library, revealing its
        truly gorgeous API.
      </>
    ),
  },
  {
    title: 'Blazingly fast',
    Svg: require('@site/static/img/26A1.svg').default,
    description: (
      <>
        Cheerio works with a very simple, consistent DOM model. As a result
        parsing, manipulating, and rendering are incredibly efficient.
      </>
    ),
  },
  {
    title: 'Incredibly flexible',
    Svg: require('@site/static/img/1F57A.svg').default,
    description: (
      <>
        Cheerio can parse nearly any HTML or XML document. Cheerio works in both
        browser and server environments.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className="col col--4">
      <div className="text--center">
        <Svg height="200" width="200" role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export function HomepageFeatures(): JSX.Element {
  return (
    <section className="container padding-top--xl ">
      <div className="row">
        {FeatureList.map((props, idx) => (
          <Feature key={idx} {...props} />
        ))}
      </div>
    </section>
  );
}
