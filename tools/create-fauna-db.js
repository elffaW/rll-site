/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* bootstrap database in your FaunaDB account */
const readline = require('readline');
const faunadb = require('faunadb');
const chalk = require('chalk');
require('dotenv').config();

const insideNetlify = insideNetlifyBuildContext();
const q = faunadb.query;

const {
  SEASON_NUMBER, FAUNADB_SECRET, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEETS_SHEET_ID,
} = process.env;

if (!SEASON_NUMBER) {
  console.log(chalk.yellow('Required SEASON_NUMBER environment variable not found.'));
  process.exit(1);
}

console.log(chalk.cyan('Creating your FaunaDB Database...\n'));

// 1. Check for required enviroment variables
if (!FAUNADB_SECRET) {
  console.log(chalk.yellow('Required FAUNADB_SECRET enviroment variable not found.'));
  if (insideNetlify) {
    console.log('Visit https://app.netlify.com/sites/YOUR_SITE_HERE/settings/deploys');
    console.log('and set a `FAUNADB_SECRET` value in the "Build environment variables" section');
    process.exit(1);
  }
  // Local machine warning
  if (!insideNetlify) {
    console.log();
    console.log('You can create fauna DB keys here: https://dashboard.fauna.com/db/keys');
    console.log();
    ask(chalk.bold('Enter your faunaDB server key'), (err, answer) => {
      if (!answer) {
        console.log('Please supply a faunaDB server key');
        process.exit(1);
      }

      const collections = [
        'teams',
        'players',
        'games',
        'stats',
      ];
      console.log(chalk.cyan('init db'));
      createFaunaDB(FAUNADB_SECRET, collections).then(() => {
        createFaunaIndexes(FAUNADB_SECRET, collections).then(() => {
          console.log('Database created');
        });
      }).catch((error) => {
        console.error(error);
      });
    });
  }
}

// Has var. Do the thing
if (FAUNADB_SECRET) {
  // required env vars
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    console.log(chalk.yellow('no GOOGLE_SERVICE_ACCOUNT_EMAIL env var set'));
    process.exit(1);
  }
  if (!GOOGLE_PRIVATE_KEY) {
    console.log(chalk.yellow('no GOOGLE_PRIVATE_KEY env var set'));
    process.exit(1);
  }
  if (!GOOGLE_SHEETS_SHEET_ID) {
    // spreadsheet key is the long id in the sheets URL
    console.log(chalk.yellow('no GOOGLE_SHEETS_SHEET_ID env var set'));
    process.exit(1);
  }

  const collections = [
    'teams',
    'players',
    'games',
    'stats',
  ];

  console.log(chalk.cyan('init db'));
  createFaunaDB(FAUNADB_SECRET, collections).then(() => {
    createFaunaIndexes(FAUNADB_SECRET, collections).then(() => {
      console.log('Database created with collections', collections);
    });
  }).catch((error) => {
    console.error(error);
  });
}

/**
 * createFaunaDB creates the collections in the DB
 * @param {string} key the Fauna secret key
 * @param {string[]} collections array of collection names to create
 */
function createFaunaDB(key, collections) {
  return new Promise((resolve, reject) => {
    console.log('Create the database collections!');
    const client = new faunadb.Client({
      secret: key,
    });

    // const collectionQueries = [];
    collections.forEach(async (collectionKey) => {
      console.log(chalk.cyan('Create collection', collectionKey));
      try {
        await client.query(q.CreateCollection({ name: collectionKey }));
      } catch (e) {
        if (e.requestResult.statusCode === 400) {
          if (e.message === 'instance not unique') {
            console.log('DB already exists');
            reject(e);
          } else if (e.message === 'instance already exists') { // tried to create collection that already exists
            console.log('collections already exist, ignoring...');
          }
        } else {
          console.error('ERROR from collectionQueries');
          reject(e);
        }
      }
    });

    resolve();
  });
}

/**
 * createFaunaIndexes creates the collection indexes in the DB
 * @param {string} key the Fauna secret key
 * @param {string[]} collections array of collection names to create indexes for
 */
function createFaunaIndexes(key, collections) {
  return new Promise((resolve, reject) => {
    console.log('Create the indexes!');
    const client = new faunadb.Client({
      secret: key,
    });

    collections.forEach(async (collectionKey) => {
      const collectionIndexQueries = [];
      console.log(chalk.cyan('Create indexes for collection ['), chalk.bold(collectionKey), chalk.cyan(']'));
      collectionIndexQueries.push(q.Create(q.Ref('indexes'), {
        name: `all_${collectionKey}`,
        source: q.Collection(collectionKey),
      }));

      collectionIndexQueries.push(q.Create(q.Ref('indexes'), {
        name: `${collectionKey}_by_season`,
        source: q.Collection(collectionKey),
        terms: [{ field: ['data', 'season'] }],
      }));

      collectionIndexQueries.push(q.Create(q.Ref('indexes'), {
        name: `${collectionKey}_by_season_and_id`,
        source: q.Collection(collectionKey),
        terms: [{ field: ['data', 'season'] }, { field: ['data', 'id'] }],
        unique: true,
        serialized: true,
      }));

      if (collectionKey === 'stats') {
        // create special stats indexes
        console.log(chalk.cyan('Create extra indexes for collection ['), chalk.bold('stats'), chalk.cyan(']'));
        collectionIndexQueries.push(q.Create(q.Ref('indexes'), {
          name: 'stats_by_season_and_player',
          source: q.Collection('stats'),
          terms: [{ field: ['data', 'season'] }, { field: ['data', 'player'] }],
        }));
      }

      try {
        await client.query(collectionIndexQueries);
      } catch (e) {
        if (e.requestResult.statusCode === 400) {
          if (e.message === 'instance not unique') {
            console.log('DB already exists');
            reject(e);
          }
        } else {
          console.error('ERROR from collectionIndexQueries');
          reject(e);
        }
      }
    });

    resolve();


    // return client.query(collectionIndexQueries).then(() => {
    //   console.log('created collection indexes');
    //   resolve();
    // }).catch((e) => {
    //   // database already exists? or something?
    //   if (e.requestResult.statusCode === 400) {
    //     if (e.message === 'instance not unique') {
    //       console.log('DB already exists');
    //       reject(e);
    //     }
    //   } else {
    //     console.error('ERROR from collectionIndexQueries');
    //     reject(e);
    //   }
    // });
  });
}

/* util methods */

// Test if inside netlify build context
function insideNetlifyBuildContext() {
  if (process.env.DEPLOY_PRIME_URL) {
    return true;
  }
  return false;
}

// Readline util
function ask(question, callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(`${question}\n`, (answer) => {
    rl.close();
    callback(null, answer);
  });
}
