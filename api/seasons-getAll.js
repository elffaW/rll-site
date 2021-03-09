import faunadb from 'faunadb';

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET,
});

exports.handler = (event, context, callback) => {
  console.log('Function `seasons-getAll` invoked');

  return client.query(q.Paginate(q.Match(q.Index('all_seasons')), { size: 50 }))
    .then((response) => {
      const allRefs = response.data;
      const getAll = allRefs.map((ref) => q.Get(ref));

      return client.query(getAll).then((ret) => callback(null, {
        statusCode: 200,
        body: JSON.stringify(ret),
      }));
    }).catch((err) => {
      console.log('ERROR in seasons-getAll', err);
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify(err),
      });
    });
};
