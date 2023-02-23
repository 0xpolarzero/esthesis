import { Tooltip } from 'antd';

const ElapsedTime = ({ time }) => {
  const now = new Date();
  const date = new Date(Number(time));
  const diff = now.getTime() - date.getTime();

  // Get the difference in various units
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const displayed =
    seconds < 60
      ? `${seconds} seconds ago`
      : minutes < 60
      ? `${minutes} minute${minutes > 1 ? 's' : ''} ago`
      : hours < 24
      ? `${hours} hour${hours > 1 ? 's' : ''} ago`
      : days < 7
      ? `${days} day${days > 1 ? 's' : ''} ago`
      : weeks < 4
      ? `${weeks} week${weeks > 1 ? 's' : ''} ago`
      : months < 12
      ? `${months} month${months > 1 ? 's' : ''} ago`
      : `${years} year${years > 1 ? 's' : ''} ago`;

  return <Tooltip title={date.toLocaleString()}>{displayed}</Tooltip>;
};

export default ElapsedTime;
