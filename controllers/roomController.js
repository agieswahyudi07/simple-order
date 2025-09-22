const { getDB } = require("../database/database");
const { ObjectId } = require("mongodb");

/**
 * Get All Rooms
 *
 * Description:
 * - Retrieves all room documents from the "rooms" collection in the database.
 *
 * Response:
 * - 200 OK: Returns an object with a `rooms` array containing all room records.
 * - 500 Internal Server Error: Returns an error message if the query fails.
 */
exports.index = async (req, res) => {
  try {
    const db = getDB();
    const rooms = await db.collection("rooms").find().toArray();
    res.status(200).json({ rooms });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something's wrong with the server, try again later." });
  }
};

/**
 * Create Room
 *
 * Description:
 * - Inserts a new meeting room into the "rooms" collection.
 *
 * Body Parameters:
 * - unitId   (string, required): ID of the unit to which the room belongs.
 * - name     (string, required): Room name.
 * - capacity (number, required): Maximum capacity of the room.
 *
 * Response:
 * - 201 Created: Returns a success message when the room is added.
 * - 500 Internal Server Error: Returns an error message if the insertion fails.
 */
exports.store = async (req, res) => {
  try {
    const db = getDB();
    const { unitId, name, capacity } = req.body;

    await db.collection("rooms").insertOne({
      unitId: new ObjectId(unitId),
      name,
      capacity: Number(capacity)
    });

    res.status(201).json({ message: "Meeting room created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something's wrong with the server, try again later." });
  }
};

/**
 * Update Room
 *
 * Description:
 * - Updates specific fields of an existing meeting room in the "rooms" collection.
 * - Only updates the properties provided in the request body.
 *
 * Path Parameters:
 * - id (string, required): ID of the room to update.
 *
 * Body Parameters:
 * - name     (string, optional): New name of the room.
 * - capacity (number, optional): New maximum capacity of the room.
 *
 * Response:
 * - 200 OK: Returns a success message and the updated fields.
 * - 404 Not Found: Returned if the room ID does not exist.
 * - 500 Internal Server Error: Returned if an unexpected error occurs.
 */
exports.patch = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { unitId, name, capacity } = req.body;

    const existingRoom = await db.collection("rooms").findOne({ _id: new ObjectId(id) });
    if (!existingRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    const updateFields = {};
    // if (unitId) updateFields.unitId = new ObjectId(unitId);
    if (name) updateFields.name = name;
    if (capacity) updateFields.capacity = Number(capacity);

    await db.collection("rooms").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    res.status(200).json({ message: "Room created successfully", updateFields });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something's wrong with the server, try again later." });
  }
};

/**
 * Delete Room
 *
 * Description:
 * - Deletes a meeting room document from the "rooms" collection.
 * - Permanently removes the record based on the provided room ID.
 *
 * Path Parameters:
 * - id (string, required): ID of the room to delete.
 *
 * Response:
 * - 200 OK: Returns a success message when the room is successfully deleted.
 * - 404 Not Found: Returned if the specified room ID does not exist.
 * - 500 Internal Server Error: Returned if an unexpected error occurs during deletion.
 */
exports.destroy = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const result = await db.collection("rooms").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something's wrong with the server, try again later." });
  }
};


