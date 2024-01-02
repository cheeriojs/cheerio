import React from 'react';
import HeartSvg from '@site/static/img/1F496.svg';

import Sponsors from '../../sponsors.json';

export function HeadlineSponsors() {
  return (
    <div className="container text--center">
      <h2>Supported and Backed by</h2>
      <div
        className="container row text--left"
        style={{ justifyContent: 'space-evenly' }}
      >
        {Sponsors.headliner.map((sponsor) => (
          <div className="col col--2 avatar row row--align-center margin-top--sm">
            <a
              className="avatar__photo-link avatar__photo avatar__photo--lg"
              style={{ borderRadius: '10px' }}
              href={sponsor.url}
              key={sponsor.name}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={sponsor.image} alt={`${sponsor.name} logo`} />
            </a>

            <div className="avatar__intro">
              <div className="avatar__name">{sponsor.name}</div>
            </div>
          </div>
        ))}
        <a
          className="col col--2 avatar row padding--md margin-top--sm"
          style={{
            border: '1px solid #eaecef',
            borderRadius: '10px',
            color: 'var(--ifm-font-color-base)',
          }}
          href="https://github.com/sponsors/cheeriojs"
          target="_blank"
          rel="noopener noreferrer"
        >
          <HeartSvg className="avatar__photo-link avatar__photo avatar__photo--lg" />

          <div className="avatar__intro">
            <div className="avatar__name">…and you?</div>
          </div>
        </a>
      </div>
    </div>
  );
}
