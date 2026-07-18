const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/authController");
const {saveFcmToken} = require("../controllers/authController");

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP to user email or phone number
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contact
 *             properties:
 *               contact:
 *                 type: string
 *                 example: user@example.com or +1234567890
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: OTP sent
 *               expiresIn: 300
 */
router.post("/send-otp", controller.sendOtp);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP to user email or phone number
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contact
 *             properties:
 *               contact:
 *                 type: string
 *                 example: user@example.com or +1234567890
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: OTP resent
 *               expiresIn: 300
 *       400:
 *         description: Cooldown or max resend reached
 */
router.post("/resend-otp", controller.resendOtp);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contact
 *               - otp
 *             properties:
 *               contact:
 *                 type: string
 *                 example: user@example.com or +1234567890
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified and user logged in
 *         content:
 *           application/json:
 *             example:
 *               token: jwt_token_here
 *               user:
 *                 email: user@example.com
 *                 phone: null
 *                 isVerified: true
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify-otp", controller.verifyOtp);

/**
 * @swagger
 * /api/auth/auto-login:
 *   post:
 *     summary: Auto login if user session exists (not logged out)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contact
 *             properties:
 *               contact:
 *                 type: string
 *                 example: user@example.com or +1234567890
 *     responses:
 *       200:
 *         description: Auto login success or OTP required
 *         content:
 *           application/json:
 *             examples:
 *               success:
 *                 value:
 *                   token: jwt_token_here
 *                   user:
 *                     email: user@example.com
 *               otpRequired:
 *                 value:
 *                   message: OTP required
 */
router.post("/auto-login", controller.autoLogin);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (invalidate session)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", auth, controller.logout);

/**
 * @swagger
 * /api/auth/save-fcm-token:
 *   post:
 *     summary: Save FCM Token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token saved
 */
router.post("/save-fcm-token", auth, saveFcmToken);

module.exports = router;