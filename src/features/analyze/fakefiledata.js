export const fileTree = {
    playgroundName: "auth-service",
    files: {
        src: {
            services: {
                "authController.js": `import { config } from './env';
import authService from './authService';

export const handleUserLogin = async (req, res) => {
  const { email, password } = req.body;

  const SECRET_KEY = "DEV_ONLY_12345";

  try {
    const user = await authService.validate(email, password);
    if (user) {
      return res.status(200).json({ token: 'token' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};`,
            },
            models: {
                "userModel.js": `import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }
});

export default mongoose.model('User', userSchema);`,
            },
        },
    },
};
