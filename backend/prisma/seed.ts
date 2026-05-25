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
        },
        {
          order: 3,
          title: 'Key Vocabulary (Plain English Edition)',
          content: [
            'You only need six terms to understand most conversations about ML:',
            '**Dataset**: A collection of examples the machine learns from. Example: All the emails labelled spam or not spam.',
            '**Feature**: A measurable property of each example. Example: The number of exclamation marks in an email.',
            '**Label**: The answer you want the model to predict. Example: "Spam" or "not spam".',
            '**Training**: The process of the machine learning from the dataset. Example: Feeding the 10,000 emails to the algorithm.',
            '**Model**: The output of training — the learned patterns. Example: The finished spam detector.',
            '**Prediction**: What the model outputs for a new, unseen example. Example: "This new email is probably spam".'
          ],
          keyInsight: 'Think of it this way: Training is studying. The model is your brain after studying. A prediction is answering a question on an exam you\'ve never seen before.'
        },
        {
          order: 4,
          title: 'Two Main Flavours of Machine Learning',
          content: [
            '**Supervised Learning — "Learning with an Answer Key"**',
            'The most common type. The training data has both examples and correct answers (labels). The machine learns to map examples to answers.',
            'Examples: Spam filtering (Emails + spam/not-spam labels), Image recognition (Photos + labels like "cat," "dog," "car"), House price prediction (House features + actual prices).',
            '**Unsupervised Learning — "Finding Patterns Without an Answer Key"**',
            'Here, the data has no labels. The machine looks for natural groupings or patterns on its own.',
            'Examples: Customer segmentation (finding natural clusters like "bargain hunters," "brand loyalists"), Anomaly detection (finding unusual activity in bank transactions).'
          ],
          keyInsight: 'Supervised = "I\'ll tell you the answers, you learn the patterns." Unsupervised = "Here\'s a pile of data, find the patterns yourself."'
        },
        {
          order: 5,
          title: 'AI and ML in Your Daily Life',
          content: [
            'You interact with AI/ML systems constantly, whether you know it or not:',
            '**On your phone**: Face ID (image recognition), Fingerprint unlock (biometric pattern matching), Autocomplete/autocorrect (language model), Photo organisation by person or place (image clustering).',
            '**Entertainment**: Spotify\'s "Discover Weekly" (recommendation system), Netflix\'s "Because you watched..." (same), YouTube\'s autoplay queue (engagement prediction).',
            '**Email and messaging**: Gmail\'s spam filter (classification), Smart Reply suggestions (language generation).',
            '**Shopping**: Amazon\'s "Customers also bought..." (recommendation), Dynamic pricing (demand predictions).',
            '**Healthcare**: Detecting tumours in X-rays and scans (image recognition), Predicting patient deterioration (risk scoring).',
            '**Navigation**: Google Maps ETA (regression/prediction), Traffic prediction (pattern recognition over time).',
            'All of these are examples of narrow AI — each one does its specific job extremely well, but that\'s all it does.'
          ]
        },
        {
          order: 6,
          title: 'Ethics Spotlight — A Brief but Important Note',
          content: [
            'You\'ve just learned how AI systems work. Before we wrap up, there\'s one thing every AI user should understand: AI is only as good — and as fair — as the data it was trained on.',
            'A spam filter trained mostly on English-language emails may perform poorly on emails in other languages.',
            'A face-recognition system trained primarily on photos of light-skinned faces may struggle with darker skin tones.',
            'An autocomplete tool trained on text from one culture may suggest things that feel odd or inappropriate in another.',
            'These aren\'t just technical problems — they can affect real people in real ways. Being aware of this is the first step to being a thoughtful user of AI.',
            'When you encounter an AI system making odd or unfair-seeming decisions, the question to ask is: "What was this trained on, and whose experiences were included?"'
          ]
        }
      ],
      quizzes: [
        {
          title: 'Self-Check Quiz 1 (Lessons 1–3)',
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
            },
            {
              id: 'q1-3',
              question: 'What is the term for the data property used as input to an ML model? For example, the "square footage" of a house when predicting its price.',
              options: [
                { label: 'A', text: 'Label' },
                { label: 'B', text: 'Model' },
                { label: 'C', text: 'Feature' },
                { label: 'D', text: 'Prediction' }
              ],
              answer: 'C',
              explanation: 'A feature is a measurable input property',
              type: 'multiple-choice'
            }
          ]
        },
        {
          title: 'Self-Check Quiz 2 (Lessons 4–5)',
          type: 'self-check',
          questions: [
            {
              id: 'q2-1',
              question: 'A music service groups its users into "classical lovers," "hip-hop fans," and "podcast listeners" without anyone pre-defining those categories. This is an example of:',
              options: [
                { label: 'A', text: 'Supervised learning' },
                { label: 'B', text: 'Unsupervised learning' },
                { label: 'C', text: 'General AI' },
                { label: 'D', text: 'Hardcoded rules' }
              ],
              answer: 'B',
              explanation: 'No labels were provided, so the algorithm found natural groupings',
              type: 'multiple-choice'
            },
            {
              id: 'q2-2',
              question: 'The AI that recommends your next Netflix show is an example of General AI.',
              answer: 'False',
              explanation: 'Netflix\'s recommendation system is narrow AI, designed specifically for that task.',
              type: 'true-false'
            },
            {
              id: 'q2-3',
              question: 'Which of the following is NOT an example of ML being used in everyday life?',
              options: [
                { label: 'A', text: 'A spam filter in your email' },
                { label: 'B', text: 'A light switch turning on when you flip it' },
                { label: 'C', text: 'A map app predicting your drive time' },
                { label: 'D', text: 'Autocomplete on your phone keyboard' }
              ],
              answer: 'B',
              explanation: 'A light switch follows a hardcoded rule (flip = on), with no learning involved',
              type: 'multiple-choice'
            }
          ]
        },
        {
          title: 'Module 1 Certification Assessment',
          type: 'certification',
          questions: [
            {
              id: 'cert-1-1',
              question: 'Which of the following BEST describes the difference between narrow AI and general AI?',
              options: [
                { label: 'A', text: 'Narrow AI is less intelligent, general AI is smarter' },
                { label: 'B', text: 'Narrow AI is designed for one specific task; general AI could perform any intellectual task a human can' },
                { label: 'C', text: 'Narrow AI uses Machine Learning; general AI uses hardcoded rules' },
                { label: 'D', text: 'Narrow AI exists in software; general AI exists in robots' }
              ],
              answer: 'B',
              type: 'multiple-choice'
            },
            {
              id: 'cert-1-2',
              question: 'A bank wants to automatically approve or deny loan applications. They have 500,000 past applications with labels "approved" or "denied." What type of ML would be most appropriate?',
              options: [
                { label: 'A', text: 'Unsupervised learning, because there is too much data' },
                { label: 'B', text: 'Supervised learning, because they have labelled examples' },
                { label: 'C', text: 'General AI, because the decision is complex' },
                { label: 'D', text: 'Hardcoded rules, because finance requires precision' }
              ],
              answer: 'B',
              type: 'multiple-choice'
            },
            {
              id: 'cert-1-3',
              question: 'In the Teachable Machine activity, what was the purpose of collecting many varied images (different angles, lighting, distance)?',
              options: [
                { label: 'A', text: 'To make the model file larger so it runs faster' },
                { label: 'B', text: 'To confuse the algorithm deliberately' },
                { label: 'C', text: 'To expose the model to a wider variety of examples, making it more robust' },
                { label: 'D', text: 'Quantity of images doesn\'t matter — quality is all that counts' }
              ],
              answer: 'C',
              type: 'multiple-choice'
            },
            {
              id: 'cert-1-4',
              question: 'Which of these is an example of UNSUPERVISED learning?',
              options: [
                { label: 'A', text: 'Training an email filter using emails labelled "spam" or "not spam"' },
                { label: 'B', text: 'Training a model using house photos labelled "sold" or "not sold"' },
                { label: 'C', text: 'A streaming service grouping listeners into music taste clusters with no predefined categories' },
                { label: 'D', text: 'Teaching an AI to recognise stop signs from labelled road images' }
              ],
              answer: 'C',
              type: 'multiple-choice'
            },
            {
              id: 'cert-1-5',
              question: 'Describe a Machine Learning application you use in your daily life. Name the application, explain what you think its inputs (features) are, and explain what prediction or output it produces.',
              answer: '',
              type: 'short-answer'
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

    // Seed hands-on activity for Module 1
    if (moduleData.number === 1) {
      const activity = await prisma.activity.create({
        data: {
          moduleId: module.id,
          title: 'Train Your First AI in 15 Minutes',
          description: 'You\'re going to train a real image-recognition AI model — no coding required — using Google\'s free Teachable Machine tool. Your AI will learn to distinguish between two things you choose.',
          content: {
            whatYouNeed: [
              'A computer or laptop with a webcam',
              'A modern web browser (Chrome recommended)',
              'About 15 minutes'
            ],
            steps: [
              'Go to https://teachablemachine.withgoogle.com and click the big green "Get Started" button.',
              'Choose "Image Project", then "Standard image model". You\'ll see Class 1 and Class 2 sections.',
              'Rename Class 1 and Class 2. Suggested pairs: Thumbs Up/Down, Glasses On/Off, Pen/No Pen, Smiling/Not Smiling.',
              'For each class, click "Webcam", hold your gesture/object in front of the camera, press "Hold to Record" for 5–8 seconds. Aim for 50–80 images per class. Vary your position, angle, and lighting.',
              'Click "Train Model". Wait 30–60 seconds.',
              'In the Preview panel, show it Class 1 and Class 2 things — watch the confidence bars shift. Try edge cases.'
            ],
            reflections: [
              'The AI only knows what you showed it. What would happen if someone else tried to use it?',
              'If you only trained it with images of your right hand, will it work for left hands?',
              'Could this system work poorly for certain groups of people? Why?'
            ]
          }
        }
      });

      console.log(`    ✓ Created activity: ${activity.title}`);

      const certification = await prisma.certification.create({
        data: {
          moduleId: module.id,
          title: 'Module 1 Certification Assessment',
          requiredScore: 80,
          content: {
            instructions: 'This certification assessment tests your understanding of AI and ML fundamentals. You need to score 80% or higher to earn your certificate.',
            questions: [
              {
                id: 'cert-1-1',
                question: 'Which of the following BEST describes the difference between narrow AI and general AI?',
                options: [
                  { label: 'A', text: 'Narrow AI is less intelligent, general AI is smarter' },
                  { label: 'B', text: 'Narrow AI is designed for one specific task; general AI could perform any intellectual task a human can' },
                  { label: 'C', text: 'Narrow AI uses Machine Learning; general AI uses hardcoded rules' },
                  { label: 'D', text: 'Narrow AI exists in software; general AI exists in robots' }
                ],
                answer: 'B',
                type: 'multiple-choice'
              },
              {
                id: 'cert-1-2',
                question: 'A bank wants to automatically approve or deny loan applications. They have 500,000 past applications with labels "approved" or "denied." What type of ML would be most appropriate?',
                options: [
                  { label: 'A', text: 'Unsupervised learning, because there is too much data' },
                  { label: 'B', text: 'Supervised learning, because they have labelled examples' },
                  { label: 'C', text: 'General AI, because the decision is complex' },
                  { label: 'D', text: 'Hardcoded rules, because finance requires precision' }
                ],
                answer: 'B',
                type: 'multiple-choice'
              },
              {
                id: 'cert-1-3',
                question: 'In the Teachable Machine activity, what was the purpose of collecting many varied images (different angles, lighting, distance)?',
                options: [
                  { label: 'A', text: 'To make the model file larger so it runs faster' },
                  { label: 'B', text: 'To confuse the algorithm deliberately' },
                  { label: 'C', text: 'To expose the model to a wider variety of examples, making it more robust' },
                  { label: 'D', text: 'Quantity of images doesn\'t matter — quality is all that counts' }
                ],
                answer: 'C',
                type: 'multiple-choice'
              },
              {
                id: 'cert-1-4',
                question: 'Which of these is an example of UNSUPERVISED learning?',
                options: [
                  { label: 'A', text: 'Training an email filter using emails labelled "spam" or "not spam"' },
                  { label: 'B', text: 'Training a model using house photos labelled "sold" or "not sold"' },
                  { label: 'C', text: 'A streaming service grouping listeners into music taste clusters with no predefined categories' },
                  { label: 'D', text: 'Teaching an AI to recognise stop signs from labelled road images' }
                ],
                answer: 'C',
                type: 'multiple-choice'
              },
              {
                id: 'cert-1-5',
                question: 'Describe a Machine Learning application you use in your daily life. Name the application, explain what you think its inputs (features) are, and explain what prediction or output it produces.',
                answer: '',
                type: 'short-answer'
              }
            ]
          }
        }
      });

      console.log(`    ✓ Created certification: ${certification.title}`);
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
