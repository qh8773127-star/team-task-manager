const { z } = require('zod');

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase() 
    .email("Invalid email format")
    .max(254, "Email must be less than 254 characters"), 

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters"),
});

module.exports = { registerSchema };