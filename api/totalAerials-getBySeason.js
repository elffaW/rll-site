import faunadb from 'faunadb';

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET,
});

// eslint-disable-next-line import/prefer-default-export
export async function handler(event, context) {
  console.log('Function `totalAerials-getBySeason` invoked');
  const { season } = event.queryStringParameters;
  const seasonNum = parseInt(season, 10);

  return client.query(q.Paginate(q.Match(q.Index('totalAerials_by_season'), seasonNum), { size: 50000 }))
    .then((response) => {
      const all = response.data;

      return {
        statusCode: 200,
        body: JSON.stringify(all),
      };
    }).catch((err) => {
      console.log('ERROR in totalAerials-getBySeason', err);
      return {
        statusCode: 400,
        body: JSON.stringify(err),
      };
    });
}
