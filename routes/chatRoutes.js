const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const controller = require("../controllers/chatController");

/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Chat APIs
 */

/**
 * @swagger
 * /api/chats:
 *   post:
 *     summary: Access or create one-to-one chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 665f1f77c8c98a1e20f12345
 *     responses:
 *       200:
 *         description: Existing chat returned
 *       201:
 *         description: New chat created
 */
router.post("/", auth, controller.accessChat);

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: Get all chats
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chats fetched successfully
 */
router.get("/", auth, controller.getChats);

/**
 * @swagger
 * /api/chats/{chatId}:
 *   get:
 *     summary: Get single chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat fetched successfully
 */
router.get("/:chatId", auth, controller.getSingleChat);

/**
 * @swagger
 * /api/chats/group:
 *   post:
 *     summary: Create group chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupName:
 *                 type: string
 *                 example: Developers
 *               users:
 *                 type: string
 *                 example: "[\"665f1f77c8c98a1e20f12345\",\"665f1f77c8c98a1e20f67890\"]"
 *     responses:
 *       201:
 *         description: Group created successfully
 */
router.post(
  "/group",
  auth,
  controller.createGroupChat
);

module.exports = router;