const db = require("../config/db");
const logger = require("./logger");

/**
 * Execute a function within a database transaction
 * @param {Function} callback - async function to execute
 * @returns {Promise} result of callback
 */
const executeTransaction = async (callback) => {
    const client = await db.connect();
    try {
        await client.query("BEGIN");
        const result = await callback(client);
        await client.query("COMMIT");
        logger.info("Transaction committed successfully");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        logger.error("Transaction rolled back due to error", { error: error.message });
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Execute a raw query with transaction support
 * @param {string} sql - SQL query
 * @param {Array} params - query parameters
 * @param {string} logContext - optional context for logging
 * @returns {Promise} query result
 */
const executeQuery = async (sql, params = [], logContext = "") => {
    try {
        logger.debug("Executing query", { sql: sql.substring(0, 100), context: logContext });
        const result = await db.query(sql, params);
        return result;
    } catch (error) {
        logger.error("Query execution failed", { sql: sql.substring(0, 100), error: error.message, context: logContext });
        throw error;
    }
};

module.exports = {
    executeTransaction,
    executeQuery
};
