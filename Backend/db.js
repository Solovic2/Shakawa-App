const oracledb = require('oracledb');
// Define the database configuration parameters
const dbConfig = {
  user: 'ARCHIVE',
  password: 'ARCHIVE',
  connectString: '128.36.1.8:1521/ORCL',
};

async function execute(query, params) {
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute(query, params);
    await conn.commit();
    return result;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

module.exports = { execute };