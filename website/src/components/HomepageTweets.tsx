import React from 'react';

interface TweetItem {
  id: string;
  name: string;
  user: string;
  date: string;
  tweet: React.ReactNode;
}

const TweetList = [
  {
    id: '628016191928446977',
    name: 'Axel Rauschmayer',
    user: 'rauschma',
    date: '2015-08-03T02:35:00.000Z',
    tweet: (
      <>
        For transforming HTML via Node.js scripts, @mattmueller's cheerio works
        really well.
      </>
    ),
  },
  {
    id: '1616150822932385792',
    name: 'Valeri Karpov',
    user: 'code_barbarian',
    date: '2023-01-19T19:09:00.000Z',
    tweet: (
      <>
        Cheerio is a weird npm module: most devs have never heard of it, but I
        rarely build an app without it.
        <br />
        <br />
        So much utility for quick and easy HTML transformations.
      </>
    ),
  },
  {
    id: '1545481085865320449',
    name: 'Thomas Boutell',
    user: 'boutell',
    date: '2021-07-08T19:52:00.000Z',
    tweet: (
      <>
        You probably shouldn't use jQuery, but if you're great at jQuery, you're
        going to be really popular on server-side projects that need web
        scraping or HTML transformation. "npm install cheerio" ahoy!
      </>
    ),
  },
  {
    id: '552311181760008192',
    name: 'Alistair G MacDonald',
    user: 'html5js',
    date: '2015-01-06T03:50:00.000Z',
    tweet: (
      <>
        Looking for a faster, cleaner alternative to basic JSDOM? Try Cheerio!
        #npm #javascript #nodejs
      </>
    ),
  },
  {
    id: '1466753169900273667',
    name: 'Yogini Bende',
    user: 'hey_yogini',
    date: '2021-12-03T12:56:00.000Z',
    tweet: 'Cheerio is 🔥',
  },
  {
    id: '936243649234591744',
    name: 'Jonny Frodsham',
    user: 'jonnyfrodsham',
    date: '2017-11-30T14:40:00.000Z',
    tweet: (
      <>
        Needed to do a quick web scrape in Node for a demo. Seems like I'm back
        using jQuery in the super timesaving cheerio npm package 😯
      </>
    ),
  },
  {
    id: '264033999272439809',
    name: 'Thomas Steiner',
    user: 'tomayac',
    date: '2012-11-01T15:59:00.000Z',
    tweet: (
      <>
        npm install cheerio. That's the #jQuery DOM API for #nodeJS essentially.
        Thanks, @MattMueller
      </>
    ),
  },
  {
    id: '1403139379757977602',
    name: 'Mike Pennisi',
    user: 'JugglinMike',
    date: '2021-06-11T04:57:00.000Z',
    tweet: (
      <>
        Thank you @fb55 for tirelessly pushing Cheerio to version 1.0. That
        library helps so many developers expand their horizons beyond the
        browser, and you've been making it possible for a decade!
      </>
    ),
  },
  {
    id: '1186972238190403587',
    name: 'Matthew Phillips',
    user: 'matthewcp',
    date: '2019-10-23T12:46:00.000Z',
    tweet: (
      <>
        Cheerio is (still) such a useful tool for manipulating HTML. Shout to
        @MattMueller for saving me an untold amount of time over the years.
      </>
    ),
  },
];

function Tweet({ id, name, user, date, tweet }: TweetItem) {
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  return (
    <div className="card-demo col col--4 margin-vert--sm">
      <div className="card">
        <div className="card__header">
          <div className="avatar">
            <img
              className="avatar__photo"
              src={`https://unavatar.io/${user}`}
              alt={`${name}'s avatar`}
              loading="lazy"
            />
            <div className="avatar__intro">
              <div className="avatar__name">{name}</div>
              <small className="avatar__subtitle">@{user}</small>
            </div>
          </div>
        </div>
        <div className="card__body">{tweet}</div>
        <time className="card__footer">
          <a
            href={`https://twitter.com/${user}/status/${id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {formattedDate}
          </a>
        </time>
      </div>
    </div>
  );
}

export function HomepageTweets() {
  return (
    <div className="container">
      <h2 className="text--center">What Our Users Say</h2>
      <div className="row">
        {TweetList.map((props) => (
          <Tweet {...props} />
        ))}
      </div>
    </div>
  );
}
