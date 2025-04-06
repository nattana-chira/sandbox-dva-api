import { NextFunction, Request, Response, Router } from 'express';
import { authenticateUser, authUser, authUserId, registerUser } from './auth.service';
import auth from './auth.middleware';
import { upload } from '../../utils/fileUpload';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with required fields (firstName, lastName, email, password) and an optional profilePic.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The user's first name.
 *                 example: Prayut
 *               lastName:
 *                 type: string
 *                 description: The user's last name.
 *                 example: Doe
 *               email:
 *                 type: string
 *                 description: The user's email address.
 *                 example: example@gmail.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: password123
 *               profilePic:
 *                 type: file
 *                 description: The user's profile picture (optional).
 *     responses:
 *       200:
 *         description: Successfully registered user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique identifier of the user.
 *                   example: 1
 *                 firstName:
 *                   type: string
 *                   description: The user's first name.
 *                   example: Nattana
 *                 lastName:
 *                   type: string
 *                   description: The user's last name.
 *                   example: Chirachaithumrongsak
 *                 email:
 *                   type: string
 *                   description: The user's email address.
 *                   example: slendertao@gmail.com
 *                 profilePic:
 *                   type: string
 *                   description: The URL of the user's profile picture.
 *                   example: 'https://example.com/profile.jpg'
 *       400:
 *         description: Invalid input or missing required fields.
 *       500:
 *         description: Internal server error.
 */
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
      firstName: user.firstName,
      lastName: user.lastName,
      profilePic: user.profilePic
    }) 
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: "Authenticate a user and return a JWT token"
 *     description: "This endpoint authenticates the user and returns a JWT token."
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "example@gmail.com"
 *               password:
 *                 type: string
 *                 example: "password1234"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     firstName:
 *                       type: string
 *                       example: "Nattana"
 *                     lastName:
 *                       type: string
 *                       example: "Chirachaithumrongsak"
 *                     email:
 *                       type: string
 *                       example: "slendertao@gmail.com"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXV..."
 *       401:
 *         description: "Invalid credentials"
 *       500:
 *         description: "Internal server error"
 */
router.post('/api/auth/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body
    const { user, token } = await authenticateUser({ email, password })

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

/**
 * @swagger
 * /api/auth/check:
 *   get:
 *     summary: Check authentication status of the user
 *     description: Returns authentication status, auth header, and user info. Requires Bearer token.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Auth Check successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Auth Check successful
 *                 authHeader:
 *                   type: string
 *                   example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *       401:
 *         description: "Invalid credentials"
 *       500:
 *         description: "Internal server error"
 */
router.get('/api/auth/check', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      message: 'Auth Check successful',
      authHeader: req.header('Authorization'),
      user: {
        id: authUserId(res),
        email: authUser(res).email,
        firstName: authUser(res).firstName,
        lastName: authUser(res).lastName
      }
    })
  } catch (error) {
    next(error)
  }
})

export default router