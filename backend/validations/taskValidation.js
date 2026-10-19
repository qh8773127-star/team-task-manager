import z from "zod";

const taskSchema = z.object({
  title: z.string().min(2, "Title is too short"),
  description: z.string().optional(),
  team_id: z.string().uuid("Invalid team ID"),
  assignee_id: z.string().uuid("Invalid assignee ID").optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
});

module.exports = { taskSchema };