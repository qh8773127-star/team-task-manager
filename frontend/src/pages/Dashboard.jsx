import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import toast from "react-hot-toast";
import CreateTeamModal from "../components/CreateTeamModal";
import CreateTaskModal from "../components/CreateTaskModal";
import TaskCard from "../components/TaskCard";

const Dashboard = () => {
  const navigate = useNavigate();

  // 1. DATA STATES
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. FILTER STATES
  const [selectedTeam, setSelectedTeam] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  // 3. LOADING STATES
  const [isFetchingTasks, setIsFetchingTasks] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // 4. MODAL STATES
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignee_id: "",
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const teamsRes = await api.get("/teams");
        setTeams(teamsRes.data);

        const usersRes = await api.get("/auth/users");
        setUsers(usersRes.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchData();
  }, []);

  // FETCH TEAMS ON LOAD

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await api.get("/teams");
        setTeams(response.data);
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast.error("Failed to load teams");
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  // HANDLE TEAM SELECT & FETCH TASKS
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
      toast.error("Failed to load tasks");
    } finally {
      setIsFetchingTasks(false);
    }
  };

  // CREATE TEAM
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setIsCreatingTeam(true);
    try {
      await api.post("/teams", { name: newTeamName });
      const res = await api.get("/teams");
      setTeams(res.data);
      setIsTeamModalOpen(false);
      setNewTeamName("");
      toast.success("Team created!");
    } catch (error) {
      toast.error("Failed to create team");
      console.error(`Error creating team: ${error.message}`);
    } finally {
      setIsCreatingTeam(false);
    }
  };

  // CREATE TASK
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedTeam) return toast.error("Please select a team first!");
    if (!taskForm.title.trim()) return;

    setIsCreatingTask(true);
    try {
      await api.post("/tasks", {
        title: taskForm.title,
        description: taskForm.description,
        team_id: selectedTeam,
        assignee_id: taskForm.assignee_id || null, // 👈 Assignee backend ko bheja
      });

      const res = await api.get(`/tasks?team_id=${selectedTeam}`);
      setTasks(res.data);

      setIsTaskModalOpen(false);
      setTaskForm({ title: "", description: "", assignee_id: "" });
      toast.success("Task created!");
    } catch (error) {
      toast.error("Failed to create task");
      console.error(`Error creating task: ${error.message}`);
    } finally {
      setIsCreatingTask(false);
    }
  };

  // DELETE TASK
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t.id !== taskId));
      toast.success("Task deleted");
    } catch (error) {
      console.error(`Error deleting task: ${error.message}`);
      toast.error("Failed to delete task");
    }
  };

  // UPDATE TASK STATUS
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(
        tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
      );
      toast.success("Status updated");
    } catch (error) {
      console.error(`Error updating task status: ${error.message}`);
      toast.error("Failed to update task");
    }
  };

  // DELETE TEAM
  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure? All tasks inside will be lost.")) return;

    try {
      await api.delete(`/teams/${teamId}`);
      setTeams(teams.filter((t) => t.id !== teamId));
      if (selectedTeam === teamId) {
        setSelectedTeam("");
        setTasks([]);
      }
      toast.success("Team deleted");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete team");
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // FILTER LOGIC
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesAssignee = assigneeFilter
      ? task.assignee_id?.toLowerCase() === assigneeFilter.toLowerCase()
      : true;
    return matchesSearch && matchesAssignee;
  });

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
            {teams.map((t) => (
              <div
                key={t.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center group"
              >
                <h3 className="font-bold text-gray-800">{t.name}</h3>
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
              <p className="text-gray-500 text-sm">No teams yet. Create one!</p>
            )}
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

          {/* TEAM SELECTOR */}
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

          {/* FILTERS: Search & Assignee Dropdown */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search tasks by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-700"
            >
              <option value="">All Assignees</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* TASK LIST */}
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
                No tasks found matching your filters.
              </p>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDeleteTask}
                  users={users}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* MODALS */}
      <CreateTeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        newTeamName={newTeamName}
        setNewTeamName={setNewTeamName}
        isCreatingTeam={isCreatingTeam}
        onSubmit={handleCreateTeam}
      />
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskForm={taskForm}
        setTaskForm={setTaskForm}
        isCreatingTask={isCreatingTask}
        onSubmit={handleCreateTask}
        users={users}
      />
    </div>
  );
};
export default Dashboard;