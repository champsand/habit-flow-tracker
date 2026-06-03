const HABIT_TYPES = ["checklist", "frequency", "duration"];
const HABIT_CATEGORIES = ["good", "bad"];

function toHabitResponse(habit) {
  if (!habit) {
    return null;
  }

  return {
    id: habit.id,
    userId: habit.userId,
    name: habit.name,
    type: habit.type,
    category: habit.category,
    weeklyTarget: habit.weeklyTarget,
    isActive: habit.isActive,
    createdAt: habit.createdAt,
    updatedAt: habit.updatedAt
  };
}

module.exports = {
  HABIT_TYPES,
  HABIT_CATEGORIES,
  toHabitResponse
};
