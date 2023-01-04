const oracledb = require("oracledb");
const dbConfig = require("./dbConfig");

module.exports = async (stmt) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    if (connection) {
      return await connection.execute(stmt);
    }
  } catch (err) {
    console.log("Error Connecting to DB");
    console.log(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.log("Error");
      }
    }
  }
};
