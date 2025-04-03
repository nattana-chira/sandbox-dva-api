import { NextFunction, Request, Response, Router } from 'express';
import { acceptFriendRequest, getFriends, rejectFriendRequest, sendFriendRequest } from './friend.service';
import auth from '../user/auth.middleware';
import { authUserId } from '../user/auth.service';

const router = Router();

router.get('/api/friends', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const friends = await getFriends({ userId: authUserId(res) })

    res.json(friends.map(friend => ({
      id: friend.id,
      email: friend.email
    })))
  } catch (error) {
    next(error)
  }
})

router.post('/api/friends/requests', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { receiverId } = req.body
    const friendRequest = await sendFriendRequest({ senderId: authUserId(res), receiverId })

    res.json({
      id: friendRequest.id,
      senderId: friendRequest.senderId,
      receiverId: friendRequest.receiverId,
      status: friendRequest.status
    })
  } catch (error) {
    next(error)
  }
})

router.post('/api/friends/requests/:id/accept', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const friendRequest = await acceptFriendRequest({ id, receiverId: authUserId(res) })

    res.json({
      id: friendRequest.id,
      senderId: friendRequest.senderId,
      receiverId: friendRequest.receiverId,
      status: friendRequest.status
    })
  } catch (error) {
    next(error)
  }
})

router.post('/api/friends/requests/:id/reject', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const friendRequest = await rejectFriendRequest({ id, receiverId: authUserId(res) })

    res.json({
      id: friendRequest.id,
      senderId: friendRequest.senderId,
      receiverId: friendRequest.receiverId,
      status: friendRequest.status
    })
  } catch (error) {
    next(error)
  }
})

export default router