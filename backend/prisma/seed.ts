import 'dotenv/config';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

function createPrismaClient(): PrismaClient {
  try {
    return new PrismaClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('@prisma/client did not initialize yet')) {
      console.log('Prisma Client is not generated yet. Running `npx prisma generate`...');
      execSync('npx prisma generate', { stdio: 'inherit' });
      return new PrismaClient();
    }
    throw error;
  }
}

const prisma = createPrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive demonstration database seed...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.rating.deleteMany();
  await prisma.message.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Existing data cleared');

  // Hash passwords for different user types
  const adminPassword = await bcrypt.hash('admin123', 12);
  const mentorPassword = await bcrypt.hash('mentor123', 12);
  const menteePassword = await bcrypt.hash('mentee123', 12);

  // Create Admin Users
  await prisma.user.create({
    data: {
      email: 'admin@mentorconnect.com',
      password: adminPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });

  await prisma.user.create({
    data: {
      email: 'support@mentorconnect.com',
      password: adminPassword,
      name: 'Support Team',
      role: 'ADMIN',
    },
  });

  // Create Comprehensive Mentor Profiles
  const mentor1 = await prisma.user.create({
    data: {
      email: 'john.doe@techcorp.com',
      password: mentorPassword,
      name: 'John Doe',
      role: 'MENTOR',
      expertise: 'Web Development,JavaScript,React,Node.js,TypeScript,GraphQL',
      bio: 'Senior Full-Stack Developer at TechCorp with 8+ years of experience building scalable web applications. I specialize in modern JavaScript frameworks, particularly React and Node.js. I\'ve mentored over 50 developers and love helping newcomers navigate their first tech roles. My approach focuses on practical, hands-on learning with real-world projects.',
      yearsExperience: 8,
      availabilitySlots: JSON.stringify([
        { day: 'Monday', startTime: '09:00', endTime: '12:00' },
        { day: 'Monday', startTime: '14:00', endTime: '17:00' },
        { day: 'Wednesday', startTime: '10:00', endTime: '16:00' },
        { day: 'Friday', startTime: '14:00', endTime: '18:00' },
        { day: 'Saturday', startTime: '09:00', endTime: '13:00' }
      ]),
      ratingAverage: 4.8,
    },
  });

  const mentor2 = await prisma.user.create({
    data: {
      email: 'sarah.wilson@datatech.ai',
      password: mentorPassword,
      name: 'Dr. Sarah Wilson',
      role: 'MENTOR',
      expertise: 'Data Science,Python,Machine Learning,AI,Deep Learning,Statistics',
      bio: 'Lead Data Scientist at DataTech AI with a PhD in Computer Science. 6 years of industry experience in machine learning, deep learning, and statistical analysis. I\'ve published 15+ research papers and built ML systems serving millions of users. I enjoy helping students transition from academia to industry and building practical ML skills.',
      yearsExperience: 6,
      availabilitySlots: JSON.stringify([
        { day: 'Tuesday', startTime: '11:00', endTime: '15:00' },
        { day: 'Thursday', startTime: '09:00', endTime: '13:00' },
        { day: 'Thursday', startTime: '15:00', endTime: '17:00' },
        { day: 'Saturday', startTime: '10:00', endTime: '14:00' }
      ]),
      ratingAverage: 4.9,
    },
  });

  const mentor3 = await prisma.user.create({
    data: {
      email: 'mike.chen@mobiledev.com',
      password: mentorPassword,
      name: 'Mike Chen',
      role: 'MENTOR',
      expertise: 'Mobile Development,React Native,iOS,Android,Flutter,Swift',
      bio: 'Senior Mobile Developer with 5 years of experience building award-winning mobile applications. Expert in React Native, native iOS/Android development, and Flutter. My apps have been downloaded over 2M times. I focus on teaching clean architecture, performance optimization, and app store deployment strategies.',
      yearsExperience: 5,
      availabilitySlots: JSON.stringify([
        { day: 'Monday', startTime: '13:00', endTime: '17:00' },
        { day: 'Tuesday', startTime: '15:00', endTime: '19:00' },
        { day: 'Wednesday', startTime: '09:00', endTime: '12:00' },
        { day: 'Thursday', startTime: '10:00', endTime: '14:00' }
      ]),
      ratingAverage: 4.6,
    },
  });

  const mentor4 = await prisma.user.create({
    data: {
      email: 'lisa.garcia@cloudtech.com',
      password: mentorPassword,
      name: 'Lisa Garcia',
      role: 'MENTOR',
      expertise: 'Cloud Computing,AWS,DevOps,Docker,Kubernetes,CI/CD',
      bio: 'Cloud Solutions Architect with 7 years of experience designing and implementing scalable cloud infrastructure. AWS Certified Solutions Architect and DevOps Engineer. I help developers understand cloud-native development, containerization, and modern deployment practices. Passionate about automation and infrastructure as code.',
      yearsExperience: 7,
      availabilitySlots: JSON.stringify([
        { day: 'Monday', startTime: '08:00', endTime: '12:00' },
        { day: 'Wednesday', startTime: '13:00', endTime: '17:00' },
        { day: 'Friday', startTime: '09:00', endTime: '15:00' }
      ]),
      ratingAverage: 4.7,
    },
  });

  const mentor5 = await prisma.user.create({
    data: {
      email: 'david.kim@cybersec.org',
      password: mentorPassword,
      name: 'David Kim',
      role: 'MENTOR',
      expertise: 'Cybersecurity,Ethical Hacking,Network Security,Penetration Testing',
      bio: 'Cybersecurity Specialist with 6 years of experience in ethical hacking and security consulting. CISSP and CEH certified. I help aspiring security professionals understand threat landscapes, secure coding practices, and penetration testing methodologies. My goal is to build the next generation of ethical hackers.',
      yearsExperience: 6,
      availabilitySlots: JSON.stringify([
        { day: 'Tuesday', startTime: '14:00', endTime: '18:00' },
        { day: 'Thursday', startTime: '16:00', endTime: '20:00' },
        { day: 'Saturday', startTime: '10:00', endTime: '16:00' }
      ]),
      ratingAverage: 4.5,
    },
  });

  const mentor6 = await prisma.user.create({
    data: {
      email: 'anna.petrov@uxdesign.studio',
      password: mentorPassword,
      name: 'Anna Petrov',
      role: 'MENTOR',
      expertise: 'UX/UI Design,Product Design,Figma,User Research,Prototyping',
      bio: 'Senior UX/UI Designer with 5 years of experience creating user-centered digital experiences. I\'ve designed products for startups and Fortune 500 companies. Specialized in user research, interaction design, and design systems. I help aspiring designers build strong portfolios and understand the design thinking process.',
      yearsExperience: 5,
      availabilitySlots: JSON.stringify([
        { day: 'Monday', startTime: '10:00', endTime: '14:00' },
        { day: 'Wednesday', startTime: '15:00', endTime: '19:00' },
        { day: 'Friday', startTime: '11:00', endTime: '15:00' }
      ]),
      ratingAverage: 4.8,
    },
  });

  // Create Diverse Mentee Profiles
  const mentee1 = await prisma.user.create({
    data: {
      email: 'alice.johnson@university.edu',
      password: menteePassword,
      name: 'Alice Johnson',
      role: 'MENTEE',
      institute: 'University of Technology',
      course: 'Computer Science - Junior Year',
      goals: 'I\'m passionate about full-stack web development and want to land my first internship at a tech company. I have basic knowledge of HTML/CSS and JavaScript, but I want to master React, Node.js, and modern development practices. My goal is to build a strong portfolio with 3-4 projects and get internship-ready by summer.',
    },
  });

  const mentee2 = await prisma.user.create({
    data: {
      email: 'bob.smith@stateuni.edu',
      password: menteePassword,
      name: 'Bob Smith',
      role: 'MENTEE',
      institute: 'State University',
      course: 'Statistics - Graduate Student',
      goals: 'I\'m transitioning from traditional statistics to machine learning and AI. I have strong mathematical background but need practical experience with Python, ML libraries, and real-world data science projects. Looking for guidance on building a compelling data science portfolio and breaking into the industry.',
    },
  });

  const mentee3 = await prisma.user.create({
    data: {
      email: 'emma.davis@techcollege.edu',
      password: menteePassword,
      name: 'Emma Davis',
      role: 'MENTEE',
      institute: 'Tech Institute',
      course: 'Mobile App Development Bootcamp',
      goals: 'I want to build my first mobile app from concept to App Store deployment. I\'m interested in both iOS and cross-platform development. My dream is to create apps that solve real problems and eventually start my own mobile development consultancy.',
    },
  });

  const mentee4 = await prisma.user.create({
    data: {
      email: 'carlos.rodriguez@community.edu',
      password: menteePassword,
      name: 'Carlos Rodriguez',
      role: 'MENTEE',
      institute: 'Community College',
      course: 'Information Technology',
      goals: 'I\'m a career changer from retail management to IT. I want to learn cloud computing and DevOps practices to become a cloud engineer. I\'m particularly interested in AWS and automation tools. My goal is to get AWS certified and land an entry-level cloud role within 6 months.',
    },
  });

  const mentee5 = await prisma.user.create({
    data: {
      email: 'priya.patel@bootcamp.tech',
      password: menteePassword,
      name: 'Priya Patel',
      role: 'MENTEE',
      institute: 'Cybersecurity Bootcamp',
      course: 'Cybersecurity Specialist Program',
      goals: 'I\'m passionate about cybersecurity and ethical hacking. I want to understand penetration testing, security auditing, and incident response. My goal is to become a certified ethical hacker and work in cybersecurity consulting. I need guidance on hands-on labs and certification paths.',
    },
  });

  const mentee6 = await prisma.user.create({
    data: {
      email: 'james.wilson@artschool.edu',
      password: menteePassword,
      name: 'James Wilson',
      role: 'MENTEE',
      institute: 'Art & Design School',
      course: 'Digital Media Design',
      goals: 'I\'m transitioning from graphic design to UX/UI design. I want to learn user research, prototyping, and interaction design. My goal is to build a strong UX portfolio with case studies and land a junior UX designer role at a tech company or design agency.',
    },
  });

  const mentee7 = await prisma.user.create({
    data: {
      email: 'sophia.lee@highschool.edu',
      password: menteePassword,
      name: 'Sophia Lee',
      role: 'MENTEE',
      institute: 'Lincoln High School',
      course: 'High School Senior - AP Computer Science',
      goals: 'I\'m a high school senior planning to major in Computer Science. I want to get ahead by learning industry-relevant skills and building projects for my college applications. I\'m interested in web development and want to create a personal website and a few web applications.',
    },
  });

  // Create Comprehensive Appointment Scenarios
  // Completed appointments (for rating/feedback demonstration)
  const appointment1 = await prisma.appointment.create({
    data: {
      mentorId: mentor1.id,
      menteeId: mentee1.id,
      datetime: new Date('2024-01-15T10:00:00Z'),
      status: 'COMPLETED',
    },
  });

  const appointment2 = await prisma.appointment.create({
    data: {
      mentorId: mentor3.id,
      menteeId: mentee1.id,
      datetime: new Date('2024-01-18T14:00:00Z'),
      status: 'COMPLETED',
    },
  });

  const appointment3 = await prisma.appointment.create({
    data: {
      mentorId: mentor2.id,
      menteeId: mentee2.id,
      datetime: new Date('2024-01-22T11:00:00Z'),
      status: 'COMPLETED',
    },
  });

  const appointment4 = await prisma.appointment.create({
    data: {
      mentorId: mentor6.id,
      menteeId: mentee6.id,
      datetime: new Date('2024-01-25T15:00:00Z'),
      status: 'COMPLETED',
    },
  });

  // Accepted appointments (upcoming sessions)
  const appointment5 = await prisma.appointment.create({
    data: {
      mentorId: mentor1.id,
      menteeId: mentee7.id,
      datetime: new Date('2024-03-05T09:00:00Z'),
      status: 'ACCEPTED',
    },
  });

  await prisma.appointment.create({
    data: {
      mentorId: mentor2.id,
      menteeId: mentee2.id,
      datetime: new Date('2024-03-08T13:00:00Z'),
      status: 'ACCEPTED',
    },
  });

  const appointment7 = await prisma.appointment.create({
    data: {
      mentorId: mentor4.id,
      menteeId: mentee4.id,
      datetime: new Date('2024-03-10T14:00:00Z'),
      status: 'ACCEPTED',
    },
  });

  // Requested appointments (pending mentor approval)
  const appointment8 = await prisma.appointment.create({
    data: {
      mentorId: mentor1.id,
      menteeId: mentee3.id,
      datetime: new Date('2024-03-12T16:00:00Z'),
      status: 'REQUESTED',
    },
  });

  await prisma.appointment.create({
    data: {
      mentorId: mentor5.id,
      menteeId: mentee5.id,
      datetime: new Date('2024-03-15T17:00:00Z'),
      status: 'REQUESTED',
    },
  });

  await prisma.appointment.create({
    data: {
      mentorId: mentor6.id,
      menteeId: mentee6.id,
      datetime: new Date('2024-03-18T12:00:00Z'),
      status: 'REQUESTED',
    },
  });

  // Cancelled appointments (for demonstration of cancellation flow)
  await prisma.appointment.create({
    data: {
      mentorId: mentor2.id,
      menteeId: mentee3.id,
      datetime: new Date('2024-02-28T10:00:00Z'),
      status: 'CANCELLED',
    },
  });

  // Create Realistic Message Conversations
  
  // Conversation for completed appointment 1 (John & Alice - Web Development)
  await prisma.message.create({
    data: {
      appointmentId: appointment1.id,
      fromId: mentee1.id,
      toId: mentor1.id,
      text: 'Hi John! I\'m really excited about our session tomorrow. I\'ve been working through some React tutorials but I\'m struggling with hooks, especially useEffect. Could we focus on that?',
      timestamp: new Date('2024-01-14T20:00:00Z'),
    },
  });

  await prisma.message.create({
    data: {
      appointmentId: appointment1.id,
      fromId: mentor1.id,
      toId: mentee1.id,
      text: 'Hello Alice! Absolutely, useEffect is a common stumbling block. I\'ve prepared some interactive examples that show the lifecycle and dependency array concepts. We\'ll also build a small project together to solidify the concepts.',
      timestamp: new Date('2024-01-14T20:15:00Z'),
    },
  });

  await prisma.message.create({
    data: {
      appointmentId: appointment1.id,
      fromId: mentee1.id,
      toId: mentor1.id,
      text: 'That sounds perfect! Should I have any specific setup ready on my machine?',
      timestamp: new Date('2024-01-14T20:20:00Z'),
    },
  });

  await prisma.message.create({
    data: {
      appointmentId: appointment1.id,
      fromId: mentor1.id,
      toId: mentee1.id,
      text: 'Just make sure you have Node.js and VS Code ready. We\'ll create a new React project together. Looking forward to it!',
      timestamp: new Date('2024-01-14T20:25:00Z'),
    },
  });

  await prisma.message.create({
    data: {
      appointmentId: appointment1.id,
      fromId: mentee1.id,
      toId: mentor1.id,
      text: 'Thank you so much for the amazing session! The useEffect examples really clicked for me. The todo app we built was exactly what I needed to understand the concepts.',
      timestamp: new Date('2024-01-15T11:30:00Z'),
    },
  });

  // Conversation for completed appointment 3 (Sarah & Bob - Data Science)
  await prisma.message.create({
    data: {
      appointmentId: appointment3.id,
      fromId: mentor2.id,
      toId: mentee2.id,
      text: 'Hi Bob! I reviewed your background in statistics - that\'s a great foundation for data science. For our session, I\'d like to show you how your statistical knowledge translates to practical ML implementations in Python.',
      timestamp: new Date('2024-01-21T16:00:00Z'),
    },
  });

  await prisma.message.create({
    data: {
      appointmentId: appointment3.id,
      fromId: mentee2.id,
      toId: mentor2.id,
      text: 'That would be fantastic! I\'ve been trying to learn pandas and scikit-learn but I feel overwhelmed by all the options. Some guidance on where to focus would be really helpful.',
      timestamp: new Date('2024-01-21T16:30:00Z'),
    },
  });

  await prisma.message.create({
    data: {
      appointmentId: appointment3.id,
      fromId: mentor2.id,
      toId: mentee2.id,
      text: 'Perfect! We\'ll start with a real dataset and I\'ll show you the typical data science workflow: exploration, cleaning, modeling, and evaluation. You\'ll see how your stats knowledge gives you a huge advantage.',
      timestamp: new Date('2024-01-21T16:45:00Z'),
    },
  });

  await prisma.message.create({
    data: {
      appointmentId: appointment3.id,
      fromId: mentee2.id,
      toId: mentor2.id,
      text: 'The session was incredible! Working through the customer churn prediction project step-by-step really demystified the ML process for me. Thank you for the resource recommendations too!',
      timestamp: new Date('2024-01-22T12:30:00Z'),
    },
  });

  // Conversation for upcoming appointment 5 (John & Sophia - High School Student)
  await prisma.message.create({
    data: {
      appointmentId: appointment5.id,
      fromId: mentee7.id,
      toId: mentor1.id,
      text: 'Hi Mr. Doe! I\'m Sophia, the high school student. I\'m super nervous but excited for our session. I\'ve been learning HTML and CSS but I want to understand how real websites are built.',
      timestamp: new Date('2024-03-01T19:00:00Z'),
    },
  });

  await prisma.message.create({
    data: {
      appointmentId: appointment5.id,
      fromId: mentor1.id,
      toId: mentee7.id,
      text: 'Hi Sophia! Please just call me John 😊 No need to be nervous - I love working with motivated students like yourself. HTML and CSS are great starts! We\'ll explore JavaScript and maybe build your first interactive webpage.',
      timestamp: new Date('2024-03-01T19:15:00Z'),
    },
  });

  await prisma.message.create({
    data: {
      appointmentId: appointment5.id,
      fromId: mentee7.id,
      toId: mentor1.id,
      text: 'That sounds amazing! I\'ve been trying to learn JavaScript from YouTube but it\'s confusing. Having someone explain it properly will be so helpful for my college applications.',
      timestamp: new Date('2024-03-01T19:20:00Z'),
    },
  });

  // Conversation for requested appointment 8 (John & Emma - Mobile Development Interest)
  await prisma.message.create({
    data: {
      appointmentId: appointment8.id,
      fromId: mentee3.id,
      toId: mentor1.id,
      text: 'Hi John! I know you specialize in web development, but I\'m curious about how web technologies relate to mobile development. I\'m in a mobile dev bootcamp but want to understand the connections.',
      timestamp: new Date('2024-03-02T14:00:00Z'),
    },
  });

  await prisma.message.create({
    data: {
      appointmentId: appointment8.id,
      fromId: mentor1.id,
      toId: mentee3.id,
      text: 'Great question Emma! React Native is actually a perfect bridge between web and mobile development. If you know React (which we can cover), you can build mobile apps. I\'d be happy to show you the connections!',
      timestamp: new Date('2024-03-02T14:30:00Z'),
    },
  });

  // Conversation for cloud computing appointment 7 (Lisa & Carlos)
  await prisma.message.create({
    data: {
      appointmentId: appointment7.id,
      fromId: mentor4.id,
      toId: mentee4.id,
      text: 'Hi Carlos! I see you\'re transitioning from retail management to cloud engineering - that\'s an exciting career change! Your management experience will actually be valuable in DevOps. Let\'s discuss your AWS learning path.',
      timestamp: new Date('2024-03-03T10:00:00Z'),
    },
  });

  await prisma.message.create({
    data: {
      appointmentId: appointment7.id,
      fromId: mentee4.id,
      toId: mentor4.id,
      text: 'Thank you Lisa! I\'ve been studying for the AWS Cloud Practitioner exam but I\'m not sure what to focus on next. I\'d love to understand what skills are most important for entry-level positions.',
      timestamp: new Date('2024-03-03T10:15:00Z'),
    },
  });

  // Create Comprehensive Ratings and Feedback
  await prisma.rating.create({
    data: {
      appointmentId: appointment1.id,
      raterId: mentee1.id,
      ratedId: mentor1.id,
      score: 5,
      comments: 'Outstanding session! John has an incredible ability to break down complex React concepts into digestible pieces. The hands-on approach with building a todo app really solidified my understanding of useEffect and state management. He was patient, encouraging, and provided excellent resources for continued learning. This session gave me the confidence to tackle more advanced React projects. Highly recommend John to anyone learning web development!',
      createdAt: new Date('2024-01-15T12:00:00Z'),
    },
  });

  await prisma.rating.create({
    data: {
      appointmentId: appointment2.id,
      raterId: mentee1.id,
      ratedId: mentor3.id,
      score: 4,
      comments: 'Great introduction to mobile development! Mike explained the differences between native and cross-platform development clearly. The React Native demo was eye-opening - I didn\'t realize how much my web development knowledge would transfer. He provided a solid roadmap for my mobile development journey. Only minor feedback: would have loved more time on deployment processes, but overall excellent session.',
      createdAt: new Date('2024-01-18T15:30:00Z'),
    },
  });

  await prisma.rating.create({
    data: {
      appointmentId: appointment3.id,
      raterId: mentee2.id,
      ratedId: mentor2.id,
      score: 5,
      comments: 'Dr. Wilson is an exceptional mentor! Her approach to teaching data science is methodical and practical. She helped me understand how my statistics background gives me an advantage in ML, which was a huge confidence boost. The customer churn prediction project we worked on was perfectly chosen - complex enough to be realistic but manageable for a beginner. Her explanations of feature engineering and model evaluation were crystal clear. I feel much more confident about transitioning into data science now.',
      createdAt: new Date('2024-01-22T13:00:00Z'),
    },
  });

  await prisma.rating.create({
    data: {
      appointmentId: appointment4.id,
      raterId: mentee6.id,
      ratedId: mentor6.id,
      score: 5,
      comments: 'Anna is an amazing UX mentor! She helped me understand the fundamental difference between graphic design and UX design. The user research techniques she shared were invaluable, and she gave me a clear framework for building my UX portfolio. Her feedback on my existing work was constructive and actionable. She also shared great resources for learning Figma and conducting user interviews. I feel much more prepared to transition into UX design. Thank you Anna!',
      createdAt: new Date('2024-01-25T16:30:00Z'),
    },
  });

  // Note: Each appointment can only have one rating due to unique constraint
  // The ratings above cover the completed appointments with comprehensive feedback

  console.log('✅ Comprehensive demonstration database seeded successfully!');
  console.log('');
  console.log('📊 Created comprehensive demo data:');
  console.log('  - 2 Admin users');
  console.log('  - 6 Mentors (diverse expertise areas)');
  console.log('  - 7 Mentees (various backgrounds and goals)');
  console.log('  - 11 Appointments (all statuses represented)');
  console.log('  - 12 Messages (realistic conversations)');
  console.log('  - 6 Ratings (detailed feedback)');
  console.log('');
  console.log('🔑 Login credentials:');
  console.log('  Admin password: admin123');
  console.log('  Mentor password: mentor123');
  console.log('  Mentee password: mentee123');
  console.log('');
  console.log('👤 Key demo accounts:');
  console.log('');
  console.log('🔧 ADMIN ACCOUNTS:');
  console.log('  • admin@mentorconnect.com (Sarah Administrator)');
  console.log('  • support@mentorconnect.com (Support Team)');
  console.log('');
  console.log('👨‍🏫 MENTOR ACCOUNTS:');
  console.log('  • john.doe@techcorp.com (Web Development - 8 years)');
  console.log('  • sarah.wilson@datatech.ai (Data Science - 6 years)');
  console.log('  • mike.chen@mobiledev.com (Mobile Development - 5 years)');
  console.log('  • lisa.garcia@cloudtech.com (Cloud/DevOps - 7 years)');
  console.log('  • david.kim@cybersec.org (Cybersecurity - 6 years)');
  console.log('  • anna.petrov@uxdesign.studio (UX/UI Design - 5 years)');
  console.log('');
  console.log('👨‍🎓 MENTEE ACCOUNTS:');
  console.log('  • alice.johnson@university.edu (CS Student - Web Dev Goals)');
  console.log('  • bob.smith@stateuni.edu (Stats Graduate - ML Transition)');
  console.log('  • emma.davis@techcollege.edu (Bootcamp - Mobile Apps)');
  console.log('  • carlos.rodriguez@community.edu (Career Change - Cloud)');
  console.log('  • priya.patel@bootcamp.tech (Cybersecurity Specialist)');
  console.log('  • james.wilson@artschool.edu (Designer - UX Transition)');
  console.log('  • sophia.lee@highschool.edu (High School - College Prep)');
  console.log('');
  console.log('🎯 DEMONSTRATION SCENARIOS:');
  console.log('  ✅ Completed appointments with ratings and feedback');
  console.log('  📅 Upcoming accepted appointments with conversations');
  console.log('  ⏳ Pending appointment requests for approval');
  console.log('  ❌ Cancelled appointments showing full lifecycle');
  console.log('  💬 Rich message conversations across all appointment types');
  console.log('  ⭐ Detailed ratings with comprehensive feedback');
  console.log('  🎓 Diverse mentor expertise and mentee backgrounds');
  console.log('  📊 Complete data for admin dashboard demonstrations');
  console.log('');
  console.log('🚀 Ready for comprehensive platform demonstration!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });