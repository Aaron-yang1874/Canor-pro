interface Collaborator {
  userId: string;
  userName: string;
  color: string;
  cursor?: {
    line: number;
    column: number;
  };
}

interface CollabIndicatorProps {
  collaborators: Collaborator[];
  currentUserId?: string;
}

export function CollabIndicator({ collaborators, currentUserId }: CollabIndicatorProps) {
  if (collaborators.length === 0) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span>{collaborators.length + 1} 协作者</span>
      </div>
      
      <div className="flex -space-x-2 overflow-hidden">
        {collaborators.map((collab) => (
          <div
            key={collab.userId}
            className="relative group"
          >
            <div
              className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800 flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: collab.color }}
              title={collab.userName}
            >
              {collab.userName.charAt(0).toUpperCase()}
            </div>
            
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {collab.userName}
            </div>
          </div>
        ))}
      </div>
      
      <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>实时同步中</span>
      </div>
    </div>
  );
}
