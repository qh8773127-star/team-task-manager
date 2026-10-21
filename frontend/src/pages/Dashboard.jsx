import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CreateTeamModal from "../components/CreateTeamModal";
import CreateTaskModal from "../components/CreateTaskModal";
import TaskCard from "../components/TaskCard";
import Navbar from "../components/Navbar";
import { authApi } from "../lib/api";
import { useTasks } from "../hooks/useTasks";

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    teams,
    tasks,
    users,
    loading,
    createTeam,
    deleteTeam,
    fetchTasksByTeam,
    createTask,
    deleteTask,
    updateTaskStatus,
  } = useTasks();

  const [selectedTeam, setSelectedTeam] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  // UI Loading States
  const [isFetchingTasks, setIsFetchingTasks] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Modal States
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignee_id: "",
  });

  const handleTeamSelect = async (e) => {
    const teamId = e.target.value;
    setSelectedTeam(teamId);

    if (!teamId) {
      return;
    }

    setIsFetchingTasks(true);
    await fetchTasksByTeam(teamId);
    setIsFetchingTasks(false);
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setIsCreatingTeam(true);
    try {
      await createTeam(newTeamName);
      setIsTeamModalOpen(false);
      setNewTeamName("");
      toast.success("Team created!");
    } catch (error) {
      console.error(`ailed to create task dur to ${error}`);
      toast.error("Failed to create team");
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedTeam) return toast.error("Please select a team first!");
    if (!taskForm.title.trim()) return;

    setIsCreatingTask(true);
    try {
      await createTask({
        title: taskForm.title,
        description: taskForm.description,
        team_id: selectedTeam,
        assignee_id: taskForm.assignee_id || null,
      });

      setIsTaskModalOpen(false);
      setTaskForm({ title: "", description: "", assignee_id: "" });
      toast.success("Task created!");
    } catch (error) {
      console.error(`ailed to create task dur to ${error}`);
      toast.error("Failed to create task");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleDeleteTask = (taskId) => {
    toast.dismiss();
    toast(
      (t) => (
        <div className="flex flex-col gap-3 p-2">
          <p className="font-medium text-gray-800">
            Are you sure you want to delete this task?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteTask(taskId);
                  toast.success("Task deleted");
                } catch (error) {
                  console.error(`Failed to delete task ${error}`);
                  toast.error("Failed to delete task");
                }
              }}
              className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: 6000,
        position: "top-center",
      },
    );
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success("Status updated");
    } catch (error) {
      console.error(`ailed to create task dur to ${error}`);
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTeam = (teamId) => {
    toast.dismiss();
    toast(
      (t) => (
        <div className="flex flex-col gap-3 p-2">
          <p className="font-medium text-gray-800">
            Are you sure you want to delete this team? All tasks inside will be
            lost.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteTeam(teamId);
                  if (selectedTeam === teamId) {
                    setSelectedTeam("");
                  }
                  toast.success("Team deleted");
                } catch (error) {
                  toast.error(
                    error.response?.data?.error || "Failed to delete team",
                  );
                }
              }}
              className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: 6000,
        position: "top-center",
      },
    );
  };
  const handleLogout = async () => {
    try {
      await authApi.logout();
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* NAVBAR */}
      <Navbar onLogout={handleLogout} />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
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
