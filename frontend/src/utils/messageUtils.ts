import { format, isToday, isYesterday, parseISO } from 'date-fns';

export const formatMessageTime = (timestamp: string): string => {
  const date = parseISO(timestamp);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMM dd');
  }
};

export const formatMessageTimestamp = (timestamp: string): string => {
  const date = parseISO(timestamp);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return `Yesterday ${format(date, 'HH:mm')}`;
  } else {
    return format(date, 'MMM dd, yyyy HH:mm');
  }
};

export const groupMessagesByDate = (messages: any[]) => {
  const groups: { [key: string]: any[] } = {};
  
  // Add defensive check to ensure messages is an array
  if (!Array.isArray(messages)) {
    return groups;
  }
  
  // Remove any duplicate messages by ID before grouping
  const uniqueMessages = messages.reduce((unique, message) => {
    if (!unique.find((m: any) => m.id === message.id)) {
      unique.push(message);
    }
    return unique;
  }, [] as any[]);
  
  uniqueMessages.forEach((message: any) => {
    const date = parseISO(message.timestamp);
    let dateKey: string;
    
    if (isToday(date)) {
      dateKey = 'Today';
    } else if (isYesterday(date)) {
      dateKey = 'Yesterday';
    } else {
      dateKey = format(date, 'MMMM dd, yyyy');
    }
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  });
  
  return groups;
};