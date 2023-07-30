const path = require("path");
const migrateMongo = require("migrate-mongo");

const configPath = path.join(__dirname, "migrate-mongo-config.js");
const config = require(configPath);

(async () => {
  try {
    const { db, client } = await migrateMongo.connect(config.mongodb);
    const migrated = await migrateMongo.migrate.up(db, config);
    console.log("Migrated:", migrated);
    await client.close();
  } catch (err) {
    console.error("Error running migration:", err);
  }
})();
