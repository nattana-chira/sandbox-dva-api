import { NextFunction, Request, Response, Router } from 'express';
import { acceptFriendRequest, getFriends, getPendingFriendRequests, rejectFriendRequest, sendFriendRequest } from './friend.service';
import auth from '../user/auth.middleware';
import { authUserId } from '../user/auth.service';

const router = Router();

/**
 * @swagger
 * /api/friends:
 *   get:
 *     summary: Get all friends of the authenticated user
 *     description: Returns a list of users who are friends with the currently authenticated user. Requires Bearer token.
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of friends
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   firstName:
 *                     type: string
 *                     example: Nattana
 *                   lastName:
 *                     type: string
 *                     example: Chirachaithumrongsak
 *                   email:
 *                     type: string
 *                     example: slendertao@gmail.com
 *                   profilePic:
 *                     type: string
 *                     example: https://example.com/avatar.jpg
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
router.get('/api/friends', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getFriends({ userId: authUserId(res) })
    res.json(users)

  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/friends/requests:
 *   get:
 *     summary: Get all friend requests for the authenticated user
 *     description: Returns a list of friend requests sent to the authenticated user. Requires Bearer token.
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of friend requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   senderId:
 *                     type: integer
 *                     example: 2
 *                   receiverId:
 *                     type: integer
 *                     example: 1
 *                   status:
 *                     type: string
 *                     enum: [pending, accepted, rejected]
 *                     example: pending
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
router.get('/api/friends/requests', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const friendRequests = await getPendingFriendRequests({ receiverId: authUserId(res) })
    res.json(friendRequests)

  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/friends/requests:
 *   post:
 *     summary: Send a friend request by email
 *     description: Sends a friend request to the user with the provided email. Requires Bearer token.
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
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
 *                 format: email
 *                 example: friend@example.com
 *     responses:
 *       200:
 *         description: Friend request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 senderId:
 *                   type: integer
 *                   example: 2
 *                 receiverId:
 *                   type: integer
 *                   example: 3
 *                 status:
 *                   type: string
 *                   enum: [pending]
 *                   example: pending
 *       400:
 *         description: Bad request (e.g., user not found or already friends)
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
router.post('/api/friends/requests', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body
    const friendRequest = await sendFriendRequest({ senderId: authUserId(res), email })
    res.json(friendRequest)

  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/friends/requests/{id}/accept:
 *   post:
 *     summary: Accept a friend request
 *     description: Accepts a friend request by ID. Requires Bearer token authentication.
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the friend request to accept
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Friend request accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 senderId:
 *                   type: integer
 *                   example: 2
 *                 receiverId:
 *                   type: integer
 *                   example: 3
 *                 status:
 *                   type: string
 *                   enum: [pending, accepted, rejected]
 *                   example: accepted
 *       400:
 *         description: Bad request (e.g., already accepted or invalid request ID)
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Friend request not found
 */
router.post('/api/friends/requests/:id/accept', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const friendRequest = await acceptFriendRequest({ id, receiverId: authUserId(res) })
    res.json(friendRequest)

  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/friends/requests/{id}/reject:
 *   post:
 *     summary: Reject a friend request
 *     description: Rejects a friend request by ID. Requires Bearer token authentication.
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the friend request to reject
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Friend request rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 senderId:
 *                   type: integer
 *                   example: 2
 *                 receiverId:
 *                   type: integer
 *                   example: 3
 *                 status:
 *                   type: string
 *                   enum: [rejected]
 *                   example: rejected
 *       400:
 *         description: Bad request (e.g., already rejected or invalid request ID)
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Friend request not found
 */
router.post('/api/friends/requests/:id/reject', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const friendRequest = await rejectFriendRequest({ id, receiverId: authUserId(res) })
    res.json(friendRequest)
    
  } catch (error) {
    next(error)
  }
})

export default router