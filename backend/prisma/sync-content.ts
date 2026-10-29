/**
 * Sync course content into an existing database without reseeding.
 *
 * seed.ts deletes every learner, submission and certificate before inserting
 * content, so it can't be used to publish text edits. This script updates the
 * existing module, lesson, quiz, activity and certification rows in place
 * (matched by module number, lesson order and quiz title) and leaves all
 * learner data untouched.
 *
 * Usage: npm run content:sync
 */
import { PrismaClient } from '@prisma/client';
import { courseModules } from './course-data';

const prisma = new PrismaClient();

async function main() {
  for (const moduleData of courseModules) {
    const module = await prisma.module.findUnique({ where: { number: moduleData.number } });
    if (!module) {
      console.warn(`⚠ Module ${moduleData.number} not found, skipping (run the seed for a fresh database)`);
      continue;
    }

    await prisma.module.update({
      where: { id: module.id },
      data: {
        title: moduleData.title,
        subtitle: moduleData.subtitle,
        level: moduleData.level,
        estimatedTime: moduleData.estimatedTime,
        description: moduleData.description,
        learningObjectives: moduleData.learningObjectives,
      },
    });
    console.log(`✓ Module ${moduleData.number}: ${moduleData.title}`);

    for (let i = 0; i < (moduleData.lessons?.length ?? 0); i++) {
      const lessonData = moduleData.lessons[i];
      const { count } = await prisma.lesson.updateMany({
        where: { moduleId: module.id, order: i + 1 },
        data: {
          title: lessonData.title,
          content: lessonData.content || [],
          keyInsight: lessonData.keyInsight,
          video: lessonData.video as any,
        },
      });
      if (count === 0) console.warn(`  ⚠ Lesson ${i + 1} not found`);
    }

    for (const quiz of moduleData.selfCheckQuizzes ?? []) {
      const { count } = await prisma.quiz.updateMany({
        where: { moduleId: module.id, title: quiz.title, type: 'self-check' },
        data: { questions: quiz.questions as any },
      });
      if (count === 0) console.warn(`  ⚠ Quiz "${quiz.title}" not found`);
    }

    if (moduleData.handsOnActivity) {
      await prisma.activity.updateMany({
        where: { moduleId: module.id },
        data: {
          title: moduleData.handsOnActivity.title,
          description: moduleData.handsOnActivity.description,
          content: moduleData.handsOnActivity as any,
        },
      });
    }

    if (moduleData.certificationAssessment) {
      await prisma.certification.updateMany({
        where: { moduleId: module.id },
        data: {
          content: {
            instructions: `This certification assessment tests your understanding of Module ${moduleData.number}. You need to score 80% or higher to earn your certificate.`,
            questions: moduleData.certificationAssessment.questions,
          } as any,
        },
      });
    }
  }
}

main()
  .catch((error) => {
    console.error('Content sync failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
