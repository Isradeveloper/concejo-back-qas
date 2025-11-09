interface CurrentDate {
  year: number;
  month: number;
  day: number;
}

export const getCurrentDate = (): CurrentDate => {
  const date = new Date();
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
};

export const formatLongDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
  const day = dateObj.toLocaleDateString('es-ES', { day: '2-digit' });
  const month = dateObj.toLocaleDateString('es-ES', { month: 'long' });
  const year = dateObj.toLocaleDateString('es-ES', { year: 'numeric' });

  return `${dayName}, ${day} de ${month} de ${year}`;
};
