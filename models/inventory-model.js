const pool = require("../database")
/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 * Get all inventory items and classification_name by classification_id
 * *************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getclassificationbyid error" + error) 
    }
}

/* ***************************
 * Get inventory item by inventory id
 * *************************** */
async function getInventoryById(inv_id) {
  try {
    const sql = `
      SELECT * 
      FROM inventory 
      WHERE inv_id = $1
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows[0];
  } catch (error) {
    console.error("getInventoryById error: " + error);
  }
}

/* ***************************
  * Insert a new classification into the database
  * *************************** */

async function insertClassification(classification_name) {
  const sql = `
    INSERT INTO public.classification (classification_name)
    VALUES ($1)
    RETURNING *
  `
  return pool.query(sql, [classification_name])
}



module.exports = { getClassifications, getInventoryByClassificationId, getInventoryById, insertClassification };