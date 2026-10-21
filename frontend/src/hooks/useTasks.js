import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { teamApi, taskApi, authApi } from "../lib/api";

export const useTasks = () => {
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [teamsRes, usersRes] = await Promise.all([
          teamApi.getAll(),
          authApi.getUsers(),
        ]);
        setTeams(teamsRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error(`Failed to load data due to ${error}`)
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- TEAM FUNCTIONS ---
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

  // --- TASK FUNCTIONS ---
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
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  };

  return {
    teams, tasks, users, loading,
    createTeam, deleteTeam,
    fetchTasksByTeam, createTask, deleteTask, updateTaskStatus
  };
};