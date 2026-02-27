const db = require("../config/db");

const getAllShops = async () => {

    const result = await db.query(
        "SELECT * FROM shops"
    );

    return result.rows;

};

module.exports = { getAllShops };