import faunadb from 'faunadb';

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET,
});

// eslint-disable-next-line import/prefer-default-export
export async function handler(event, context) {
  const { player } = event.queryStringParameters;
  console.log('Function `players-getByName` invoked');

  return client.query(q.Paginate(q.Match(q.Index('players_by_name'), player)))
    .then((response) => {
      const allRefs = response.data;
      const getAll = allRefs.map((ref) => q.Get(ref));

      return client.query(getAll).then((ret) => ({
        statusCode: 200,
        body: JSON.stringify(ret),
      }));
    }).catch((err) => {
      console.log('ERROR in players-getByName', err);
      return {
        statusCode: 400,
        body: JSON.stringify(err),
      };
    });
}
