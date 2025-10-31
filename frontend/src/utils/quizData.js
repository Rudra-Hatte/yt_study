export const JAVASCRIPT_QUIZZES = [
  {
    id: 1,
    questions: [
      {
        question: "What is JavaScript?",
        options: [
          "A programming language",
          "A markup language",
          "A database",
          "An operating system"
        ],
        correctAnswer: 0
      },
      {
        question: "What is a variable?",
        options: [
          "A container for storing data",
          "A type of function",
          "A programming language",
          "A web browser"
        ],
        correctAnswer: 0
      },
      {
        question: "Which keyword is used to declare variables in modern JavaScript?",
        options: [
          "var",
          "let",
          "const",
          "Both let and const"
        ],
        correctAnswer: 3
      }
    ]
  }
];

export const getQuizForVideo = () => {
  return JAVASCRIPT_QUIZZES[0].questions;
};