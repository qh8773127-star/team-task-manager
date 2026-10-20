const { z } = require('zod');
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format").max(30,"email must be less then 30 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").max(50,"Password must be less then 50 characters"),
});
module.exports = { registerSchema };