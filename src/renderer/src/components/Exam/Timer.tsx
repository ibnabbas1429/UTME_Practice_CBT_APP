import React from 'react';

interface TimerProps {
  timeLeft: number; // in seconds
}

const Timer: React.FC<TimerProps> = ({ timeLeft }) => {
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const formatTime = (num: number): string => num.toString().padStart(2, '0');

  const isLowTime = timeLeft < 300; // Less than 5 minutes

  return (
    <div className={`timer ${isLowTime ? 'timer-warning' : ''}`}>
      <div className="timer-label">Time Remaining</div>
      <div className="timer-display">
        {hours > 0 && <span>{formatTime(hours)}:</span>}
        <span>{formatTime(minutes)}:</span>
        <span>{formatTime(seconds)}</span>
      </div>
    </div>
  );
};

export default Timer;