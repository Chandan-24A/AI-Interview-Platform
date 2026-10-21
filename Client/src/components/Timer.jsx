import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const Timer = ({ timeLeft, totalTime }) => {
  const safeTotalTime = totalTime && totalTime > 0 ? totalTime : 60;
  const safeTimeLeft = Math.max(0, timeLeft ?? 0);
  const percentage = (safeTimeLeft / safeTotalTime) * 100;

  const formatTime = (seconds) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${seconds}s`;
  };

  const isLowTime = safeTimeLeft <= 10;

  return (
    <div className="w-20 h-20">
      <CircularProgressbar 
        value={percentage} 
        text={formatTime(safeTimeLeft)}
        styles={buildStyles({
          textSize: safeTimeLeft >= 60 ? "22px" : "26px",
          pathColor: isLowTime ? "#ef4444" : "#10b981",
          textColor: isLowTime ? "#ef4444" : "#1f2937",
          trailColor: "#e5e7eb",
          pathTransition: "stroke-dashoffset 0.5s ease 0s"
        })}
      />
    </div>
  );
};

export default Timer;
