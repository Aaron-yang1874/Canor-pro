interface CollabCursorProps {
  userId: string;
  userName: string;
  color: string;
  position: {
    line: number;
    column: number;
  };
}

export function CollabCursor({ userId, userName, color, position }: CollabCursorProps) {
  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        top: `${position.line * 24}px`,
        left: `${position.column * 8}px`,
      }}
    >
      <div
        className="w-0 h-6 border-l-2"
        style={{ borderColor: color }}
      />
      <div
        className="absolute -top-6 left-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
        style={{
          backgroundColor: color,
          color: '#ffffff'
        }}
      >
        {userName}
      </div>
    </div>
  );
}
