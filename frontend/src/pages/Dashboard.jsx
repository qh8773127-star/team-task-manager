import CreateTeamModal from "../components/CreateTeamModal";
import CreateTaskModal from "../components/CreateTaskModal";
import TaskCard from "../components/TaskCard";
import Navbar from "../components/Navbar";
import { useDashboardLogic } from "../hooks/useDashboardLogic";

const Dashboard = () => {
  const {
    teams,
    loading,
    teamMembers,
    selectedTeam,
    newMemberEmail,
    setNewMemberEmail,
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
    addMemberLoading,
  } = useDashboardLogic();

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
      <Navbar onLogout={handleLogout} />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Your Teams</h2>
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium"
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
                  className="text-gray-400 hover:text-red-600 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
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
        <div className="md:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-lg font-bold text-gray-800">Tasks</h2>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              disabled={!selectedTeam}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              + Add Task
            </button>
          </div>

          <select
            onChange={handleTeamSelect}
            value={selectedTeam}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 bg-white text-gray-700"
          >
            <option value="">-- Select a Team to view tasks --</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {selectedTeam && (
            <form
              onSubmit={handleAddMember}
              className="flex gap-2 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200"
            >
              <input
                type="email"
                placeholder="Add member by email (e.g. test@gmail.com)..."
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                required
              />
              <button
                disabled={addMemberLoading}
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addMemberLoading ? "Adding..." : "Add Member"}
              </button>
            </form>
          )}

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
              {teamMembers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-3">
            {isFetchingTasks ? (
              <div className="flex items-center justify-center gap-3 py-10 bg-white rounded-lg border border-gray-200">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></span>
                <span className="text-gray-500 font-medium">
                  Loading tasks...
                </span>
              </div>
            ) : selectedTeam && filteredTasks.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                No tasks found.
              </p>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDeleteTask}
                  users={teamMembers}
                />
              ))
            )}
          </div>
        </div>
      </main>

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
        users={teamMembers}
      />
    </div>
  );
};

export default Dashboard;
