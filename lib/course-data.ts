import { Module } from './types';

export const courseModules: Module[] = [
  {
    id: 'module-1',
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
        id: 'lesson-1-1',
        title: 'What Actually Is AI?',
        content: [
          'You\'ve probably heard the term "Artificial Intelligence" in movies, news headlines, and product ads. But what does it actually mean?',
          'AI is software that can perform tasks that normally require human intelligence — things like recognising a face in a photo, understanding what you said to a voice assistant, or recommending a song you might enjoy. That\'s it. No robots taking over the world. Just software that\'s pretty good at specific cognitive tasks.',
          'There are two ideas people often mean when they say "AI":',
          '**Narrow AI (what actually exists today)**: This is AI designed to do one specific type of task really well. Examples include spam filters, face-unlock systems, Netflix recommendations, and Google Translate.',
          'Narrow AI is excellent at its one job — but completely useless outside it. The AI that beats the world chess champion cannot drive a car, diagnose a medical condition, or recognise your dog.',
          '**General AI (not here yet)**: This would be an AI that can genuinely learn and do anything a human can do, adapting to entirely new situations the way we do. True general AI does not exist yet.',
          'Recent large language models can do many different things — write, reason, translate, summarise, code, and more. But they still have significant limits: they can\'t learn from a new experience the way a human does, they don\'t truly "understand," and they remain highly dependent on the data they were trained on. Think of them as very broad narrow AI.'
        ],
        keyInsight: 'When a news headline says "AI can now do X," they almost always mean a system trained specifically for X — or a large model prompted to do X. It\'s impressive — but it doesn\'t "think" the way you do.',
        video: {
          title: 'What is Artificial Intelligence?',
          source: 'IBM Technology',
          url: 'https://www.youtube.com/watch?v=a0_lo_GDcFw',
          duration: '~6 minutes',
          description: 'A clear, jargon-free overview of what AI is, its history, and why it matters today.'
        }
      },
      {
        id: 'lesson-1-2',
        title: 'So What Is Machine Learning?',
        content: [
          '**The Old Way: Hardcoded Rules**',
          'Imagine you\'re building software to detect spam emails. The old approach was to write rules like: If the subject line contains "FREE MONEY" → mark as spam. If the sender is not in your contacts → mark as spam.',
          'This works for obvious spam. But spammers quickly learned to work around these rules. You\'d need thousands of rules, and you\'d still miss new tricks.',
          '**The Machine Learning Way: Learning from Examples**',
          'Machine Learning (ML) takes a completely different approach. Instead of writing rules, you show the computer thousands of examples and let it figure out the patterns itself.',
          'With spam detection using ML: 1) You gather 10,000 emails labelled "spam" or "not spam". 2) You feed them into an ML algorithm. 3) The algorithm finds patterns (combinations of words, sender behaviours, timing, etc.). 4) It builds a model — essentially a set of rules it discovered on its own. 5) Now it can classify new emails it has never seen before.',
          'The key difference: a human didn\'t program the rules — the machine learned them from data.',
          '**The Simple Analogy**: Think about how a child learns to recognise a cat. You don\'t hand them a rulebook saying "furry + four legs + pointy ears = cat." You just show them cats. Many, many cats. Eventually they can recognise a cat they\'ve never seen before. Machine Learning works the same way — through examples, not instructions.'
        ],
        video: {
          title: 'Machine Learning Explained',
          source: 'Simply Explained (YouTube)',
          url: 'https://www.youtube.com/watch?v=ukzFI9rgwfU',
          duration: '~5 minutes',
          description: 'Explains how machines learn from data using everyday analogies.'
        }
      },
      {
        id: 'lesson-1-3',
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
        id: 'lesson-1-4',
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
        id: 'lesson-1-5',
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
        id: 'lesson-1-6',
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
    selfCheckQuizzes: [
      {
        id: 'quiz-m1-sc1',
        title: 'Self-Check Quiz 1 (Lessons 1–3)',
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
            options: [
              { label: 'A', text: 'True' },
              { label: 'B', text: 'False' }
            ],
            answer: 'B',
            explanation: 'The machine learns the rules from data; humans provide examples, not rules.',
            type: 'multiple-choice'
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
        id: 'quiz-m1-sc2',
        title: 'Self-Check Quiz 2 (Lessons 4–5)',
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
      }
    ],
    handsOnActivity: {
      id: 'activity-m1-teachable',
      title: 'Train Your First AI in 15 Minutes',
      description: 'You\'re going to train a real image-recognition AI model — no coding required — using Google\'s free Teachable Machine tool. Your AI will learn to distinguish between two things you choose.',
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
    },
    certificationAssessment: {
      id: 'cert-m1',
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
          question: 'Which of the following is the BEST example of a Machine Learning application in daily life?',
          options: [
            { label: 'A', text: 'A calculator performing arithmetic operations' },
            { label: 'B', text: 'Netflix recommending shows based on your viewing history' },
            { label: 'C', text: 'A thermostat turning on when temperature drops below a set point' },
            { label: 'D', text: 'A digital clock displaying the current time' }
          ],
          answer: 'B',
          explanation: 'Netflix uses ML to analyze patterns in your viewing behavior to make personalized recommendations.',
          type: 'multiple-choice'
        }
      ]
    },
    keyTakeaways: [
      'AI is software that performs tasks requiring human-like intelligence. Most AI in widespread use today is narrow — designed for one specific task.',
      'Machine Learning is the most common way to build AI. Instead of writing rules, you feed the system labelled examples and it learns patterns from them.',
      'The six vocabulary words that unlock most ML conversations: dataset, feature, label, training, model, prediction',
      'Supervised learning uses labelled examples (right answers included). Unsupervised learning finds patterns without labels.',
      'You use AI/ML every day — in your email, music, maps, shopping, and camera apps.',
      'ML systems are only as good as the data they\'re trained on — and that data can carry biases and blind spots with real consequences.'
    ]
  },
  {
    id: 'module-2',
    number: 2,
    title: 'How Machines Actually Learn — Under the Hood',
    subtitle: 'IIAIC Basic AI/ML Literacy Course',
    level: 'Intermediate Beginner',
    estimatedTime: '90–120 minutes',
    description: 'In this module, you\'ll look under the hood. How does a machine actually "learn"? How do we know if it\'s learned well — or if it\'s quietly failing? And what happens when ML systems go wrong?',
    learningObjectives: [
      'Explain what a dataset is, including the difference between training data and test data, and why the split matters',
      'Describe what overfitting is and why it\'s a problem',
      'Interpret a basic confusion matrix to evaluate a model\'s performance',
      'Describe the concept of linear regression using a visual/spreadsheet example',
      'Identify at least three ways bias enters ML systems and why this raises ethical concerns'
    ],
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'The Anatomy of a Dataset',
        content: [
          'A dataset is a structured collection of examples. Think of it like a spreadsheet where:',
          '• Each row is one example (one record, one observation)',
          '• Each column is one feature (one measurable property)',
          '• One special column is the label — the correct answer you want to predict',
          'Real-world datasets have thousands, millions, or even billions of rows.',
          '**Data Quality Matters Enormously**',
          'A model is only as good as the data it learned from. Garbage in, garbage out. Common data quality problems:',
          '• Missing values: Some cells are empty or recorded as "unknown"',
          '• Inconsistent formats: Dates written as "01/05/2024" vs. "May 1, 2024"',
          '• Outliers: A house listed at $50 million in a neighbourhood of $300,000 homes',
          '• Imbalanced classes: If your spam dataset has 95% "not spam" and 5% "spam," a model that just always says "not spam" will be 95% accurate but completely useless'
        ],
        keyInsight: 'Data scientists often report that 60–80% of their actual work time is spent on data cleaning and preparation — not on building models.'
      },
      {
        id: 'lesson-2-2',
        title: 'Training Data vs. Test Data',
        content: [
          '**The Problem with Testing on What You Trained With**',
          'Imagine a student who memorises every question and answer from last year\'s exam exactly. On that exact exam, they\'d get 100%. But put a new question in front of them — they\'d struggle, because they memorised, not understood. ML models can do the same thing.',
          '**The Solution: The Train/Test Split**',
          'Before training, you randomly split your dataset into two parts:',
          '• Training Set (~80%) — Used to train the model',
          '• Test Set (~20%) — Locked away, used ONLY to evaluate',
          'The test set is like the final exam the student has never seen. It gives you an honest measure of how well the model will perform on new, real-world data.'
        ],
        keyInsight: 'Think of the test set as a sealed envelope. You set it aside on day one, train your model using only the training data, and only open the envelope at the very end. If you peek at the test data during training — even accidentally — your results can\'t be trusted.'
      },
      {
        id: 'lesson-2-3',
        title: 'Overfitting: When a Model Is TOO Good at Studying',
        content: [
          'Overfitting happens when a model learns the training data too well — including its noise and quirks — and fails to generalise to new data.',
          '**Underfitting (too simple)**: The model hasn\'t learned enough — like drawing a straight line through data that clearly curves.',
          '**Good fit**: The model captures the real pattern without chasing every noise point. Generalises well to new data.',
          '**Overfitting (too complex)**: The model has traced every single data point perfectly, including noise and outliers. Looks amazing on training data, fails on test data.',
          '**Spotting Overfitting**: The warning sign is a large gap between training performance and test performance.',
          '| Underfitting | 60% training, 58% test | Both low — model too simple',
          '| Good fit | 92% training, 89% test | Close together — healthy',
          '| Overfitting | 99% training, 71% test | Big gap — memorised, didn\'t learn',
          '**How to Fight Overfitting**:',
          '• Use more training data — harder to memorise a million examples than a hundred',
          '• Simplify the model — fewer parameters, less room to memorise',
          '• Data augmentation — artificially create more training examples'
        ],
        video: {
          title: 'Overfitting and Underfitting in Machine Learning',
          source: 'StatQuest with Josh Starmer',
          url: 'https://www.youtube.com/watch?v=EuBBz3bI-aA',
          duration: '~8 minutes',
          description: 'A highly visual explanation of overfitting vs. underfitting using clear diagrams.'
        }
      },
      {
        id: 'lesson-2-4',
        title: 'Evaluating a Model: The Confusion Matrix',
        content: [
          '**More Than Just "Accuracy"**',
          'Accuracy sounds like all you need. But it can be deeply misleading. Scenario: You\'re building a model to detect a rare disease that affects 1% of people tested. A model that just says "no disease" for everyone would be 99% accurate — and completely useless.',
          '**What Is a Confusion Matrix?**',
          'For a yes/no prediction, you have four possible outcomes:',
          '• True Positive (TP): Model correctly identifies a sick person.',
          '• True Negative (TN): Model correctly identifies a healthy person.',
          '• False Positive (FP): Model says "sick" but the person is healthy. (Unnecessary alarm)',
          '• False Negative (FN): Model says "healthy" but the person is sick. (Dangerous miss)',
          '**Two Extra Metrics Worth Knowing**:',
          '• Precision = Of everyone the model flagged as positive, how many actually were? TP / (TP + FP)',
          '• Recall (Sensitivity) = Of all actual positives, how many did the model catch? TP / (TP + FN)'
        ],
        keyInsight: 'For medical diagnosis, high Recall is usually more important than high Precision — it\'s worse to miss a real case than to have some false alarms. For spam filtering, you might prioritise Precision — accidentally marking a real email as spam is annoying.',
        video: {
          title: 'Confusion Matrix Explained',
          source: 'Simplilearn',
          url: 'https://www.youtube.com/watch?v=wpp3VfzgNcI',
          duration: '~9 minutes',
          description: 'A step-by-step walkthrough of confusion matrices with worked examples.'
        }
      },
      {
        id: 'lesson-2-5',
        title: 'Linear Regression: Predicting Numbers, Not Categories',
        content: [
          '**When the Answer Is a Number**',
          'Sometimes we want to predict a number — a price, a temperature, a travel time. Regression is the family of ML techniques that do this.',
          '**The Concept**',
          'Imagine you have data on house sizes (square footage) and their sale prices. If you plot them on a graph, you\'d probably see a cloud of dots that trends upward: bigger house → higher price.',
          'Linear regression draws the best-fit straight line through that cloud of dots. Once you have that line, you can predict the price of any house by plugging in its size.',
          '**Formula**: Price = (slope × Size) + starting value',
          'Example: If slope = $200/sqft and starting value = $50,000:',
          '• A 1,000 sq ft house: $200 × 1,000 + $50,000 = $250,000',
          '• A 1,500 sq ft house: $200 × 1,500 + $50,000 = $350,000',
          '**What "Learning" Means in Regression**',
          'The model "learns" by adjusting the slope and starting value until the predicted prices are as close as possible to the actual prices. The gap between prediction and actual is called the error (or loss).'
        ],
        keyInsight: 'This is the same "trend line" or "line of best fit" you may have seen in a high school science class — just applied to predictions.'
      },
      {
        id: 'lesson-2-6',
        title: 'Data Bias, Fairness, and Ethics in ML',
        content: [
          'Bias in ML does not mean the algorithm is prejudiced. It means the model has learned distorted patterns because of problems in the data or design process.',
          '**1. Historical Bias**: The training data reflects real-world inequalities. Example: Amazon built a recruiting AI that penalised résumés containing the word "women\'s" because historical hiring data was biased.',
          '**2. Representation Bias**: The training data doesn\'t include enough examples of certain groups. Example: Early facial recognition systems performed worse on darker-skinned faces because training datasets were overwhelmingly lighter-skinned.',
          '**3. Measurement Bias**: The way data was collected introduces distortions. Example: Using "arrest rate" as a proxy for "crime rate" introduces bias from historical over-policing.',
          '**4. Feedback Loops**: The model\'s predictions influence future data, reinforcing biases. Example: A recommendation algorithm learns that outrage content keeps people watching → recommends more → gets positive feedback → recommends even more.',
          '**Why This Matters**: ML systems now influence who gets a job interview, who gets approved for a loan, who gets shown a university ad, who gets flagged by law enforcement.',
          '**Transparency and Explainability**: Many powerful ML models are "black boxes." The question to always ask: If this system makes a decision that harms someone, can they understand why — and challenge it?'
        ],
        keyInsight: 'AI is a powerful tool, but it is not neutral. Every AI system encodes assumptions made by its designers, the data it was trained on, and the goals it was optimised for.',
        video: {
          title: 'AI Bias Explained',
          source: 'MIT Media Lab / AI Ethics researchers',
          url: 'https://www.youtube.com/watch?v=59bMh59JQDo',
          duration: '~7 minutes',
          description: 'Real-world examples of algorithmic bias in hiring, facial recognition, and healthcare.'
        }
      }
    ],
    selfCheckQuizzes: [
      {
        id: 'quiz-m2-1',
        title: 'Self-Check Quiz 1 (Lessons 1–3)',
        questions: [
          {
            id: 'q2-1-1',
            question: 'A model scores 97% accuracy on the training set but only 63% on the test set. This is most likely:',
            options: [
              { label: 'A', text: 'Underfitting' },
              { label: 'B', text: 'A perfect result — 97% is great' },
              { label: 'C', text: 'Overfitting' },
              { label: 'D', text: 'A data quality issue' }
            ],
            answer: 'C',
            explanation: 'The large gap between training (97%) and test (63%) is the classic overfitting signature',
            type: 'multiple-choice'
          },
          {
            id: 'q2-1-2',
            question: 'It is fine to look at the test set several times during training to check how you\'re doing.',
            answer: 'False',
            explanation: 'Peeking at the test set contaminates your honest evaluation; the test set must stay locked away.',
            type: 'true-false'
          },
          {
            id: 'q2-1-3',
            question: 'In a dataset for predicting customer churn, "Monthly spend amount" is a _____ and "Cancelled: Yes/No" is a _____.',
            options: [
              { label: 'A', text: 'Feature, Label' },
              { label: 'B', text: 'Label, Feature' },
              { label: 'C', text: 'Prediction, Model' },
              { label: 'D', text: 'Model, Dataset' }
            ],
            answer: 'A',
            explanation: '"Monthly spend amount" is an input feature, while "Cancelled: Yes/No" is the label we\'re trying to predict.',
            type: 'multiple-choice'
          }
        ]
      },
      {
        id: 'quiz-m2-2',
        title: 'Self-Check Quiz 2 (Lessons 4–5)',
        questions: [
          {
            id: 'q2-2-1',
            question: 'A fraud detection model tests 10,000 transactions. 100 are actual fraud. The model catches 60 of the 100 fraudulent transactions and flags 200 legitimate transactions as fraud by mistake. What are TP and FP?',
            options: [
              { label: 'A', text: 'TP = 60, FP = 200' },
              { label: 'B', text: 'TP = 200, FP = 60' },
              { label: 'C', text: 'TP = 100, FP = 200' },
              { label: 'D', text: 'TP = 60, FP = 40' }
            ],
            answer: 'A',
            explanation: 'The model correctly caught 60 (TP) and incorrectly flagged 200 legitimate ones (FP)',
            type: 'multiple-choice'
          },
          {
            id: 'q2-2-2',
            question: 'For a model predicting whether a patient has a serious illness, recall is usually more important than precision.',
            options: [
              { label: 'A', text: 'True' },
              { label: 'B', text: 'False' }
            ],
            answer: 'A',
            explanation: 'Missing a real illness (False Negative) is more dangerous than a false alarm.',
            type: 'multiple-choice'
          },
          {
            id: 'q2-2-3',
            question: 'A linear regression model for predicting taxi fare: Fare = ($1.50 × km) + $3.00. What fare would it predict for a 10 km trip?',
            options: [
              { label: 'A', text: '$13.50' },
              { label: 'B', text: '$15.00' },
              { label: 'C', text: '$18.00' },
              { label: 'D', text: '$10.00' }
            ],
            answer: 'C',
            explanation: '($1.50 × 10) + $3.00 = $15 + $3 = $18.00',
            type: 'multiple-choice'
          }
        ]
      },
      {
        id: 'quiz-m2-3',
        title: 'Self-Check Quiz 3 (Lesson 6)',
        questions: [
          {
            id: 'q2-3-1',
            question: 'A loan approval ML model trained on 10 years of historical data is less likely to approve loans for applicants from certain postcodes. This is most likely:',
            options: [
              { label: 'A', text: 'Overfitting' },
              { label: 'B', text: 'Historical or representation bias inherited from past lending practices' },
              { label: 'C', text: 'Underfitting — the model didn\'t learn enough' },
              { label: 'D', text: 'A bug in the algorithm code' }
            ],
            answer: 'B',
            explanation: 'Past lending practices embedded geographic discrimination, which the model learned to replicate',
            type: 'multiple-choice'
          },
          {
            id: 'q2-3-2',
            question: 'A model can be biased even if the algorithm itself contains no intentional prejudice, simply because the training data reflects historical inequalities.',
            options: [
              { label: 'A', text: 'True' },
              { label: 'B', text: 'False' }
            ],
            answer: 'A',
            explanation: 'Bias enters through data, not necessarily through code.',
            type: 'multiple-choice'
          }
        ]
      }
    ],
    handsOnActivity: {
      id: 'activity-m2-regression',
      title: 'Build a Regression Model in Google Sheets',
      description: 'You\'re going to build a simple linear regression model using a real dataset directly in Google Sheets — visualise it, make predictions with it, and explore what happens when you add more data.',
      whatYouNeed: [
        'A free Google account',
        'Google Sheets (free, browser-based)',
        'About 25–30 minutes'
      ],
      steps: [
        'Go to https://sheets.google.com and create a new blank spreadsheet.',
        'Enter the Study Hours vs Exam Score dataset (1→45, 2→52, 3→61, etc.)',
        'Select all your data. Go to Insert → Chart.',
        'In the Chart Editor, select "Scatter chart."',
        'Click "Customize" → "Series" → Check "Trendline."',
        'Change the "Label" dropdown to "Use Equation" to see something like y = 5.8x + 39.2',
        'The slope (5.8) means each additional hour predicts about 5.8 more points.',
        'In Column C, add predicted scores: =5.8*A2+39.2. Compare actual vs predicted.',
        'Try adding study hours = 15. Is the prediction realistic?',
        'Add an outlier (5 hours, score 20). Notice how it affects the trendline.'
      ],
      reflections: [
        'If your model is y = 5.8x + 39.2, and a student studied 6.5 hours, what score does it predict?',
        'Would you trust this model for a different school in a different country?',
        'What other features besides study hours might help predict exam scores?'
      ]
    },
    certificationAssessment: {
      id: 'cert-m2',
      questions: [
        {
          id: 'cert-2-1',
          question: 'You train a model to classify customer reviews as positive or negative. Training accuracy is 94% but test accuracy is 68%. What is the most likely problem?',
          options: [
            { label: 'A', text: 'The training set was too large' },
            { label: 'B', text: 'The model is underfitting — it needs to be more complex' },
            { label: 'C', text: 'The model is overfitting — it memorised the training data' },
            { label: 'D', text: 'The test set should have been larger than the training set' }
          ],
          answer: 'C',
          type: 'multiple-choice'
        },
        {
          id: 'cert-2-2',
          question: 'A spam filter was tested on 500 emails. 50 were actual spam. The model correctly identified 40 spam emails, missed 10, and incorrectly flagged 5 legitimate emails as spam. What is the model\'s RECALL for spam detection?',
          options: [
            { label: 'A', text: '40/45 = 88.9%' },
            { label: 'B', text: '40/50 = 80%' },
            { label: 'C', text: '40/55 = 72.7%' },
            { label: 'D', text: '45/500 = 9%' }
          ],
          answer: 'B',
          type: 'multiple-choice'
        },
        {
          id: 'cert-2-3',
          question: 'A linear regression model for predicting house prices produces the equation: Price = $180 × (square footage) + $40,000. What price does it predict for a 2,000 sq ft house?',
          options: [
            { label: 'A', text: '$220,000' },
            { label: 'B', text: '$360,000' },
            { label: 'C', text: '$400,000' },
            { label: 'D', text: '$180,000' }
          ],
          answer: 'C',
          type: 'multiple-choice'
        },
        {
          id: 'cert-2-4',
          question: 'A hiring algorithm trained on 15 years of company hiring data consistently ranks applications from women lower than equally qualified male applicants. The most likely root cause is:',
          options: [
            { label: 'A', text: 'The algorithm contains intentionally sexist code' },
            { label: 'B', text: 'The test set was contaminated by training data' },
            { label: 'C', text: 'Historical bias — past hiring data reflected gender imbalances which the model learned to replicate' },
            { label: 'D', text: 'Overfitting to recent applicant data' }
          ],
          answer: 'C',
          type: 'multiple-choice'
        },
        {
          id: 'cert-2-5',
          question: 'In which scenario would maximising RECALL be more important than Precision?',
          options: [
            { label: 'A', text: 'Spam email filter (we want to avoid false alarms)' },
            { label: 'B', text: 'Disease screening test (we want to catch all potential cases)' },
            { label: 'C', text: 'Restaurant recommendation system (we want highly relevant suggestions)' },
            { label: 'D', text: 'Product search results (we want only exact matches)' }
          ],
          answer: 'B',
          explanation: 'In medical screening, it is more important to catch all potential cases (high recall) even if it means some false positives, because missing a disease (false negative) could be life-threatening.',
          type: 'multiple-choice'
        }
      ]
    },
    keyTakeaways: [
      'A dataset is a table of examples: rows are examples, columns are features, one column is the label',
      'Always split your data into a training set and a test set. Never evaluate a model on data it trained on',
      'Overfitting is when a model performs great on training data but poorly on new data — it memorised instead of generalising',
      'A confusion matrix breaks down model errors into four types: True Positives, True Negatives, False Positives, and False Negatives',
      'Precision measures how many positive predictions were correct; Recall measures how many actual positives were found',
      'Linear regression finds the best-fit line through data to predict numerical values',
      'ML bias can come from historical data, underrepresentation, flawed measurement, or feedback loops',
      'Ethical AI requires asking: Who is this system designed to serve? Who might it disadvantage?'
    ]
  }
];
