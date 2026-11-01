const ViewMembersModal = ({ isOpen, onClose, members, creatorId, onRemove }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-800">Team Members</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 font-bold text-xl">&times;</button>
        </div>

        <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {member.name} {member.id === creatorId && <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded ml-1">Creator</span>}
                  </p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              {creatorId && member.id !== creatorId && (
                <button 
                  onClick={() => onRemove(member.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  title="Remove Member"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewMembersModal;