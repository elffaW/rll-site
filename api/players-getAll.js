import faunadb from 'faunadb';

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET,
});

exports.handler = (event, context, callback) => {
  console.log('Function `players-getAll` invoked');

  return client.query(q.Paginate(q.Match(q.Index('all_players')), { size: 500 }))
    .then((response) => {
      const allRefs = response.data;
      const getAll = allRefs.map((ref) => q.Get(ref));

      return client.query(getAll).then((ret) => callback(null, {
        statusCode: 200,
        body: JSON.stringify(ret),
      }));
    }).catch((err) => {
      console.log('ERROR in players-getAll', err);
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify(err),
      });
    });
};
