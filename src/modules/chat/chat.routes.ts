import { NextFunction, Request, Response, Router } from 'express';
import auth from '../user/auth.middleware';
import { authUserId } from '../user/auth.service';
import { getChatMessages } from './chat.services';

const router = Router();

/**
 * @swagger
 * /api/chats/messages:
 *   get:
 *     summary: "Get chat messages from a friend"
 *     description: "This endpoint retrieves chat messages between the authenticated user and a friend identified by email."
 *     tags:
 *       - Chats
 *     security:
 *       - bearerAuth: []  # Use Bearer token authentication
 *     parameters:
 *       - name: friendUserId
 *         in: query
 *         description: "The userId of the friend to retrieve chat messages for"
 *         required: true
 *         schema:
 *           type: string
 *           example: "1"
 *     responses:
 *       200:
 *         description: "A list of chat messages between the authenticated user and the friend."
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 9
 *                   chatId:
 *                     type: integer
 *                     example: 1
 *                   senderId:
 *                     type: integer
 *                     example: 1
 *                   content:
 *                     type: string
 *                     example: "hi1"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-04-05T14:52:32.949Z"
 *       401:
 *         description: "Unauthorized - Invalid or missing Bearer token"
 *       404:
 *         description: "Not Found - Friend not found or no messages with the given friend"
 *       500:
 *         description: "Internal server error"
 */
router.get('/api/chats/messages', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { friendUserId } = req.query as { friendUserId: string }
    const messages = await getChatMessages({ senderId: authUserId(res), receiverId: friendUserId })
    res.json(messages)
    
  } catch (error) {
    next(error)
  }
})

export default router