import { addDays, startOfDay, parseISO, parse } from 'date-fns';

interface DateFilterable {
  date: string;
}

const parseDate = (dateString: string): Date => {
  const cleanDate = dateString.split(' ')[0];

  if (cleanDate.includes('/')) {
    return parse(cleanDate, 'yyyy/MM/dd', new Date());
  }

  return parseISO(cleanDate);
};

export const getDataForTwoWeeks = <T extends DateFilterable>(data: T[]): T[] => {
  const today = startOfDay(new Date());
  const endDate = addDays(today, 14);

  const sortedData = data.sort((a, b) => {
    const dateA = startOfDay(parseDate(a.date));
    const dateB = startOfDay(parseDate(b.date));
    return dateA.getTime() - dateB.getTime();
  });

  return sortedData.filter((item) => {
    const itemDate = startOfDay(parseDate(item.date));
    return itemDate >= today && itemDate <= endDate;
  });
};
