const { getDB } = require("../database/database");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

/**
 * Calculate Consumption Cost
 *
 * Parameters:
 * - startTime (string) – Start time in "HH:MM" format (e.g., "09:00").
 * - endTime (string) – End time in "HH:MM" format (e.g., "15:00").
 * - participants (number) – Total number of participants.
 *
 * Logic:
 * - Adds "Snack Pagi" if the start time is before 11:00 (Rp20,000/person).
 * - Adds "Makan Siang" if the meeting spans across lunch (between 11:00 and 14:00) (Rp30,000/person).
 * - Adds "Snack Sore" if the end time is after 14:00 (Rp20,000/person).
 * - Multiplies each selected item’s price by the number of participants.
 *
 * Returns:
 * - { types: string[], total: number }
 *   - types: List of included consumption types (e.g., ["Snack Pagi", "Makan Siang"]).
 *   - total: Total calculated cost.
 */
function getConsumption(startTime, endTime, participants) {
  const rules = [];
  const start = parseInt(startTime.replace(":", ""), 10);
  const end = parseInt(endTime.replace(":", ""), 10);

  if (start < 1100) rules.push({ name: "Snack Pagi", price: 20000 });
  if (start < 1400 && end > 1100) rules.push({ name: "Makan Siang", price: 30000 });
  if (end > 1400) rules.push({ name: "Snack Sore", price: 20000 });

  let total = 0;
  rules.forEach(r => { total += r.price * participants; });

  return { types: rules.map(r => r.name), total };
}

/**
 * Get All Bookings
 *
 * Description:
 * - Fetches all booking records from the "bookings" collection in the database.
 *
 * Response:
 * - 200 OK: Returns an object with a `bookings` array containing all booking documents.
 * - 500 Internal Server Error: Returns an error message if the query fails.
 */
exports.index = async (req, res) => {
  try {
    const db = getDB();
    const bookings = await db.collection("bookings").find().toArray();
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create a New Booking
 *
 * Description:
 * - Inserts a new booking document into the "bookings" collection.
 * - Automatically calculates consumption types and total amount based on time range and participants.
 *
 * Body Parameters:
 * - unitId (string, required): ID of the unit where the booking is made.
 * - roomId (string, required): ID of the room to be booked.
 * - date (string, required): Booking date (e.g., "2025-09-23").
 * - startTime (string, required): Start time in "HH:MM" format.
 * - endTime (string, required): End time in "HH:MM" format.
 * - participants (number, required): Number of participants attending.
 *
 * Response:
 * - 201 Created: Returns a success message, calculated `consumption` types, and total `nominal` amount.
 * - 400 Bad Request: Returns validation errors if any required field is missing or invalid.
 * - 500 Internal Server Error: Returns an error message if database insertion fails.
 */
exports.store = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const db = getDB();
    const { unitId, roomId, date, startTime, endTime, participants } = req.body;

    const consumption = getConsumption(startTime, endTime, participants);

    await db.collection("bookings").insertOne({
      unitId: new ObjectId(unitId),
      roomId: new ObjectId(roomId),
      date,
      startTime,
      endTime,
      participants: Number(participants),
      consumptionTypes: consumption.types,
      totalAmount: consumption.total
    });

    res.status(201).json({
      message: "Booking created successfully",
      consumption: consumption.types,
      nominal: consumption.total
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something's wrong with the server, try again later."});
  }
};

/**
 * Update an Existing Booking (Partial)
 *
 * Description:
 * - Updates only the provided fields of a booking document.
 * - Revalidates time schedule, room capacity, and recalculates consumption if related fields change.
 *
 * URL Parameters:
 * - id (string, required): Booking ID to be updated.
 *
 * Body Parameters (all optional, only provided fields will be updated):
 * - unitId (string): ID of the unit.
 * - roomId (string): ID of the room.
 * - date (string): Booking date (e.g., "2025-09-23").
 * - startTime (string): Start time in "HH:MM" format (e.g., "15.30").
 * - endTime (string): End time in "HH:MM" format (e.g., "17.00").
 * - participants (number): Number of participants.
 *
 * Behavior:
 * - Validates that start time is before end time.
 * - Ensures room is not double-booked for the same schedule.
 * - Checks participant count does not exceed room capacity.
 * - Recalculates consumption types and total amount if time or participant count changes.
 *
 * Response:
 * - 200 OK: Returns a success message and the updated fields.
 * - 400 Bad Request: Returns validation errors (e.g., conflicts, capacity exceeded).
 * - 404 Not Found: If no booking is found with the given ID.
 * - 500 Internal Server Error: If a database error occurs.
 */
exports.patch = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { unitId, roomId, date, startTime, endTime, participants } = req.body;

    const updateFields = {};

    if (unitId) updateFields.unitId = new ObjectId(unitId);
    if (roomId) updateFields.roomId = new ObjectId(roomId);
    if (date) updateFields.date = date;
    if (startTime) updateFields.startTime = startTime;
    if (endTime) updateFields.endTime = endTime;
    if (participants) updateFields.participants = Number(participants);

    if (participants && roomId) {
      const room = await db.collection("rooms").findOne({ _id: new ObjectId(roomId), unitId: new ObjectId(unitId) });
      if (!room) return res.status(400).json({ message: "Meeting room not found" });
      if (Number(participants) > room.capacity) {
        return res.status(400).json({ message: `number of participants exceeds room capacity, room capacity is (${room.capacity})` });
      }
    }

    if ((startTime || endTime || roomId || date)) {
      const newStart = startTime || (await db.collection("bookings").findOne({ _id: new ObjectId(id) })).startTime;
      const newEnd   = endTime   || (await db.collection("bookings").findOne({ _id: new ObjectId(id) })).endTime;
      const newDate  = date      || (await db.collection("bookings").findOne({ _id: new ObjectId(id) })).date;
      const newRoom  = roomId    || (await db.collection("bookings").findOne({ _id: new ObjectId(id) })).roomId;

      if (newStart >= newEnd) {
        return res.status(400).json({ message: "Start time cannot be greater than end time" });
      }

      const conflict = await db.collection("bookings").findOne({
        _id: { $ne: new ObjectId(id) },
        roomId: new ObjectId(newRoom),
        date: newDate,
        $and: [
          { startTime: { $lt: newEnd } },
          { endTime:   { $gt: newStart } }
        ]
      });
      if (conflict) {
        return res.status(400).json({ message: "Meeting room is already booked on the same schedule, choose other room or schedule" });
      }
    }

    if ((startTime || endTime || participants)) {
      const cur = await db.collection("bookings").findOne({ _id: new ObjectId(id) });
      const newStart = startTime || cur.startTime;
      const newEnd   = endTime   || cur.endTime;
      const newPart  = participants ? Number(participants) : cur.participants;
      const consumption = getConsumption(newStart, newEnd, newPart);
      updateFields.consumptionTypes = consumption.types;
      updateFields.totalAmount = consumption.total;
    }

    const result = await db.collection("bookings").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking updated successfully", updated: updateFields });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something's wrong with the server, try again later." });
  }
};

/**
 * Delete a Booking
 *
 * Description:
 * - Permanently removes a booking document from the database by its ID.
 *
 * URL Parameters:
 * - id (string, required): The ID of the booking to delete.
 *
 * Behavior:
 * - Attempts to find and delete the booking with the specified ID.
 *
 * Response:
 * - 200 OK: Booking successfully deleted.
 * - 404 Not Found: No booking found with the provided ID.
 * - 500 Internal Server Error: Database or server error occurred.
 */
exports.destroy = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const result = await db.collection("bookings").deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something's wrong with the server, try again later." });
  }
};


