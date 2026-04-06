// Debug script to check the actual API response
console.log('=== DEBUGGING CONVERSATION TRANSFORMATION ===');

// Check what's in localStorage
const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
console.log('Current user from localStorage:', currentUser);

// Mock the backend response format to test transformation
const mockBackendResponse = [
  {
    appointmentId: "cmf0h6oko000512ribl8w58cr",
    appointment: {
      id: "cmf0h6oko000512ribl8w58cr",
      datetime: "2025-09-04T09:00:00.000Z",
      status: "ACCEPTED",
      mentor: {
        id: "cmf0btwck0003hr627vzwojtw",
        name: "Dr. Sarah Wilson",
        email: "sarah.wilson@datatech.ai"
      },
      mentee: {
        id: "cmf0dibgb0000wf1684ebrtox",
        name: "Piyush Dwivedi",
        email: "piyush58d@gmail.com"
      }
    },
    lastMessage: {
      text: "now i guess everything is working"
    },
    unreadCount: 0
  },
  {
    appointmentId: "cmf0btwf1000qhr624h0hjbdo",
    appointment: {
      id: "cmf0btwf1000qhr624h0hjbdo",
      datetime: "2024-03-08T18:30:00.000Z",
      status: "ACCEPTED",
      mentor: {
        id: "cmf0btwck0003hr627vzwojtw",
        name: "Dr. Sarah Wilson",
        email: "sarah.wilson@datatech.ai"
      },
      mentee: {
        id: "cmf0btwf1000shr62z8w9m4pl",
        name: "Bob Smith",
        email: "bob.smith@stateuni.edu"
      }
    },
    lastMessage: null,
    unreadCount: 0
  }
];

console.log('Mock backend response:', mockBackendResponse);

// Test transformation logic
const currentUserId = currentUser.id;
console.log('Current user ID:', currentUserId);

const transformed = mockBackendResponse.map(conv => {
  const otherUser = currentUserId === conv.appointment.mentor.id 
    ? conv.appointment.mentee 
    : conv.appointment.mentor;
  
  console.log(`Conversation ${conv.appointmentId}:`);
  console.log(`  Current user ID: ${currentUserId}`);
  console.log(`  Mentor ID: ${conv.appointment.mentor.id}`);
  console.log(`  Mentee ID: ${conv.appointment.mentee.id}`);
  console.log(`  Is current user mentor? ${currentUserId === conv.appointment.mentor.id}`);
  console.log(`  Other user should be: ${otherUser.name}`);
  console.log('---');
  
  return {
    appointmentId: conv.appointmentId,
    appointment: {
      id: conv.appointment.id,
      datetime: conv.appointment.datetime,
      status: conv.appointment.status,
    },
    otherUser: otherUser,
    lastMessage: conv.lastMessage || undefined,
    unreadCount: conv.unreadCount,
  };
});

console.log('Transformed conversations:', transformed);
