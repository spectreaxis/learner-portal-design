import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Read the course data from the frontend
  const courseDataPath = path.join(__dirname, '../../lib/course-data.ts');

  // Since we can't directly import TS from here, we'll need to manually define the data
  // For now, let's create a sample module as a template
  // You can expand this with your actual course data

  const modules = [
    {
      number: 1,
      title: 'AI Is Already in Your Life — Let\'s Understand It',
      subtitle: 'IIAIC Basic AI/ML Literacy Course',
      level: 'Absolute Beginner',
      estimatedTime: '45–55 minutes',
      description: 'This module introduces the fundamentals of AI and ML in plain language, helping you understand the technology that powers your daily digital experiences.',
      learningObjectives: [
        'Explain what Artificial Intelligence (AI) is in plain language, and distinguish it from human intelligence',
        'Describe the difference between narrow AI and general AI',
        'Explain what Machine Learning is and how it differs from regular software',
        'Identify at least five AI/ML applications you already use in daily life',
        'Explain why the quality and source of training data matters for how well an AI system works',
        'Recognise at least one way that an AI system can produce unfair or misleading results'
      ],
      lessons: [
        {
          order: 1,
          title: 'What Actually Is AI?',
          content: [
            'You\'ve probably heard the term "Artificial Intelligence" in movies, news headlines, and product ads. But what does it actually mean?',
            'AI is software that can perform tasks that normally require human intelligence — things like recognising a face in a photo, understanding what you said to a voice assistant, or recommending a song you might enjoy.',
          ],
          keyInsight: 'When a news headline says "AI can now do X," they almost always mean a system trained specifically for X.',
          video: {
            title: 'What is Artificial Intelligence?',
            source: 'IBM Technology',
            url: 'https://www.youtube.com/watch?v=a0_lo_GDcFw',
            duration: '~6 minutes',
            description: 'A clear, jargon-free overview of what AI is, its history, and why it matters today.'
          }
        },
        {
          order: 2,
          title: 'So What Is Machine Learning?',
          content: [
            'Machine Learning (ML) takes a completely different approach. Instead of writing rules, you show the computer thousands of examples and let it figure out the patterns itself.',
          ],
          keyInsight: 'The key difference: a human didn\'t program the rules — the machine learned them from data.',
          video: {
            title: 'Machine Learning Explained',
            source: 'Simply Explained (YouTube)',
            url: 'https://www.youtube.com/watch?v=ukzFI9rgwfU',
            duration: '~5 minutes',
            description: 'Explains how machines learn from data using everyday analogies.'
          }
        }
      ],
      quizzes: [
        {
          title: 'Self-Check Quiz 1',
          type: 'self-check',
          questions: [
            {
              id: 'q1-1',
              question: 'A chess-playing AI defeats the world champion. Can this same AI be used to moderate social media content?',
              options: [
                { label: 'A', text: 'Yes, because it\'s very intelligent' },
                { label: 'B', text: 'No, because it is narrow AI, designed only for chess' },
                { label: 'C', text: 'Yes, if given enough data about social media' },
                { label: 'D', text: 'No, because AI can\'t moderate anything' }
              ],
              answer: 'B',
              explanation: 'Narrow AI is designed for one task only',
              type: 'multiple-choice'
            },
            {
              id: 'q1-2',
              question: 'In Machine Learning, a human programmer writes out all the rules the system uses to make decisions.',
              answer: 'False',
              explanation: 'The machine learns the rules from data; humans provide examples, not rules.',
              type: 'true-false'
            }
          ]
        }
      ]
    }
  ];

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.quizSubmission.deleteMany({});
  await prisma.lessonProgress.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.learner.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.certification.deleteMany({});
  await prisma.module.deleteMany({});

  // Seed modules
  console.log('📚 Seeding modules...');
  for (const moduleData of modules) {
    const module = await prisma.module.create({
      data: {
        number: moduleData.number,
        title: moduleData.title,
        subtitle: moduleData.subtitle,
        level: moduleData.level,
        estimatedTime: moduleData.estimatedTime,
        description: moduleData.description,
        learningObjectives: moduleData.learningObjectives,
      },
    });

    console.log(`  ✓ Created module: ${module.title}`);

    // Seed lessons
    for (const lessonData of moduleData.lessons) {
      const lesson = await prisma.lesson.create({
        data: {
          moduleId: module.id,
          order: lessonData.order,
          title: lessonData.title,
          content: lessonData.content,
          keyInsight: lessonData.keyInsight,
          video: lessonData.video,
        },
      });

      console.log(`    ✓ Created lesson: ${lesson.title}`);
    }

    // Seed quizzes
    for (const quizData of moduleData.quizzes) {
      const quiz = await prisma.quiz.create({
        data: {
          moduleId: module.id,
          title: quizData.title,
          type: quizData.type,
          questions: quizData.questions,
        },
      });

      console.log(`    ✓ Created quiz: ${quiz.title}`);
    }
  }

  // Create a sample learner for testing
  console.log('👤 Creating sample learner...');
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const learner = await prisma.learner.create({
    data: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo Learner',
      currentStreak: 3,
    },
  });

  console.log(`  ✓ Created learner: ${learner.email} (password: password123)`);

  console.log('✅ Database seeded successfully!');
  console.log('\n📝 Summary:');
  console.log(`  - Modules: ${modules.length}`);
  console.log(`  - Sample learner: ${learner.email}`);
  console.log('\n🔐 Login credentials:');
  console.log(`  Email: demo@example.com`);
  console.log(`  Password: password123`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
