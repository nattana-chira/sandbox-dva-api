import { NextFunction, Request, Response, Router } from 'express';
import { authenticateUser, authUser, authUserId, registerUser } from './auth.service';
import auth from './auth.middleware';
import { upload } from '../../utils/fileUpload';

const router = Router();

router.post(
  '/api/auth/register', 
  upload.single("file"), 
  async (req: Request, res: Response, next: NextFunction
) => {
  try {
    const profilePic = req.file ? `/uploads/${req.file.filename}` : null;
    const { firstName, lastName, email, password } = req.body
    const user = await registerUser({ firstName, lastName, email, password, profilePic })

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
        firstName: user.firstName,
        lastName: user.lastName,
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