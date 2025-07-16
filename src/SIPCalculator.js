import React, { useState, useEffect } from 'react';
import Chart from './components/Chart';
import GoalPlanner from './components/GoalPlanner';
import AdvancedCalculators from './components/AdvancedCalculators';
import SWPCalculator from './components/SWPCalculator';
import PDFGenerator from './components/PDFGenerator';

const SIPCalculator = () => {
  const [investmentAmount, setInvestmentAmount] = useState(5000);
  const [sipDuration, setSipDuration] = useState(15);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator');
  const [savedCalculations, setSavedCalculations] = useState([]);
  const [calculationName, setCalculationName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Simplified state
  const [errors, setErrors] = useState({});
  const [isValidInput, setIsValidInput] = useState(true);

  // Load saved calculations from localStorage on component mount
  useEffect(() => {
    const loadSavedCalculations = () => {
      try {
        const saved = localStorage.getItem('sipCalculations');
        if (saved) {
          const parsedCalculations = JSON.parse(saved);
          setSavedCalculations(parsedCalculations);
        }
      } catch (error) {
        console.error('Error loading saved calculations:', error);
      }
    };

    loadSavedCalculations();
  }, []);

  // Save calculations to localStorage whenever savedCalculations changes
  useEffect(() => {
    try {
      localStorage.setItem('sipCalculations', JSON.stringify(savedCalculations));
    } catch (error) {
      console.error('Error saving calculations:', error);
    }
  }, [savedCalculations]);

  // Auto-calculate on input change
  useEffect(() => {
    if (investmentAmount > 0 && sipDuration > 0 && annualReturn > 0 && isValidInput) {
      const timer = setTimeout(() => {
        calculateSIP();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [investmentAmount, sipDuration, annualReturn, isValidInput]);

  // Wrap calculateSIP to avoid dependency issues
  const calculateSIP = React.useCallback(() => {
    if (!isValidInput) return;
    
    setIsCalculating(true);
    
    try {
      if (investmentAmount <= 0 || sipDuration <= 0 || annualReturn <= 0) {
        throw new Error('Please enter valid positive numbers.');
      }

      const monthlyReturn = (annualReturn / 100) / 12;
      const totalMonths = sipDuration * 12;
      const futureValue = investmentAmount * (((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn) * (1 + monthlyReturn));
      const totalInvestment = investmentAmount * totalMonths;
      const totalGains = futureValue - totalInvestment;
      const wealthMultiplier = futureValue / totalInvestment;

      const calculationResult = {
        investmentAmount,
        sipDuration,
        annualReturn,
        futureValue,
        totalInvestment,
        totalGains,
        wealthMultiplier,
        monthlyReturn: monthlyReturn * 100,
        yearlyData: generateYearlyData(investmentAmount, annualReturn, sipDuration),
        calculatedAt: new Date().toISOString(),
        id: Date.now()
      };

      setResult(calculationResult);
      
    } catch (error) {
      console.error('Calculation error:', error);
      setErrors({ general: error.message });
    } finally {
      setIsCalculating(false);
    }
  }, [investmentAmount, sipDuration, annualReturn, isValidInput]);

  const generateYearlyData = (monthlyAmount, annualReturn, years) => {
    const data = [];
    const monthlyRate = (annualReturn / 100) / 12;
    
    for (let year = 1; year <= years; year++) {
      const months = year * 12;
      const investment = monthlyAmount * months;
      const value = monthlyAmount * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
      const returns = value - investment;
      
      data.push({
        year,
        investment,
        value,
        returns
      });
    }
    return data;
  };

  const handleValueChange = (setter, currentValue, changeAmount) => {
    const newValue = currentValue + changeAmount;
    setter(newValue >= 0 ? newValue : 0);
  };

  // Enhanced input handlers with validation
  const handleInvestmentAmountChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setInvestmentAmount(numValue);
    validateInput('investmentAmount', numValue);
  };

  const handleSipDurationChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setSipDuration(numValue);
    validateInput('sipDuration', numValue);
  };

  const handleAnnualReturnChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setAnnualReturn(numValue);
    validateInput('annualReturn', numValue);
  };

  const presetAmounts = [1000, 2000, 5000, 10000, 25000, 50000];
  const presetDurations = [5, 10, 15, 20, 25, 30];
  const presetReturns = [8, 10, 12, 15, 18, 20];

  // Currency formatting
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressWidth = (current, max) => {
    return Math.min((current / max) * 100, 100);
  };

  // Save/Load functionality
  const saveCalculation = () => {
    if (calculationName && result) {
      const newCalculation = {
        id: Date.now(),
        name: calculationName,
        investmentAmount,
        sipDuration,
        annualReturn,
        result,
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toISOString()
      };
      
      // Add to saved calculations
      const updatedCalculations = [...savedCalculations, newCalculation];
      setSavedCalculations(updatedCalculations);
      
      // Clear the input field
      setCalculationName('');
      
      // Show success message
      setSuccessMessage('✅ Calculation saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Auto-switch to saved tab to show the user their saved calculation
      setTimeout(() => {
        setActiveTab('saved');
      }, 1000);
    } else {
      setSuccessMessage('❌ Please enter a name and ensure you have calculated results.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const loadCalculation = (calculation) => {
    setInvestmentAmount(calculation.investmentAmount);
    setSipDuration(calculation.sipDuration);
    setAnnualReturn(calculation.annualReturn);
    setResult(calculation.result);
    
    // Switch to calculator tab to show the loaded calculation
    setActiveTab('calculator');
    
    // Show success message
    setSuccessMessage(`✅ Loaded calculation: ${calculation.name}`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const deleteCalculation = (id) => {
    if (window.confirm('Are you sure you want to delete this calculation?')) {
      const updatedCalculations = savedCalculations.filter(calc => calc.id !== id);
      setSavedCalculations(updatedCalculations);
      
      // Show success message
      setSuccessMessage('🗑️ Calculation deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const clearAllCalculations = () => {
    if (window.confirm('Are you sure you want to delete all saved calculations? This action cannot be undone.')) {
      setSavedCalculations([]);
      setSuccessMessage('🗑️ All calculations cleared');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // PDF Generation functions
  const downloadSIPPDF = (calculationName = "SIP Investment Plan") => {
    if (!result) {
      setSuccessMessage('❌ No calculation data available for PDF generation');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }

    console.log('Starting PDF generation with data:', result);

    try {
      const pdfGenerator = new PDFGenerator();
      console.log('PDFGenerator created');
      
      pdfGenerator.generateSIPReport(result, calculationName);
      console.log('PDF report generated');
      
      const filename = `${calculationName.replace(/\s+/g, '-').toLowerCase()}-sip-report.pdf`;
      console.log('Attempting to download:', filename);
      
      const success = pdfGenerator.downloadPDF(filename);
      console.log('Download result:', success);
      
      setSuccessMessage('📄 SIP PDF report downloaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Detailed error generating PDF:', error);
      setSuccessMessage(`❌ Error generating PDF: ${error.message}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // For saved calculations, use the saved result data
  const downloadSavedCalculationPDF = (savedCalc) => {
    if (!savedCalc || !savedCalc.result) {
      setSuccessMessage('❌ No calculation data available for PDF generation');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }

    console.log('Starting PDF generation for saved calculation:', savedCalc);

    try {
      const pdfGenerator = new PDFGenerator();
      pdfGenerator.generateSIPReport(savedCalc.result, savedCalc.name);
      const filename = `${savedCalc.name.replace(/\s+/g, '-').toLowerCase()}-sip-report.pdf`;
      pdfGenerator.downloadPDF(filename);
      
      setSuccessMessage('📄 SIP PDF report downloaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Detailed error generating PDF for saved calculation:', error);
      setSuccessMessage(`❌ Error generating PDF: ${error.message}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Navigation tabs
  const tabs = [
    { id: 'calculator', label: '🧮 Calculator', desc: 'SIP Calculator' },
    { id: 'swp', label: '📤 SWP', desc: 'Withdrawal Plan' },
    { id: 'goals', label: '🎯 Goals', desc: 'Goal Planning' },
    { id: 'advanced', label: '📊 Advanced', desc: 'Advanced Tools' },
    { id: 'saved', label: '💾 Saved', desc: 'Saved Calculations' }
  ];

  // Validation functions
  const validateInput = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'investmentAmount':
        if (value <= 0) {
          newErrors.investmentAmount = 'Investment amount must be greater than 0';
        } else if (value > 10000000) {
          newErrors.investmentAmount = 'Investment amount cannot exceed 1 Crore';
        } else if (value < 100) {
          newErrors.investmentAmount = 'Minimum investment amount is ₹100';
        } else {
          delete newErrors.investmentAmount;
        }
        break;
        
      case 'sipDuration':
        if (value <= 0) {
          newErrors.sipDuration = 'Duration must be greater than 0';
        } else if (value > 50) {
          newErrors.sipDuration = 'Maximum duration is 50 years';
        } else if (value < 1) {
          newErrors.sipDuration = 'Minimum duration is 1 year';
        } else {
          delete newErrors.sipDuration;
        }
        break;
        
      case 'annualReturn':
        if (value <= 0) {
          newErrors.annualReturn = 'Return rate must be greater than 0';
        } else if (value > 50) {
          newErrors.annualReturn = 'Maximum return rate is 50%';
        } else if (value < 1) {
          newErrors.annualReturn = 'Minimum return rate is 1%';
        } else {
          delete newErrors.annualReturn;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    setIsValidInput(Object.keys(newErrors).length === 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="message-popup fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 animate-pulse">
            {successMessage}
          </div>
        )}

        {/* General Error Message */}
        {errors.general && (
          <div className="message-popup fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300">
            {errors.general}
          </div>
        )}

        {/* Header */}
        <div className="main-header text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            💰 SIP Calculator
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Calculate your SIP returns with goal planning and advanced tools.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="tab-wrapper flex flex-wrap justify-center space-x-1 bg-white rounded-2xl p-2 shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button flex-1 min-w-0 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="tab-label truncate">{tab.label}</div>
                <div className="tab-desc text-xs opacity-75 truncate">{tab.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'calculator' && (
          <div className="main-grid grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Left Panel - Input Controls */}
            <div className="space-y-6">
              {/* Investment Amount Card */}
              <div className="input-card bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                <label className="block text-gray-700 text-sm font-semibold mb-4">
                  💵 Monthly Investment Amount
                </label>
                <div className="input-control flex items-center bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-2">
                  <div className="input-control-row">
                    <button
                      onClick={() => handleValueChange(setInvestmentAmount, investmentAmount, -500)}
                      className="input-button w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center font-bold shadow-md hover:shadow-lg transform hover:scale-110"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => handleInvestmentAmountChange(e.target.value)}
                      className="input-field flex-1 bg-transparent text-center text-2xl font-bold text-gray-800 focus:outline-none mx-4"
                      placeholder="Enter amount"
                    />
                    <button
                      onClick={() => handleValueChange(setInvestmentAmount, investmentAmount, 500)}
                      className="input-button w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center font-bold shadow-md hover:shadow-lg transform hover:scale-110"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="preset-grid flex flex-wrap gap-2">
                    {presetAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setInvestmentAmount(amount)}
                        className={`preset-button px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                          investmentAmount === amount
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        ₹{amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {formatCurrency(investmentAmount)}
                  </span>
                  <span className="text-gray-500 text-sm block">per month</span>
                </div>
                {errors.investmentAmount && (
                  <div className="mt-2 text-red-500 text-sm">
                    {errors.investmentAmount}
                  </div>
                )}
              </div>

              {/* Duration Card */}
              <div className="input-card bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                <label className="block text-gray-700 text-sm font-semibold mb-4">
                  ⏰ Investment Duration
                </label>
                <div className="input-control flex items-center bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-2">
                  <div className="input-control-row">
                    <button
                      onClick={() => handleValueChange(setSipDuration, sipDuration, -1)}
                      className="input-button w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center font-bold shadow-md hover:shadow-lg transform hover:scale-110"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={sipDuration}
                      onChange={(e) => handleSipDurationChange(e.target.value)}
                      className="input-field flex-1 bg-transparent text-center text-2xl font-bold text-gray-800 focus:outline-none mx-4"
                      placeholder="Enter years"
                    />
                    <button
                      onClick={() => handleValueChange(setSipDuration, sipDuration, 1)}
                      className="input-button w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center font-bold shadow-md hover:shadow-lg transform hover:scale-110"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="preset-grid flex flex-wrap gap-2">
                    {presetDurations.map((duration) => (
                      <button
                        key={duration}
                        onClick={() => setSipDuration(duration)}
                        className={`preset-button px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                          sipDuration === duration
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                      >
                        {duration}Y
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {sipDuration}
                  </span>
                  <span className="text-gray-500 text-sm block">years</span>
                </div>
                {errors.sipDuration && (
                  <div className="mt-2 text-red-500 text-sm">
                    {errors.sipDuration}
                  </div>
                )}
              </div>

              {/* Annual Return Card */}
              <div className="input-card bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                <label className="block text-gray-700 text-sm font-semibold mb-4">
                  📈 Expected Annual Return
                </label>
                <div className="input-control flex items-center bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-2">
                  <div className="input-control-row">
                    <button
                      onClick={() => handleValueChange(setAnnualReturn, annualReturn, -0.5)}
                      className="input-button w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center font-bold shadow-md hover:shadow-lg transform hover:scale-110"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={annualReturn}
                      onChange={(e) => handleAnnualReturnChange(e.target.value)}
                      className="input-field flex-1 bg-transparent text-center text-2xl font-bold text-gray-800 focus:outline-none mx-4"
                      placeholder="Enter rate"
                      step="0.5"
                    />
                    <button
                      onClick={() => handleValueChange(setAnnualReturn, annualReturn, 0.5)}
                      className="input-button w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center font-bold shadow-md hover:shadow-lg transform hover:scale-110"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="preset-grid flex flex-wrap gap-2">
                    {presetReturns.map((returnRate) => (
                      <button
                        key={returnRate}
                        onClick={() => setAnnualReturn(returnRate)}
                        className={`preset-button px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                          annualReturn === returnRate
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {returnRate}%
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {annualReturn}%
                  </span>
                  <span className="text-gray-500 text-sm block">per annum</span>
                </div>
                {errors.annualReturn && (
                  <div className="mt-2 text-red-500 text-sm">
                    {errors.annualReturn}
                  </div>
                )}
              </div>

              {/* Save Calculation */}
              {result && (
                <div className="input-card bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                  <h4 className="font-semibold mb-3 text-gray-800">💾 Save This Calculation</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Save your calculation to access it later from the Saved tab
                  </p>
                  <div className="save-section flex gap-2">
                    <input
                      type="text"
                      placeholder="Give this calculation a name..."
                      value={calculationName}
                      onChange={(e) => setCalculationName(e.target.value)}
                      className="save-input flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          saveCalculation();
                        }
                      }}
                    />
                    <button
                      onClick={saveCalculation}
                      disabled={!calculationName.trim()}
                      className={`save-button px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        calculationName.trim()
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transform hover:scale-105'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Save
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    💡 Tip: Press Enter to save quickly
                  </div>
                </div>
              )}

            </div>

            {/* Right Panel - Results */}
            <div className="space-y-6">
              {/* Auto-calculation indicator */}
              {isCalculating && (
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-blue-700 text-sm">Auto-calculating...</span>
                  </div>
                </div>
              )}
              
              {result && (
                <>
                  {/* Main Result Card */}
                  <div className="result-card bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white transform hover:scale-105 transition-transform duration-300">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold mb-2">🚀 Your SIP Journey</h2>
                      <p className="text-blue-100">Investment projection for {result.sipDuration} years</p>
                    </div>
                    
                    <div className="result-grid grid grid-cols-1 gap-6">
                      <div className="result-item bg-white/20 rounded-xl p-6 backdrop-blur-sm transform hover:scale-105 transition-transform duration-200">
                        <div className="text-center">
                          <div className="result-value text-4xl font-bold mb-2 animate-pulse">
                            {formatCurrency(result.futureValue)}
                          </div>
                          <div className="result-label text-blue-100 text-sm">Final Value</div>
                        </div>
                      </div>
                      
                      <div className="result-grid grid grid-cols-2 gap-4">
                        <div className="result-item bg-white/20 rounded-xl p-4 backdrop-blur-sm transform hover:scale-105 transition-transform duration-200">
                          <div className="text-center">
                            <div className="result-value text-xl font-bold mb-1">
                              {formatCurrency(result.totalInvestment)}
                            </div>
                            <div className="result-label text-blue-100 text-xs">Total Investment</div>
                          </div>
                        </div>
                        
                        <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm transform hover:scale-105 transition-transform duration-200">
                          <div className="text-center">
                            <div className="text-xl font-bold mb-1">
                              {formatCurrency(result.totalGains)}
                            </div>
                            <div className="text-blue-100 text-xs">Total Returns</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm transform hover:scale-105 transition-transform duration-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold mb-2">
                            {result.wealthMultiplier.toFixed(2)}x
                          </div>
                          <div className="text-blue-100 text-sm">Wealth Multiplier</div>
                        </div>
                      </div>
                      
                      {/* PDF Download Button */}
                      <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm transform hover:scale-105 transition-transform duration-200">
                        <button
                          onClick={() => downloadSIPPDF("My SIP Investment Plan")}
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                          📄 Download SIP Report PDF
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  {result.yearlyData && (
                    <Chart data={result.yearlyData} width={600} height={300} />
                  )}

                  {/* Detailed Analysis */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">📊 Investment Analysis</h3>
                    
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">Monthly Investment</span>
                          <span className="text-sm font-semibold">
                            {formatCurrency(result.investmentAmount)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 transform hover:scale-105"
                            style={{ width: `${getProgressWidth(result.investmentAmount, 50000)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">Duration</span>
                          <span className="text-sm font-semibold">{result.sipDuration} years</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 transform hover:scale-105"
                            style={{ width: `${getProgressWidth(result.sipDuration, 30)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 transform hover:scale-105 transition-transform duration-200">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-green-600">
                            {result.monthlyReturn.toFixed(2)}%
                          </div>
                          <div className="text-xs text-gray-600">Monthly Return</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-600">
                            {((result.totalGains / result.totalInvestment) * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-600">Total Return %</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-purple-600">
                            {(result.sipDuration * 12).toFixed(0)}
                          </div>
                          <div className="text-xs text-gray-600">Total Months</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Year-wise Breakdown */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800">📅 Year-wise Growth</h3>
                      <button
                        onClick={() => setShowChart(!showChart)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors transform hover:scale-105"
                      >
                        {showChart ? 'Hide' : 'Show'} Details
                      </button>
                    </div>
                    
                    {showChart && (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {result.yearlyData.map((yearData, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg transform hover:scale-105 transition-transform duration-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {yearData.year}
                              </div>
                              <div>
                                <div className="text-sm font-semibold">Year {yearData.year}</div>
                                <div className="text-xs text-gray-600">
                                  Investment: {formatCurrency(yearData.investment)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-green-600">
                                {formatCurrency(yearData.value)}
                              </div>
                              <div className="text-xs text-gray-600">
                                +{formatCurrency(yearData.returns)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* SWP Tab */}
        {activeTab === 'swp' && (
          <div className="max-w-6xl mx-auto">
            <SWPCalculator sipResult={result} />
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="max-w-6xl mx-auto">
            <GoalPlanner currentSIP={investmentAmount} onGoalUpdate={() => {}} />
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="max-w-6xl mx-auto">
            <AdvancedCalculators 
              sipAmount={investmentAmount} 
              duration={sipDuration} 
              returnRate={annualReturn} 
            />
          </div>
        )}

        {/* Saved Calculations Tab */}
        {activeTab === 'saved' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">💾 Saved Calculations</h3>
                {savedCalculations.length > 0 && (
                  <button
                    onClick={clearAllCalculations}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors text-sm font-semibold transform hover:scale-105"
                  >
                    🗑️ Clear All
                  </button>
                )}
              </div>
              
              {savedCalculations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <div className="text-gray-600 text-lg font-semibold">No saved calculations yet</div>
                  <div className="text-sm text-gray-500 mt-2">
                    Save your calculations from the Calculator tab to compare them later
                  </div>
                  <button
                    onClick={() => setActiveTab('calculator')}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors transform hover:scale-105"
                  >
                    Go to Calculator
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    📈 You have {savedCalculations.length} saved calculation{savedCalculations.length > 1 ? 's' : ''} 
                    • All calculations are automatically saved to your browser
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedCalculations
                      .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))
                      .map((calc) => (
                        <div key={calc.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow transform hover:scale-105 duration-200 bg-gradient-to-r from-gray-50 to-blue-50">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg text-gray-800">{calc.name}</h4>
                              <p className="text-sm text-gray-600">
                                Saved on {calc.date}
                                {calc.timestamp && (
                                  <span className="ml-2 text-xs">
                                    at {new Date(calc.timestamp).toLocaleTimeString()}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => loadCalculation(calc)}
                                className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors font-semibold transform hover:scale-105"
                              >
                                📊 Load
                              </button>
                              <button
                                onClick={() => downloadSavedCalculationPDF(calc)}
                                className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-colors font-semibold transform hover:scale-105"
                              >
                                📄 PDF
                              </button>
                              <button
                                onClick={() => deleteCalculation(calc.id)}
                                className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-lg hover:from-red-600 hover:to-red-700 transition-colors font-semibold transform hover:scale-105"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Monthly SIP:</span>
                              <div className="font-semibold text-blue-600">{formatCurrency(calc.investmentAmount)}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Duration:</span>
                              <div className="font-semibold text-purple-600">{calc.sipDuration} years</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Return:</span>
                              <div className="font-semibold text-green-600">{calc.annualReturn}%</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Final Value:</span>
                              <div className="font-semibold text-orange-600">
                                {formatCurrency(calc.result.futureValue)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Additional metrics */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">
                                Total Investment: <span className="font-semibold">{formatCurrency(calc.result.totalInvestment)}</span>
                              </span>
                              <span className="text-gray-600">
                                Wealth Multiplier: <span className="font-semibold text-green-600">{calc.result.wealthMultiplier.toFixed(2)}x</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SIPCalculator;
