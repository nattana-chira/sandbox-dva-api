import { NextFunction, Request, Response, Router } from 'express';
import { acceptFriendRequest, getFriends, getPendingFriendRequests, rejectFriendRequest, sendFriendRequest } from './friend.service';
import auth from '../user/auth.middleware';
import { authUserId } from '../user/auth.service';

const router = Router();

router.get('/api/friends', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getFriends({ userId: authUserId(res) })
    res.json(users)

  } catch (error) {
    next(error)
  }
})

router.get('/api/friends/requests', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const friendRequests = await getPendingFriendRequests({ receiverId: authUserId(res) })
    res.json(friendRequests)

  } catch (error) {
    next(error)
  }
})

router.post('/api/friends/requests', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body
    const friendRequest = await sendFriendRequest({ senderId: authUserId(res), email })
    res.json(friendRequest)

  } catch (error) {
    next(error)
  }
})

router.post('/api/friends/requests/:id/accept', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const friendRequest = await acceptFriendRequest({ id, receiverId: authUserId(res) })
    res.json(friendRequest)

  } catch (error) {
    next(error)
  }
})

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