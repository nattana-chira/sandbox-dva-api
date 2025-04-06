import { NextFunction, Request, Response, Router } from 'express';
import auth from '../user/auth.middleware';
import { authUserId } from '../user/auth.service';
import { getChatMessages } from './chat.services';

const router = Router();

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