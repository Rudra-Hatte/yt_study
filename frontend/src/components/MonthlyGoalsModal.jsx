import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, TrendingUp, Calendar, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MonthlyGoalsModal = ({ isOpen, onClose }) => {
  const [goals, setGoals] = useState([
    { id: 1, title: 'Complete 5 courses', progress: 3, target: 5, completed: false },
    { id: 2, title: 'Study 20 hours', progress: 12, target: 20, completed: false },
    { id: 3, title: 'Take 30 quizzes', progress: 23, target: 30, completed: false },
    { id: 4, title: 'Maintain 7-day streak', progress: 5, target: 7, completed: false }
  ]);
  const [newGoal, setNewGoal] = useState({ title: '', target: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.target) {
      toast.error('Please fill in all fields');
      return;
    }

    const goal = {
      id: Date.now(),
      title: newGoal.title,
      progress: 0,
      target: parseInt(newGoal.target),
      completed: false
    };

    setGoals([...goals, goal]);
    setNewGoal({ title: '', target: '' });
    setShowAddForm(false);
    toast.success('Goal added successfully! 🎯');
  };

  const handleDeleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));
    toast.success('Goal removed');
  };

  const totalProgress = goals.length > 0
    ? goals.reduce((sum, goal) => sum + calculateProgress(goal.progress, goal.target), 0) / goals.length
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          >
            <div className="bg-white dark:bg-dark-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Target className="w-6 h-6 sm:w-8 sm:h-8" />
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold">Monthly Goals</h2>
                      <p className="text-purple-100 text-xs sm:text-sm">{currentMonth}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Overall Progress */}
                <div className="mt-4 bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-purple-100">Overall Progress</span>
                    <span className="text-sm font-bold">{Math.round(totalProgress)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${totalProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-white h-3 rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                {/* Goals List */}
                <div className="space-y-3">
                  {goals.map((goal, index) => {
                    const progress = calculateProgress(goal.progress, goal.target);
                    const isCompleted = goal.progress >= goal.target;

                    return (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white dark:bg-dark-700 border ${
                          isCompleted 
                            ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                            : 'border-gray-200 dark:border-dark-600'
                        } rounded-xl p-4`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <h3 className={`font-semibold ${
                                isCompleted 
                                  ? 'text-green-900 dark:text-green-100 line-through' 
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}>
                                {goal.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {goal.progress} / {goal.target} {isCompleted ? '✓ Completed!' : ''}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                            className={`h-2.5 rounded-full ${
                              isCompleted 
                                ? 'bg-green-500' 
                                : 'bg-gradient-to-r from-purple-500 to-pink-500'
                            }`}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Add New Goal */}
                {showAddForm ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Add New Goal</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Goal Description
                        </label>
                        <input
                          type="text"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                          placeholder="e.g., Complete 5 courses"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Target Number
                        </label>
                        <input
                          type="number"
                          value={newGoal.target}
                          onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                          placeholder="e.g., 5"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddGoal}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          Add Goal
                        </button>
                        <button
                          onClick={() => {
                            setShowAddForm(false);
                            setNewGoal({ title: '', target: '' });
                          }}
                          className="px-4 py-2 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full bg-white dark:bg-dark-700 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-xl p-4 text-gray-600 dark:text-gray-400 hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add New Goal</span>
                  </button>
                )}

                {/* Motivational Footer */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 p-4 rounded-xl">
                  <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                    🎯 Set meaningful goals and track your progress. You're {Math.round(totalProgress)}% of the way there!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MonthlyGoalsModal;
