import { z } from 'zod';

// lab name
export const labNameSchema = z
.string()
.min(3, "Lab name must be at least 3 characters.")
.max(50, "Lab name must not exceed 50 characters.")
.regex(
  /^[a-zA-Z0-9_-][a-zA-Z0-9 _-]*[a-zA-Z0-9_-]$/,
  "Lab name must only contain letters, numbers, spaces, underscores and dashes and must not start or end with a space."
)
.trim();

//lab description
export const labDescriptionSchema = z
  .string()
  .max(
    1000,
    "Lab description must not exceed 1000 characters. Wanna write more? Add wiki page and link here."
  );