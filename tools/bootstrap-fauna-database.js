/* eslint-disable no-use-before-define */
/* bootstrap database in your FaunaDB account */
const readline = require('readline');
const faunadb = require('faunadb');
const chalk = require('chalk');

const insideNetlify = insideNetlifyBuildContext();
const q = faunadb.query;

/**
 * teams: {
 *  name:
 *  members: [ array of player IDs ]
 * }
 * players: {
 *  name: 'friendly name'
 *  rlName: 'rocket league name'
 * }
 * games: {
 *  seasonNum: 1-indexed season number
 *  weekNum: 1-indexed week number
 *  homeTeam: home team name
 *  awayTeam: away team name
 * }
 */
const dbSchema = {
  teams: [
    { name: 'a', members: [0, 1, 2] },
    { name: 'b', members: [3, 4, 5] },
    { name: 'c', members: [6, 7, 8] },
    { name: 'd', members: [9, 10, 11] },
    { name: 'e', members: [12, 13, 14] },
    { name: 'f', members: [15, 16, 17] },
    { name: 'g', members: [18, 19, 20] },
  ],
  players: [{
    id: 0, name: 'DanBot', rlName: 'DanBot',
  }, {
    id: 1, name: 'Matt K', rlName: 'Kawa',
  }, {
    id: 2, name: 'Speder', rlName: '',
  }, {
    id: 3, name: 'Matt Aux', rlName: '',
  }, {
    id: 4, name: 'PDT', rlName: 'dethorne',
  }, {
    id: 5, name: 'Sanchez', rlName: '',
  }, {
    id: 6, name: 'TC', rlName: 'pink rock',
  }, {
    id: 7, name: 'Mark P', rlName: '',
  }, {
    id: 8, name: 'Tom', rlName: '',
  }, {
    id: 9, name: 'Mike', rlName: 'elffaW',
  }, {
    id: 10, name: 'Shanley', rlName: '',
  }, {
    id: 11, name: 'Singley', rlName: '',
  }, {
    id: 12, name: 'Jay', rlName: 'tuna',
  }, {
    id: 13, name: 'JR', rlName: 'jr6969',
  }, {
    id: 14, name: 'Elissa', rlName: '',
  }, {
    id: 15, name: 'Myrvold', rlName: '',
  }, {
    id: 16, name: 'Andy', rlName: '',
  }, {
    id: 17, name: 'Billy', rlName: 'Twerp',
  }, {
    id: 18, name: 'Mitch', rlName: '',
  }, {
    id: 19, name: 'Cohn', rlName: '',
  }, {
    id: 20, name: 'Marvin?', rlName: 'Marvin?',
  }],
  games: [],
};

console.log(chalk.cyan('Creating your FaunaDB Database...\n'));

// 1. Check for required enviroment variables
if (!process.env.FAUNADB_SECRET) {
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
      createFaunaDB(process.env.FAUNADB_SECRET).then(() => {
        console.log('Database created');
      });
    });
  }
}

// Has var. Do the thing
if (process.env.FAUNADB_SECRET) {
  createFaunaDB(process.env.FAUNADB_SECRET)
    .then(() => {
      console.log('Database created');
    })
    .catch((error) => {
      console.error(error);
    });
}

/* idempotent operation */
function createFaunaDB(key) {
  console.log('Create the database!');
  const client = new faunadb.Client({
    secret: key,
  });


  /* Based on your requirements, change the schema here */
  const collectionQueries = [];
  let recordQueries = [];
  Object.keys(dbSchema).forEach((collectionKey) => {
    console.log('collection info');
    const collection = dbSchema[collectionKey];
    console.log(collection);
    collectionQueries.push(client.query(q.Create(q.Ref('classes'), { name: collectionKey })));
    recordQueries = collection.map((record) => (
      client.query(q.Create(q.Collection(collectionKey), { data: record }))
    ));
  });

  return Promise.all(collectionQueries)
    .then(() => Promise.all(recordQueries)
      .catch((err) => {
        console.error('ERROR from recordQueries');
        console.log(err);
      }))
    .catch((e) => {
      // database already exists? or something?
      if (e.requestResult.statusCode === 400 && e.message === 'instance not unique') {
        console.log('DB already exists');
        throw e;
      } else {
        console.error('ERROR from collectionQueries');
        console.log(e);
        throw e;
      }
    });

  // return client.query(q.Create(q.Ref('classes'), { name: 'players' }))
  //   .then(() => client.query(
  //     q.Create(q.Ref('indexes'), {
  //       name: 'all_players',
  //       source: q.Ref('classes/players'),
  //     }),
  //   )).catch((e) => {
  //     // Database already exists
  //     if (e.requestResult.statusCode === 400 && e.message === 'instance not unique') {
  //       console.log('DB already exists');
  //       throw e;
  //     }
  //   });
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
