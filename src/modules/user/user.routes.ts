import { NextFunction, Request, Response, Router } from 'express';
import { createUser } from './user.service';
import { authenticateUser, authUser, authUserId } from './auth.service';
import auth from './auth.middleware';

const router = Router();

router.post('/api/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, profilePic } = req.body
    const user = await createUser({ email, password, profilePic })

    res.json({
      id: user.id,
      email: user.email,
      profilePic: user.profilePic
    })
  } catch (error) {
    next(error)
  }
})

router.post('/api/auth/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body
    const { user, token } = await authenticateUser({ email, password });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email
      },
      token
    })
  } catch (error) {
    next(error)
  }
})
 
router.get('/api/auth/check', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      message: 'Auth Check successful',
      authHeader: req.header('Authorization'),
      user: {
        id: authUserId(res),
        email: authUser(res).email,
        authUser: authUser(res)
      }
    })
  } catch (error) {
    next(error)
  }
})

export default router