const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const controller = require("../controllers/messageController");

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Message APIs
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *                 example: 665f1f77c8c98a1e20f12345
 *               content:
 *                 type: string
 *                 example: Hello
 *               messageType:
 *                 type: string
 *                 example: text
 *               mediaUrl:
 *                 type: string
 *                 example: ""
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post("/", auth, controller.sendMessage);

/**
 * @swagger
 * /api/messages/{chatId}:
 *   get:
 *     summary: Get messages of chat
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Messages fetched
 */
router.get("/:chatId", auth, controller.getMessages);

/**
 * @swagger
 * /api/messages/seen/{messageId}:
 *   put:
 *     summary: Mark message as seen
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message marked as seen
 */
router.put(
  "/seen/:messageId",
  auth,
  controller.markAsSeen
);

/**
 * @swagger
 * /api/messages/{messageId}:
 *   put:
 *     summary: Edit message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: Edited message
 *     responses:
 *       200:
 *         description: Message edited
 */
router.put(
  "/:messageId",
  auth,
  controller.editMessage
);

/**
 * @swagger
 * /api/messages/{messageId}:
 *   delete:
 *     summary: Delete message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted
 */
router.delete(
  "/:messageId",
  auth,
  controller.deleteMessage
);

module.exports = router;