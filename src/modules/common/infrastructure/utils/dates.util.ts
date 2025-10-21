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
