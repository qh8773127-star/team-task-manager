import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";

const Dashboard = () => {
  const navigate = useNavigate();

  //Add Task
  const [selectedTeam, setSelectedTeam] = useState("");
  const [tasks, setTasks] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "" });
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  //Add Team
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState("");
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isFetchingTasks, setIsFetchingTasks] = useState(false);

  //   search
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await api.get("/teams");
        setTeams(response.data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  const handleTeamSelect = async (e) => {
    const teamId = e.target.value;
    setSelectedTeam(teamId);
    setTasks([]);

    if (!teamId) return;

    setIsFetchingTasks(true);
    try {
      const response = await api.get(`/tasks?team_id=${teamId}`);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsFetchingTasks(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setIsCreatingTeam(true);
    if (!newTeamName.trim()) return;
    try {
      await api.post("/teams", { name: newTeamName });
      const res = await api.get("/teams");
      setTeams(res.data);
      setIsTeamModalOpen(false);
      setNewTeamName("");
    } catch (error) {
      //   alert("Failed to create team");
      console.error(`Error creating team: ${error.message}`);
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedTeam) return alert("Please select a team first!");
    if (!taskForm.title.trim()) return;

    setIsCreatingTask(true);
    try {
      await api.post("/tasks", {
        title: taskForm.title,
        description: taskForm.description,
        team_id: selectedTeam,
      });

      const res = await api.get(`/tasks?team_id=${selectedTeam}`);
      setTasks(res.data);

      setIsTaskModalOpen(false);
      setTaskForm({ title: "", description: "" });
    } catch (error) {
      //   alert("Failed to create task");
      console.error(`Error creating task: ${error.message}`);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      // Delete hone ke baad list se hata dein
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      alert("Failed to delete task");
      console.error("Error deleting task:", error);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      // State update karein
      setTasks(
        tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
      );
    } catch (error) {
      alert("Failed to update task");
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this team? All tasks inside will be lost.",
      )
    )
      return;

    try {
      await api.delete(`/teams/${teamId}`);
      // Team list update karein
      setTeams(teams.filter((t) => t.id !== teamId));

      // Agar deleted team currently selected thi, toh dropdown reset karein
      if (selectedTeam === teamId) {
        setSelectedTeam("");
        setTasks([]);
      }
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete team");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-600">
          Loading Dashboard...
        </div>
      </div>
    );
  }
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm px-4 py-3 md:px-6 md:py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-lg md:text-xl font-bold text-gray-800">
          Team Task Manager
        </h1>
        <button
          onClick={handleLogout}
          className="text-sm md:text-base text-red-600 font-medium hover:underline"
        >
          Logout
        </button>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT SIDE: TEAMS LIST */}
        <div className="md:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Your Teams</h2>
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
            >
              + New
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3">
              {teams.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center group"
                >
                  <h3 className="font-bold text-gray-800">{t.name}</h3>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteTeam(t.id)}
                    className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Team"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              {teams.length === 0 && (
                <p className="text-gray-500 text-sm">
                  No teams yet. Create one!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: TASKS SECTION */}
        <div className="md:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-lg font-bold text-gray-800">Tasks</h2>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              disabled={!selectedTeam}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add Task
            </button>
          </div>

          {/* Dropdown */}
          <select
            onChange={handleTeamSelect}
            value={selectedTeam}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select a Team to view tasks --</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search tasks by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg mb-4"
          />

          <div className="flex flex-col gap-3">
            {isFetchingTasks ? (
              <div className="flex items-center justify-center gap-3 py-10 bg-white rounded-lg border border-gray-200 shadow-sm">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></span>
                <span className="text-gray-500 font-medium">
                  Loading tasks...
                </span>
              </div>
            ) : selectedTeam && tasks.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                No tasks in this team yet.
              </p>
            ) : selectedTeam && filteredTasks.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                No tasks found.
              </p>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">{task.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {task.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {/* Status Dropdown (Update ke liye) */}
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleUpdateStatus(task.id, e.target.value)
                        }
                        className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded cursor-pointer outline-none"
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="DONE">DONE</option>
                      </select>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-xs text-red-600 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* CREATE TEAM MODAL */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">Create Team</h3>
            <form onSubmit={handleCreateTeam}>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Team Name"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  disabled={isCreatingTeam}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTeam}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCreatingTeam ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">Add New Task</h3>
            <form onSubmit={handleCreateTask}>
              <input
                type="text"
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, title: e.target.value })
                }
                className="w-full border border-gray-300 p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Task Title"
                required
              />
              <textarea
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, description: e.target.value })
                }
                className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Description (optional)"
                rows="3"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  disabled={isCreatingTask}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTask}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isCreatingTask ? "Saving..." : "Save Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
