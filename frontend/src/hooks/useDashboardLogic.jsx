import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../lib/api";
import { useTasks } from "./useTasks";

export const useDashboardLogic = () => {
  const navigate = useNavigate();
  const {
    teams,
    tasks,
    loading,
    createTeam,
    deleteTeam,
    fetchTasksByTeam,
    createTask,
    deleteTask,
    updateTaskStatus,
    addTeamMember,
    fetchTeamMembers,
  } = useTasks();

  const [selectedTeam, setSelectedTeam] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const[addMemberLoading,setAddMemberLoading]=useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  const [isFetchingTasks, setIsFetchingTasks] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

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
    setTeamMembers([]);
    return;
  }
  setIsFetchingTasks(true);
  try {
    await fetchTasksByTeam(teamId);
    const members = await fetchTeamMembers(teamId);
    setTeamMembers(members);
  } catch (error) {
    console.error("Error fetching team data:", error);
    toast.error("Failed to load team details");
  } finally {
    setIsFetchingTasks(false);
  }
};

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedTeam || !newMemberEmail.trim()) return;

    setAddMemberLoading(true);
    try {
      await addTeamMember(selectedTeam, newMemberEmail);
      toast.success("Member added!");
      setNewMemberEmail("");

      const updatedMembers = await fetchTeamMembers(selectedTeam);
      setTeamMembers(updatedMembers);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add member");
    }finally{
      setAddMemberLoading(false);
    }
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
      console.error(`Failed to create team due to ${error}`);
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
      console.error(`Failed to create task due to ${error}`);
      toast.error("Failed to create task");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success("Status updated");
    } catch (error) {
      console.error(`Failed to update task due to ${error}`);
      toast.error("Failed to update task");
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDeleteTask = (taskId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 p-2">
          <p className="font-medium text-gray-800">Delete this task?</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-sm bg-gray-100 rounded-md"
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
                  console.error(`Failed to delete task: ${error}`);
                  toast.error("Failed to delete task");
                }
              }}
              className="px-3 py-1.5 text-sm text-white bg-red-600 rounded-md"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: 6000, position: "top-center" },
    );
  };

  const handleDeleteTeam = (teamId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 p-2">
          <p className="font-medium text-gray-800">
            Delete this team and all its tasks?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-sm bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteTeam(teamId);
                  if (selectedTeam === teamId) setSelectedTeam("");
                  toast.success("Team deleted");
                } catch (error) {
                  console.error(`Failed to delete team: ${error}`);
                  toast.error("Failed to delete team");
                }
              }}
              className="px-3 py-1.5 text-sm text-white bg-red-600 rounded-md"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: 6000, position: "top-center" },
    );
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesAssignee = assigneeFilter
      ? task.assignee_id?.toLowerCase() === assigneeFilter.toLowerCase()
      : true;
    return matchesSearch && matchesAssignee;
  });

  return {
    teams,
    loading,
    teamMembers,
    selectedTeam,
    newMemberEmail,
    searchQuery,
    setSearchQuery,
    assigneeFilter,
    setAssigneeFilter,
    isFetchingTasks,
    isCreatingTeam,
    isCreatingTask,
    isTeamModalOpen,
    setIsTeamModalOpen,
    newTeamName,
    setNewTeamName,
    isTaskModalOpen,
    setIsTaskModalOpen,
    taskForm,
    setTaskForm,
    filteredTasks,
    handleTeamSelect,
    handleAddMember,
    handleCreateTeam,
    handleCreateTask,
    handleDeleteTask,
    handleUpdateStatus,
    handleDeleteTeam,
    handleLogout,
    setNewMemberEmail,
    addMemberLoading
  };
};
