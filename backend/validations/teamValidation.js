import z from "zod";

const teamSchema = z.object({
  name: z.string().min(2, "Team name is too short"),
});

module.exports = { teamSchema };