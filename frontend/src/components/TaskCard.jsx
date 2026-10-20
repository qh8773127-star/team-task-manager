const TaskCard = ({ task, onUpdateStatus, onDelete, users }) => {
  const assignee = users?.find((u) => u.id === task.assignee_id);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800">{task.title}</h3>
          <p className="text-gray-500 text-sm mt-1">{task.description}</p>
          <p className="text-xs text-gray-400 mt-2">
            
            Assigned: {assignee ? assignee.name : "Unassigned"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <select
            value={task.status}
            onChange={(e) => onUpdateStatus(task.id, e.target.value)}
            className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded cursor-pointer outline-none"
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
          <button
            onClick={() => onDelete(task.id)}
            className="text-xs text-red-600 hover:underline font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;