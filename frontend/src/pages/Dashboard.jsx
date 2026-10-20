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

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState("");
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

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
    setTasks([]); // Purane tasks clear karein

    if (!teamId) return;

    try {
      const response = await api.get(`/tasks?team_id=${teamId}`);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    try {
      await api.post("/teams", { name: newTeamName });
      const res = await api.get("/teams");
      setTeams(res.data);
      setIsTeamModalOpen(false);
      setNewTeamName("");
    } catch (error) {
      alert("Failed to create team");
      console.error(`Error creating team: ${error.message}`);
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
      alert("Failed to create task");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-600">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Team Task Manager</h1>
        <button
          onClick={handleLogout}
          className="text-red-600 font-medium hover:underline"
        >
          Logout
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT SIDE: TEAMS LIST */}
        <div className="md:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Your Teams</h2>
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              + New
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {teams.map((t) => (
              <div
                key={t.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <h3 className="font-bold text-gray-800">{t.name}</h3>
              </div>
            ))}
            {teams.length === 0 && (
              <p className="text-gray-500 text-sm">No teams yet.</p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: TASKS SECTION */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Tasks</h2>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              disabled={!selectedTeam}
              className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              + Add Task
            </button>
          </div>

          {/* Team Selector Dropdown (Sabse important part) */}
          <select
            onChange={handleTeamSelect}
            value={selectedTeam}
            className="w-full p-2 border rounded-lg mb-4 bg-white"
          >
            <option value="">-- Select a Team to view tasks --</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Task List */}
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <h3 className="font-bold text-gray-800">{task.title}</h3>
                <p className="text-gray-500 text-sm">{task.description}</p>
                <span className="text-xs font-bold text-blue-600 mt-2 inline-block">
                  {task.status}
                </span>
              </div>
            ))}
            {selectedTeam && tasks.length === 0 && (
              <p className="text-gray-500 text-sm">
                No tasks in this team yet.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* CREATE TEAM MODAL */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="font-bold mb-4">Create Team</h3>
            <form onSubmit={handleCreateTeam}>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-full border p-2 rounded mb-4"
                placeholder="Team Name"
                required
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsTeamModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="font-bold mb-4">Add New Task</h3>
            <form onSubmit={handleCreateTask}>
              <input
                type="text"
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, title: e.target.value })
                }
                className="w-full border p-2 rounded mb-3"
                placeholder="Task Title"
                required
              />
              <textarea
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, description: e.target.value })
                }
                className="w-full border p-2 rounded mb-4"
                placeholder="Description (optional)"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsTaskModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTask}
                  className="bg-green-600 text-white px-4 py-2 rounded"
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