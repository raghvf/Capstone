const getDayBounds = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const getPeriodForTime = (currentTime = new Date()) => {
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();

  if (hours >= 9 && hours < 10) return 'Java';
  if (hours === 10 && minutes >= 10) return 'Python';
  if (hours === 11 && minutes >= 20) return 'Networking';
  if (hours === 12 && minutes >= 30) return 'AI/ML';
  if (hours === 18 && minutes >= 30) return 'React';

  return 'No Period';
};

module.exports = { getDayBounds, getPeriodForTime };
