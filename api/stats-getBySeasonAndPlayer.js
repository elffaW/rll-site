import faunadb from 'faunadb';

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET,
});

// eslint-disable-next-line import/prefer-default-export
export async function handler(event, context) {
  console.log('Function `stats-getBySeasonAndPlayer` invoked');
  const { season, player } = event.queryStringParameters;
  const seasonNum = parseInt(season, 10);
  const playerId = parseInt(player, 10);

  return client.query(q.Paginate(q.Match(q.Index('stats_by_season_and_player'), seasonNum, playerId)))
    .then((response) => {
      const allRefs = response.data;
      const getAll = allRefs.map((ref) => q.Get(ref));

      return client.query(getAll).then((ret) => ({
        statusCode: 200,
        body: JSON.stringify(ret),
      }));
    }).catch((err) => {
      console.log('ERROR in stats-getBySeasonAndPlayer', err);
      return {
        statusCode: 400,
        body: JSON.stringify(err),
      };
    });
}
