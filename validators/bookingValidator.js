const { body } = require("express-validator");
const { getDB } = require("../database/database");
const { ObjectId } = require("mongodb");

/**
 * createBookingRules
 *
 * Description:
 * - Validation rules for creating a new booking using `express-validator`.
 * - Ensures all required fields are present, properly formatted, and logically valid.
 *
 * Validations:
 * - unitId (string, required): Must not be empty.
 * - roomId (string, required): Must not be empty.
 * - date (string, required): Must be a valid ISO8601 date (e.g., "2025-09-22").
 * - startTime (string, required): Must match 24-hour format "HH:MM" (e.g., "17:30").
 * - endTime (string, required): Must match 24-hour format "HH:MM" (e.g., "17:30").
 * - participants (integer, required): Must be an integer greater than 0.
 *
 * Custom Validations:
 * - Ensures startTime is earlier than endTime.
 * - Checks that the specified room exists within the given unitId.
 * - Validates that participants do not exceed the room's capacity.
 * - Ensures no existing booking overlaps with the requested room, date, and time range.
 *
 * Usage:
 * - Apply to POST routes that handle booking creation.
 * - Use `validationResult` in the controller to capture and return validation errors.
 */
exports.createBookingRules = [
  body("unitId").notEmpty().withMessage("unitId is required"),
  body("roomId").notEmpty().withMessage("roomId is required"),
  body("date").isISO8601().withMessage("date is not valid (e.g., '2025-09-22')"),
  body("startTime").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("startTime format is HH:MM (e.g., '17:30')"),
  body("endTime").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("enndTime format is HH:MM (e.g., '17:30')"),
  body("participants").isInt({ gt: 0 }).withMessage("participants must be > 0"),

  body().custom(({ startTime, endTime }) => {
    if (startTime >= endTime) throw new Error("Start time cannot be greater than end time");
    return true;
  }),

  body().custom(async ({ roomId, unitId, participants  }) => {
    const db = getDB();
    const room = await db.collection("rooms").findOne({ _id: new ObjectId(roomId), unitId: new ObjectId(unitId)});
    if (!room) throw new Error("Room not found");
    
    if (participants > room.capacity) throw new Error(`number of participants exceeds room capacity, room capacity is (${room.capacity})`);
    return true;
  }),

  body().custom(async ({ roomId, date, startTime, endTime }) => {
    const db = getDB();    
    const conflict = await db.collection("bookings").findOne({
      roomId: new ObjectId(roomId),
      date,
      $and: [
        { startTime: { $lt: endTime } },
        { endTime:   { $gt: startTime } }
      ]
    });
    
    if (conflict) {
      throw new Error(
        "Meeting room is already booked on the same schedule, choose other room or schedule"
      );
    }

    return true;
  })

];

/**
 * updateBookingRules
 *
 * Description:
 * - Validation rules for updating an existing booking using `express-validator`.
 * - Allows optional fields but enforces correct formats and logical consistency.
 *
 * Validations:
 * - unitId (string, optional): Must not be empty if provided.
 * - roomId (string, optional): Must not be empty if provided.
 * - date (string, optional): Must be a valid ISO8601 date (e.g., "2025-09-22").
 * - startTime (string, optional): Must match 24-hour format "HH:MM" (e.g., "17:30").
 * - endTime (string, optional): Must match 24-hour format "HH:MM" (e.g., "17:30").
 * - participants (integer, optional): Must be an integer greater than 0 if provided.
 *
 * Custom Validations:
 * - Ensures startTime is earlier than endTime when both are provided.
 * - If roomId or participants are supplied, checks that the room exists and that participants do not exceed its capacity.
 * - Prevents scheduling conflicts by ensuring no other booking overlaps with the updated room, date, and time range (excluding the current booking).
 *
 * Usage:
 * - Apply to PATCH routes that handle booking updates.
 * - Use `validationResult` in the controller to capture and return validation errors.
 */
exports.updateBookingRules = [
  body("unitId").optional().notEmpty().withMessage("unitId is required"),
  body("roomId").optional().notEmpty().withMessage("roomId is required"),
  body("date").optional().isISO8601().withMessage("date is not valid (e.g., '2025-09-22')"),
  body("startTime").optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("startTime format is HH:MM (e.g., '17:30')"),
  body("endTime").optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("enndTime format is HH:MM (e.g., '17:30')"),
  body("participants").optional().isInt({ gt: 0 }).withMessage("participants must be > 0"),

  body().custom(({ startTime, endTime }) => {
    if (startTime && endTime && startTime >= endTime) {
      throw new Error("Start time cannot be greater than end time");
    }
    return true;
  }),

  body().custom(async ({ roomId, participants }) => {
    if (!roomId && !participants) return true;
    const db = getDB();
    const room = await db.collection("rooms").findOne({ _id: new ObjectId(roomId) });
    if (!room) throw new Error("Room not found");
    if (participants && participants > room.capacity) {
      throw new Error(`number of participants exceeds room capacity, room capacity is (${room.capacity})`);
    }
    return true;
  }),

  body().custom(async ({ roomId, date, startTime, endTime }, { req }) => {
    if (!roomId && !date && !startTime && !endTime) return true;
    const db = getDB();

    const bookingId = req.params.id;
    const currentBooking = await db.collection("bookings").findOne({ _id: new ObjectId(bookingId) });
    if (!currentBooking) throw new Error("Booking not found");

    const newRoom = roomId ? new ObjectId(roomId) : currentBooking.roomId;
    const newDate = date || currentBooking.date;
    const newStart = startTime || currentBooking.startTime;
    const newEnd = endTime || currentBooking.endTime;

    const conflict = await db.collection("bookings").findOne({
      _id: { $ne: new ObjectId(bookingId) },
      roomId: newRoom,
      date: newDate,
      $and: [
        { startTime: { $lt: newEnd } },
        { endTime: { $gt: newStart } }
      ]
    });

    if (conflict) throw new Error("Meeting room is already booked on the same schedule, choose other room or schedule");
    return true;
  })
];
