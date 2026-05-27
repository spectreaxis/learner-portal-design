import { PrismaClient } from '@prisma/client';
import { courseModules } from '../../lib/course-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

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

  // Seed modules from course data
  console.log('📚 Seeding modules...');
  for (const moduleData of courseModules) {
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
    if (moduleData.lessons) {
      for (let i = 0; i < moduleData.lessons.length; i++) {
        const lessonData = moduleData.lessons[i];
        const lesson = await prisma.lesson.create({
          data: {
            moduleId: module.id,
            order: i + 1,
            title: lessonData.title,
            content: lessonData.content || [],
            keyInsight: lessonData.keyInsight,
            video: lessonData.video as any,
          },
        });

        console.log(`    ✓ Created lesson: ${lesson.title}`);
      }
    }

    // Seed quizzes
    if (moduleData.selfCheckQuizzes) {
      for (const quiz of moduleData.selfCheckQuizzes) {
        await prisma.quiz.create({
          data: {
            moduleId: module.id,
            title: quiz.title,
            type: 'self-check',
            questions: quiz.questions as any,
          },
        });
        console.log(`    ✓ Created quiz: ${quiz.title}`);
      }
    }

    // Seed hands-on activity
    if (moduleData.handsOnActivity) {
      const activity = await prisma.activity.create({
        data: {
          moduleId: module.id,
          title: moduleData.handsOnActivity.title,
          description: moduleData.handsOnActivity.description,
          content: moduleData.handsOnActivity as any,
        },
      });
      console.log(`    ✓ Created activity: ${activity.title}`);
    }

    // Seed certification assessment
    if (moduleData.certificationAssessment) {
      const certification = await prisma.certification.create({
        data: {
          moduleId: module.id,
          title: `Module ${module.number} Certification Assessment`,
          requiredScore: 80,
          content: {
            instructions: `This certification assessment tests your understanding of Module ${module.number}. You need to score 80% or higher to earn your certificate.`,
            questions: moduleData.certificationAssessment.questions,
          } as any,
        },
      });
      console.log(`    ✓ Created certification: ${certification.title}`);
    }
  }

  // Create sample learner
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
  console.log(`  - Modules: ${courseModules.length}`);
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
