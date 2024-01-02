import React from 'react';
import HeartSvg from '@site/static/img/1F496.svg';
import styles from './HomepageSponsors.module.css';

import Sponsors from '../../sponsors.json';

export function HeadlineSponsors() {
  return (
    <div className={`padding-vert--lg margin-vert--lg ${styles.emphasis}`}>
      <div className="container">
        <h2 className="text--center">Supported and Backed by</h2>
        <div
          className="container row"
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
            className={`col col--2 avatar row padding--md margin-top--sm ${styles.you}`}
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
    </div>
  );
}
