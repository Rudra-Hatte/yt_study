export const JAVASCRIPT_FLASHCARDS = [
  {
    id: 1,
    cards: [
      {
        front: "What is JavaScript?",
        back: "A high-level, interpreted programming language primarily used for creating interactive web experiences."
      },
      {
        front: "What is a Variable?",
        back: "A container for storing data values in JavaScript."
      },
      {
        front: "What are Data Types in JavaScript?",
        back: "String, Number, Boolean, Object, Array, Null, Undefined"
      }
    ]
  }
];

export const getFlashcardsForVideo = () => {
  return JAVASCRIPT_FLASHCARDS[0].cards;
};