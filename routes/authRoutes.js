const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/authController");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: OTP Authentication APIs
 */

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP to user email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
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
 *     summary: Resend OTP with cooldown and limit
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
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
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
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
 *                 email: test@gmail.com
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
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
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
 *                     email: test@gmail.com
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

module.exports = router;