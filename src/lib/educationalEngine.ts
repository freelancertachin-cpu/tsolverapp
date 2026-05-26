
import { storage } from './storage';
import * as math from 'mathjs';

export interface TopicContent {
  subject: string;
  topic: string;
  explanation: string;
  formulas?: { name: string; formula: string; explanation: string }[];
  examples: { question: string; answer: string; steps: string[] }[];
  notes?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'conceptual' | 'rapid-fire';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const EDUCATIONAL_DATA: Record<string, Record<string, TopicContent>> = {
  math: {
    algebra: {
      subject: 'Mathematics',
      topic: 'Algebra',
      explanation: 'Algebra is about finding the unknown or putting real-life variables into equations and then solving them. It uses letters (like x or y) to represent numbers.',
      formulas: [
        { name: 'Quadratic Formula', formula: 'x = (-b ± √(b² - 4ac)) / 2a', explanation: 'Used to find the roots of a quadratic equation ax² + bx + c = 0.' },
        { name: 'Slope-Intercept Form', formula: 'y = mx + b', explanation: 'Determines the slope (m) and y-intercept (b) of a line.' }
      ],
      examples: [
        { 
          question: 'Solve for x: 2x + 5 = 15', 
          answer: 'x = 5', 
          steps: ['Subtract 5 from both sides: 2x = 10', 'Divide by 2: x = 5'] 
        }
      ],
      notes: 'Focus on isolating the variable by performing the same operations on both sides of the equation.'
    },
    calculus: {
      subject: 'Mathematics',
      topic: 'Calculus',
      explanation: 'Calculus is the mathematical study of continuous change. It has two main branches: differential calculus and integral calculus.',
      formulas: [
        { name: 'Power Rule', formula: 'd/dx (x^n) = nx^(n-1)', explanation: 'Used for finding the derivative of power functions.' },
        { name: 'Fundamental Theorem of Calculus', formula: '∫[a,b] f(x)dx = F(b) - F(a)', explanation: 'Relates differentiation and integration.' }
      ],
      examples: [
        {
          question: 'Find the derivative of f(x) = 3x²',
          answer: '6x',
          steps: ['Apply power rule: multiply power (2) by coefficient (3)', 'Decrease power by 1: 2-1 = 1', 'Result: 6x']
        }
      ],
      notes: 'Understanding limits is the foundation of calculus.'
    }
  },
  physics: {
    mechanics: {
      subject: 'Physics',
      topic: 'Mechanics',
      explanation: 'Mechanics deals with the motion of bodies under the influence of forces.',
      formulas: [
        { name: "Newton's Second Law", formula: 'F = ma', explanation: 'Force equals mass times acceleration.' },
        { name: 'Kinematic Equation', formula: 'v = u + at', explanation: 'Relates velocity, acceleration, and time.' }
      ],
      examples: [
        {
          question: 'A 5kg object accelerates at 2m/s². Find the force.',
          answer: '10N',
          steps: ['Identify mass (m) = 5kg', 'Identify acceleration (a) = 2m/s²', 'Multiply: F = 5 * 2 = 10N']
        }
      ],
      notes: 'Always check if units are consistent (SI units).'
    }
  },
  chemistry: {
    organic: {
      subject: 'Chemistry',
      topic: 'Organic',
      explanation: 'Organic chemistry is the study of the structure, properties, composition, reactions, and preparation of carbon-containing compounds.',
      formulas: [
        { name: 'Alcane General Formula', formula: 'CnH2n+2', explanation: 'General formula for saturated hydrocarbons.' }
      ],
      examples: [
        { question: 'What is the formula for Methane?', answer: 'CH4', steps: ['Put n=1 in CnH2n+2', 'C1H(2*1+2) = CH4'] }
      ],
      notes: 'Focus on functional groups and bonding patterns.'
    }
  },
  ict: {
    programming: {
      subject: 'ICT',
      topic: 'Programming',
      explanation: 'Programming is the process of creating a set of instructions that tell a computer how to perform a task.',
      examples: [
        { question: 'What is the output of print(2+3) in Python?', answer: '5', steps: ['The interpreter evaluates the expression 2+3', 'It outputs the result using the print function.'] }
      ],
      notes: 'Consistency and logic are key in coding.'
    }
  },
  biology: {
    'genetics': {
      subject: 'Biology',
      topic: 'Genetics',
      explanation: 'Genetics is the study of genes, genetic variation, and heredity in organisms.',
      examples: [
        { question: 'Who is the father of genetics?', answer: 'Gregor Mendel', steps: ['Mendel studied pea plants to discover laws of inheritance.'] }
      ],
      notes: 'DNA is the blueprint of life.'
    },
    'cell biology': {
      subject: 'Biology',
      topic: 'Cell Biology',
      explanation: 'Study of cell structure and function, the basic unit of life.',
      examples: [
        { question: 'What is the "powerhouse" of the cell?', answer: 'Mitochondria', steps: ['Mitochondria generate ATP through cellular respiration.'] }
      ],
      notes: 'All living things are made of cells.'
    }
  },
  accounting: {
    'financial accounting': {
      subject: 'Accounting',
      topic: 'Financial Accounting',
      explanation: 'Financial accounting is a branch of accounting that keeps track of a company\'s financial transactions.',
      examples: [
        { question: 'What is the Accounting Equation?', answer: 'Assets = Liabilities + Equity', steps: ['Every transaction must keep this equation balanced.'] }
      ],
      notes: 'Accurate record-keeping is the backbone of business.'
    },
    'cost accounting': {
      subject: 'Accounting',
      topic: 'Cost Accounting',
      explanation: 'Recording and analyzing the costs incurred by a business.',
      examples: [
        { question: 'Define Fixed Costs.', answer: 'Costs that do not change with the volume of production.', steps: ['Rent and salaries are typical examples.'] }
      ]
    }
  },
  economics: {
    'microeconomics': {
      subject: 'Economics',
      topic: 'Microeconomics',
      explanation: 'Microeconomics is the study of individuals, households and firms\' behavior in decision making and allocation of resources.',
      examples: [
        { question: 'What is the Law of Demand?', answer: 'Price and Quantity Demanded have an inverse relationship.', steps: ['As price goes up, demand goes down.'] }
      ],
      notes: 'Resources are scarce, so choices must be made.'
    },
    'macroeconomics': {
      subject: 'Economics',
      topic: 'Macroeconomics',
      explanation: 'Study of how an overall economy behaves.',
      examples: [
        { question: 'What comprises GDP?', answer: 'Consumption + Investment + Government Spending + Net Exports', steps: ['GDP = C + I + G + (X - M)'] }
      ]
    }
  },
  bangla: {
    'ব্যাকরণ (grammar)': {
      subject: 'Bangla',
      topic: 'ব্যাকরণ (Grammar)',
      explanation: 'বাংলা ব্যাকরণ ভাষার গঠন ও শুদ্ধভাবে ব্যবহারের নিয়মাবলী আলোচনা করে।',
      examples: [
        { question: 'স্বরবর্ণ কয়টি?', answer: '১১টি', steps: ['অ, আ, ই, ঈ, উ, ঊ, ঋ, এ, ঐ, ও, ঔ'] }
      ],
      notes: 'ব্যাকরণ ভাষাকে মজবুত করে।'
    }
  }
};

const QUESTIONS: Record<string, QuizQuestion[]> = {
  math: [
    {
      id: 'm1',
      type: 'multiple-choice',
      difficulty: 'easy',
      question: 'What is the square root of 144?',
      options: ['10', '12', '14', '16'],
      answer: '12',
      explanation: '12 * 12 = 144.'
    },
    {
      id: 'm2',
      type: 'conceptual',
      difficulty: 'medium',
      question: 'What is a prime number?',
      answer: 'A number greater than 1 that has no positive divisors other than 1 and itself.',
      explanation: 'Examples include 2, 3, 5, 7, 11...'
    },
    {
      id: 'm3',
      type: 'rapid-fire',
      difficulty: 'hard',
      question: 'Solve for x: x/2 + 7 = 10',
      answer: '6',
      explanation: 'x/2 = 3, so x = 6.'
    }
  ],
  physics: [
    {
      id: 'p1',
      type: 'multiple-choice',
      difficulty: 'easy',
      question: 'Which of the following is a unit of Force?',
      options: ['Joule', 'Newton', 'Watt', 'Pascal'],
      answer: 'Newton',
      explanation: 'Named after Isaac Newton.'
    }
  ],
  ict: [
    {
      id: 'i1',
      type: 'multiple-choice',
      difficulty: 'easy',
      question: 'What does HTML stand for?',
      options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Tool Multi Language', 'None'],
      answer: 'Hyper Text Markup Language',
      explanation: 'Standard markup language for web pages.'
    }
  ],
  chemistry: [
    {
      id: 'c1',
      type: 'multiple-choice',
      difficulty: 'medium',
      question: 'What is the atomic number of Oxygen?',
      options: ['6', '7', '8', '9'],
      answer: '8',
      explanation: 'Oxygen has 8 protons.'
    }
  ]
};

export class EducationalEngine {
  static getTopic(subject: string, topic: string) {
    return EDUCATIONAL_DATA[subject.toLowerCase()]?.[topic.toLowerCase()] || null;
  }

