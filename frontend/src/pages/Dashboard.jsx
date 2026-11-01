import CreateTeamModal from "../components/CreateTeamModal";
import CreateTaskModal from "../components/CreateTaskModal";
import TaskCard from "../components/TaskCard";
import Navbar from "../components/Navbar";
import ViewMembersModal from "../components/ViewMembersModal"; 
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
    isMembersModalOpen, 
    setIsMembersModalOpen,
    addMemberLoading,
    handleRemoveMember
  } = useDashboardLogic();

  const currentTeam = teams.find((t) => t.id === selectedTeam);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-lg font-medium text-slate-600">Loading Workspace...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onLogout={handleLogout} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Your Teams</h2>
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Team
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {teams.map((t) => {
                const isActive = selectedTeam === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleTeamSelect({ target: { value: t.id } })}
                    className={`group cursor-pointer p-4 rounded-xl border transition-all duration-200 flex justify-between items-center ${
                      isActive 
                        ? "bg-blue-50 border-blue-500 shadow-sm ring-1 ring-blue-500" 
                        : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg ${isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <h3 className={`font-semibold ${isActive ? "text-blue-900" : "text-slate-800"}`}>
                        {t.name}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTeam(t.id);
                      }}
                      className="text-slate-400 hover:text-red-600 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-2"
                      title="Delete Team"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                );
              })}
              {teams.length === 0 && (
                <div className="text-center p-8 bg-white border border-dashed border-slate-300 rounded-xl">
                  <p className="text-slate-500 font-medium">No teams yet.</p>
                  <p className="text-slate-400 text-sm mt-1">Create your first team to get started.</p>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-8 flex flex-col gap-6">
     
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-slate-700 mb-1">Active Workspace</label>
                <select
                  onChange={handleTeamSelect}
                  value={selectedTeam}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                >
                  <option value="">-- Select a Team --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                disabled={!selectedTeam}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Task
              </button>
            </div>
            {selectedTeam && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <form onSubmit={handleAddMember} className="flex flex-1 gap-2">
                  <input
                    type="email"
                    placeholder="Invite member by email..."
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    disabled={addMemberLoading}
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors whitespace-nowrap flex items-center justify-center"
                  >
                    {addMemberLoading ? "Adding..." : "Add Member"}
                  </button>
                </form>
                <button
                  onClick={() => setIsMembersModalOpen(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  View Members
                </button>
              </div>
            )}
            {selectedTeam && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="w-full sm:w-64 p-2.5 border border-slate-300 rounded-lg bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Assignees</option>
                  {teamMembers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {isFetchingTasks ? (
                <div className="flex items-center justify-center gap-3 py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></span>
                  <span className="text-slate-500 font-medium">Fetching tasks...</span>
                </div>
              ) : selectedTeam && filteredTasks.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 shadow-sm">
                  <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <p className="text-slate-600 font-medium text-lg">No tasks found</p>
                  <p className="text-slate-400 text-sm mt-1">Get started by creating a new task for this team.</p>
                </div>
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
      <ViewMembersModal 
        isOpen={isMembersModalOpen} 
        onClose={() => setIsMembersModalOpen(false)} 
        members={teamMembers} 
        creatorId={currentTeam?.creator_id} 
        onRemove={handleRemoveMember}
      />
    </div>
  );
};

export default Dashboard;