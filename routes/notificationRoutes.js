const express = require("express");

const router = express.Router();

const {
  getNotifications,
  markAsRead,
} = require("../controllers/notificationController");

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications of logged-in user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/", getNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.patch("/:id/read", markAsRead);

module.exports = router;