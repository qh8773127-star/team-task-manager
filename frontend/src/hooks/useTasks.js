import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { teamApi, taskApi } from "../lib/api";

export const useTasks = () => {
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const teamsRes = await teamApi.getAll();
        setTeams(teamsRes.data);
      } catch (error) {
        console.error("Failed to load teams:", error);
        toast.error("Failed to load teams");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const createTeam = async (name) => {
    await teamApi.create({ name });
    const res = await teamApi.getAll();
    setTeams(res.data);
  };

  const deleteTeam = async (teamId) => {
    await teamApi.delete(teamId);
    setTeams(teams.filter((t) => t.id !== teamId));
    setTasks(tasks.filter((t) => t.team_id !== teamId));
  };

  const fetchTasksByTeam = async (teamId) => {
    const res = await taskApi.getByTeam(teamId);
    setTasks(res.data);
  };

  const createTask = async (taskData) => {
    await taskApi.create(taskData);
    const res = await taskApi.getByTeam(taskData.team_id);
    setTasks(res.data);
  };

  const deleteTask = async (taskId) => {
    await taskApi.delete(taskId);
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    await taskApi.updateStatus(taskId, newStatus);
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
  };

  const addTeamMember = async (teamId, email) => {
    const res = await teamApi.addMember(teamId, email);
    return res.data;
  };

  const fetchTeamMembers = async (teamId) => {
    const res = await teamApi.getTeamMembers(teamId);
    return res.data;
  };

  return {
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
  };
};
