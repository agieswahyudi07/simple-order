const { getDB } = require("../database/database");
const { ObjectId } = require('mongodb')

/**
 * Get All Units
 *
 * Description:
 * - Retrieves all unit documents from the "units" collection in the database.
 *
 * Response:
 * - 200 OK: Returns an object with a `units` array containing all unit records.
 * - 500 Internal Server Error: Returns an error message if the query fails.
 */
exports.index = async (req, res) => {
  try {
    const db = getDB();
    const units = await db.collection("units").find().toArray();
    res.status(200).json({ units });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something's wrong with the server, try again later." });
  }
};

/**
 * Create Unit
 *
 * Description:
 * - Inserts a new unit document into the "units" collection in the database.
 *
 * Request Body:
 * - name (string, required): The name of the unit to be created.
 *
 * Response:
 * - 201 Created: Returns a success message if the unit is successfully added.
 * - 500 Internal Server Error: Returns an error message if the insert operation fails.
 */
exports.store = async (req, res) => {
  try {
    const db = getDB();
    const { name } = req.body;

    await db.collection("units").insertOne({ name });
    res.status(201).json({ message: "Unit created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something's wrong with the server, try again later." });
  }
};

/**
 * Update Unit
 *
 * Description:
 * - Updates the name of an existing unit document in the "units" collection.
 *
 * Path Parameters:
 * - id (string, required): The ID of the unit to update.
 *
 * Request Body:
 * - name (string, required): The new name of the unit.
 *
 * Response:
 * - 200 OK: Returns a success message if the unit is successfully updated.
 * - 404 Not Found: Returned if no unit with the specified ID is found.
 * - 500 Internal Server Error: Returns an error message if the update operation fails.
 */
exports.patch = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { name } = req.body;

    const result = await db.collection("units").updateOne(
      { _id: new ObjectId(id) },
      { $set: { name } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Unit not found" });
    }

    res.status(200).json({ message: "Unit updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something's wrong with the server, try again later." });
  }
};

/**
 * Delete Unit
 *
 * Description:
 * - Deletes a specific unit document from the "units" collection.
 *
 * Path Parameters:
 * - id (string, required): The ID of the unit to delete.
 *
 * Response:
 * - 200 OK: Returns a success message if the unit is successfully deleted.
 * - 404 Not Found: Returned if no unit with the specified ID exists.
 * - 500 Internal Server Error: Returns an error message if the deletion operation fails.
 */
exports.destroy = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const result = await db.collection("units").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Unit not found" });
    }

    res.status(200).json({ message: "Unit deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something's wrong with the server, try again later." });
  }
};