  static generateQuiz(subject: string, type?: string, count: number = 5) {
    const list = QUESTIONS[subject.toLowerCase()] || [];
    let filtered = list;
    if (type) filtered = list.filter(q => q.type === type);
    
    // Shuffle and pick
    return filtered.sort(() => Math.random() - 0.5).slice(0, count);
  }

  static async getAITeacherResponse(subject: string, query: string) {
    const q = query.toLowerCase();
    const data = EDUCATIONAL_DATA[subject.toLowerCase()];
    
    if (!data) return "I am still learning about this subject. Try asking about Math or Physics!";

    for (const topicKey in data) {
      if (q.includes(topicKey)) {
        const topic = data[topicKey];
        return `Let's talk about ${topic.topic}! ${topic.explanation} Would you like to see a formula or an example?`;
      }
    }

    if (q.includes('formula')) {
      return "Sure! Which topic are you looking for a formula in? I have data on Algebra, Calculus, and Mechanics.";
    }

    if (q.includes('hello') || q.includes('hi')) {
      return `Hello! I am your AI Teacher for ${subject}. How can I assist your learning today?`;
    }

    return "That's an interesting question. While I don't have a specific answer for that yet, I can help you with topics like Algebra, Calculus, or Mechanics. What would you like to explore?";
  }

  static async solveEquation(equation: string): Promise<string> {
    try {
      if (!equation.includes('=')) {
        return math.evaluate(equation).toString();
      }
      
      const parts = equation.split('=');
      const simplified = `(${parts[0]}) - (${parts[1]})`;
      // For simple linear equations, we can try to find the root
      // In a real app we would use nerdamer.solve
      return `Target Expression: ${simplified} = 0. Use the Graph Plotter to visualize roots.`;
    } catch (e) {
      return "Could not solve this. Please double check the format.";
    }
  }

  static async recordAnalytics(userId: string, data: { subject: string; score: number; timeSpent: number; topic?: string }) {
    const user = await storage.getCurrentUser();
    if (!user) return;
    
    // Save to local storage for analytics
    const analyticsKey = `tsolver_analytics_${userId}`;
    const raw = localStorage.getItem(analyticsKey);
    const analytics = raw ? JSON.parse(raw) : [];
    analytics.push({ ...data, timestamp: Date.now() });
    localStorage.setItem(analyticsKey, JSON.stringify(analytics));
  }
}
