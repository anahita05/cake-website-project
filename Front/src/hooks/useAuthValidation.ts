import { z } from "zod";


export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("The email format is incorrect.")
    .max(254, "The email is too long."),

  password: z
    .string()
    .min(1, "Password is required.")
    .min(8, "Password must be at least 8 characters"),

  rememberMe: z.boolean(),
});

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Name is required.")
      .min(2, "Name must be at least 2 characters long.")
      .max(60, "The name is too long")
      .regex(/^[a-zA-Zآ-ی\s]+$/, "Name can only contain letters"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Email format is incorrect")
      .max(254, "The email is too long"),

    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long")
      .regex(/[A-Z]/, "It must have at least one capital letter")
      .regex(/[0-9]/, "Must have at least one number"),

    confirmPassword: z.string().min(1, "Password repetition is required"),

    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, "Acceptance of the rules is mandatory"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginSchema = z.infer<typeof loginSchema>;
export type SignupSchema = z.infer<typeof signupSchema>;
