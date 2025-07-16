import React, { useState } from 'react';

const GoalPlanner = ({ currentSIP, onGoalUpdate }) => {
  const [goals, setGoals] = useState([
    { id: 1, name: 'Child Education', amount: 2000000, years: 18, priority: 'high' },
    { id: 2, name: 'Home Purchase', amount: 5000000, years: 10, priority: 'medium' },
    { id: 3, name: 'Retirement', amount: 10000000, years: 30, priority: 'high' },
    { id: 4, name: 'Emergency Fund', amount: 500000, years: 2, priority: 'high' },
  ]);

  const [newGoal, setNewGoal] = useState({
    name: '',
    amount: '',
    years: '',
    priority: 'medium'
  });

  const [showForm, setShowForm] = useState(false);

  const addGoal = () => {
    if (newGoal.name && newGoal.amount && newGoal.years) {
      setGoals([...goals, {
        id: Date.now(),
        name: newGoal.name,
        amount: parseInt(newGoal.amount),
        years: parseInt(newGoal.years),
        priority: newGoal.priority
      }]);
      setNewGoal({ name: '', amount: '', years: '', priority: 'medium' });
      setShowForm(false);
    }
  };

  const removeGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const calculateRequiredSIP = (goalAmount, years, returnRate = 12) => {
    if (!goalAmount || !years || goalAmount <= 0 || years <= 0) return 0;
    
    const monthlyRate = (returnRate / 100) / 12;
    const months = years * 12;
    
    if (monthlyRate === 0) return goalAmount / months;
    
    const requiredSIP = goalAmount * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.max(0, requiredSIP);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalRequiredSIP = goals.reduce((sum, goal) => sum + calculateRequiredSIP(goal.amount, goal.years), 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">🎯 Goal Planner</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Goal'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Goal name"
              value={newGoal.name}
              onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Target amount"
              value={newGoal.amount}
              onChange={(e) => setNewGoal({...newGoal, amount: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Years to achieve"
              value={newGoal.years}
              onChange={(e) => setNewGoal({...newGoal, years: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newGoal.priority}
              onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          <button
            onClick={addGoal}
            className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Add Goal
          </button>
        </div>
      )}

      <div className="space-y-4">
        {goals.map((goal) => {
          const requiredSIP = calculateRequiredSIP(goal.amount, goal.years);
          const isAffordable = requiredSIP <= currentSIP;
          
          return (
            <div key={goal.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{goal.name}</h4>
                  <p className="text-gray-600">₹{goal.amount.toLocaleString()} in {goal.years} years</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(goal.priority)}`}>
                    {goal.priority}
                  </span>
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Required SIP:</span>
                  <div className={`font-semibold ${isAffordable ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{requiredSIP.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <div className={`font-semibold ${isAffordable ? 'text-green-600' : 'text-red-600'}`}>
                    {isAffordable ? '✓ Achievable' : '✗ Increase SIP'}
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{isAffordable ? '100%' : Math.round((currentSIP / requiredSIP) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isAffordable ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (currentSIP / requiredSIP) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <div className="text-center">
          <h4 className="font-semibold text-lg mb-2">Total Required SIP</h4>
          <p className="text-3xl font-bold text-blue-600">
            ₹{totalRequiredSIP.toLocaleString(undefined, {maximumFractionDigits: 0})}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {totalRequiredSIP > currentSIP ? 
              `Increase by ₹${(totalRequiredSIP - currentSIP).toLocaleString(undefined, {maximumFractionDigits: 0})}` :
              `You're on track! Extra: ₹${(currentSIP - totalRequiredSIP).toLocaleString(undefined, {maximumFractionDigits: 0})}`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoalPlanner;
