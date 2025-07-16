import React, { useState, useEffect } from 'react';
import SWPChart from './SWPChart';
import PDFGenerator from './PDFGenerator';

const SWPCalculator = ({ sipResult = null }) => {
  const [totalInvestment, setTotalInvestment] = useState(1000000);
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(8000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [useSipData, setUseSipData] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Preset values
  const presetInvestments = [500000, 1000000, 2000000, 5000000, 10000000];
  const presetWithdrawals = [5000, 8000, 10000, 15000, 20000, 25000];
  const presetReturns = [8, 10, 12, 15, 18];

  // Update values when SIP result changes
  useEffect(() => {
    if (sipResult && useSipData) {
      setTotalInvestment(sipResult.futureValue);
      setAnnualReturn(sipResult.annualReturn);
      // Suggest 4% withdrawal rate
      const suggestedWithdrawal = Math.round((sipResult.futureValue * 0.04) / 12);
      setMonthlyWithdrawal(suggestedWithdrawal);
    }
  }, [sipResult, useSipData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateSWP = () => {
    if (totalInvestment <= 0 || monthlyWithdrawal <= 0 || annualReturn <= 0) {
      setResult(null);
      return;
    }

    setIsCalculating(true);
    
    setTimeout(() => {
      const monthlyReturn = annualReturn / 100 / 12;
      let currentValue = totalInvestment;
      let totalWithdrawn = 0;
      let monthsCount = 0;
      const yearlyData = [];
      
      // Calculate how long the money will last
      while (currentValue > 0 && monthsCount < 600) { // Max 50 years
        // Monthly growth
        currentValue = currentValue * (1 + monthlyReturn);
        
        // Monthly withdrawal
        if (currentValue >= monthlyWithdrawal) {
          currentValue -= monthlyWithdrawal;
          totalWithdrawn += monthlyWithdrawal;
        } else {
          totalWithdrawn += currentValue;
          currentValue = 0;
        }
        
        monthsCount++;
        
        // Store yearly data
        if (monthsCount % 12 === 0) {
          yearlyData.push({
            year: monthsCount / 12,
            remainingValue: currentValue,
            totalWithdrawn: totalWithdrawn,
            monthlyIncome: monthlyWithdrawal
          });
        }
      }

      const yearsLasting = monthsCount / 12;
      const monthlyIncomePercentage = (monthlyWithdrawal / totalInvestment) * 100;
      
      // Calculate if withdrawal is sustainable (4% rule)
      const sustainableWithdrawal = (totalInvestment * 0.04) / 12;
      const isSustainable = monthlyWithdrawal <= sustainableWithdrawal;
      
      setResult({
        totalInvestment,
        monthlyWithdrawal,
        annualReturn,
        yearsLasting: yearsLasting,
        monthsLasting: monthsCount,
        totalWithdrawn,
        remainingValue: currentValue,
        monthlyIncomePercentage,
        sustainableWithdrawal,
        isSustainable,
        yearlyData: yearlyData.slice(0, 30) // Show max 30 years
      });

      setIsCalculating(false);
    }, 800);
  };

  // Auto-calculate on input change
  useEffect(() => {
    if (totalInvestment > 0 && monthlyWithdrawal > 0 && annualReturn > 0) {
      const timer = setTimeout(() => {
        calculateSWP();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [totalInvestment, monthlyWithdrawal, annualReturn]);

  // PDF Download function
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const downloadSWPPDF = (calculationName = "SWP Withdrawal Plan") => {
    if (!result) {
      alert('❌ No calculation data available for PDF generation');
      return;
    }

    try {
      const pdfGenerator = new PDFGenerator();
      pdfGenerator.generateSWPReport(result, calculationName);
      const filename = `${calculationName.replace(/\s+/g, '-').toLowerCase()}-swp-report.pdf`;
      pdfGenerator.downloadPDF(filename);
      
      showSuccessMessage('📄 SWP PDF report downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('❌ Error generating PDF. Please try again.');
    }
  };

  // Combined PDF Download (if SIP data is available)
  const downloadCombinedPDF = () => {
    if (!result || !sipResult) {
      alert('❌ Both SIP and SWP data required for combined PDF');
      return;
    }

    try {
      const pdfGenerator = new PDFGenerator();
      pdfGenerator.generateCombinedReport(sipResult, result, "Complete Investment Journey");
      pdfGenerator.downloadPDF("complete-investment-journey.pdf");
      
      showSuccessMessage('📄 Combined SIP+SWP PDF report downloaded successfully!');
    } catch (error) {
      console.error('Error generating combined PDF:', error);
      alert('❌ Error generating combined PDF. Please try again.');
    }
  };

  const handleValueChange = (setter, currentValue, increment) => {
    const newValue = Math.max(0, currentValue + increment);
    setter(newValue);
  };

  const getProgressWidth = (value, maxValue) => {
    return Math.min((value / maxValue) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <style>
        {`
          .year-wise-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .year-wise-scroll::-webkit-scrollbar-track {
            background: #f7fafc;
            border-radius: 4px;
          }
          .year-wise-scroll::-webkit-scrollbar-thumb {
            background: #cbd5e0;
            border-radius: 4px;
          }
          .year-wise-scroll::-webkit-scrollbar-thumb:hover {
            background: #a0aec0;
          }
        `}
      </style>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
          📤 SWP Calculator
        </h2>
        <p className="text-gray-600">
          Systematic Withdrawal Plan - Calculate how long your corpus will last with regular withdrawals
        </p>
      </div>

      {/* SIP Integration Toggle */}
      {sipResult && (
        <div className="swp-sip-toggle max-w-4xl mx-auto mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">🔗 Use SIP Investment Data</h3>
                <p className="text-sm text-gray-600">
                  Your SIP will grow to {formatCurrency(sipResult.futureValue)} in {sipResult.sipDuration} years
                </p>
              </div>
              <button
                onClick={() => setUseSipData(!useSipData)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  useSipData
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {useSipData ? '✅ Using SIP Data' : '🔄 Use SIP Data'}
              </button>
            </div>
            
            {useSipData && (
              <div className="swp-sip-stats grid grid-cols-3 gap-4 mt-4">
                <div className="swp-sip-stat-item text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600">SIP Corpus</div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(sipResult.futureValue)}
                  </div>
                </div>
                <div className="swp-sip-stat-item text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600">Return Rate</div>
                  <div className="text-lg font-bold text-green-600">
                    {sipResult.annualReturn}%
                  </div>
                </div>
                <div className="swp-sip-stat-item text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600">Suggested SWP</div>
                  <div className="text-lg font-bold text-orange-600">
                    {formatCurrency(Math.round((sipResult.futureValue * 0.04) / 12))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="swp-grid grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Inputs */}
        <div className="swp-input-section space-y-6">
          {/* Total Investment */}
          <div className="swp-input-card input-card bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
            <label className="block text-gray-700 text-sm font-semibold mb-4">
              💰 Total Investment Corpus
              {useSipData && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                  From SIP
                </span>
              )}
            </label>
            <div className="input-control flex items-center bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl p-2">
              <div className="input-control-row">
                <button
                  onClick={() => handleValueChange(setTotalInvestment, totalInvestment, -50000)}
                  disabled={useSipData}
                  className={`input-button w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center font-bold shadow-md hover:shadow-lg transform hover:scale-110 ${
                    useSipData ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  -
                </button>
                <input
                  type="number"
                  value={totalInvestment}
                  onChange={(e) => setTotalInvestment(parseInt(e.target.value) || 0)}
                  disabled={useSipData}
                  className={`input-field flex-1 bg-transparent text-center text-2xl font-bold text-gray-800 focus:outline-none mx-4 ${
                    useSipData ? 'cursor-not-allowed opacity-60' : ''
                  }`}
                  placeholder="Enter total corpus"
                />
                <button
                  onClick={() => handleValueChange(setTotalInvestment, totalInvestment, 50000)}
                  disabled={useSipData}
                  className={`input-button w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center font-bold shadow-md hover:shadow-lg transform hover:scale-110 ${
                    useSipData ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  +
                </button>
              </div>
            </div>
            <div className="mt-4">
              <div className="preset-grid flex flex-wrap gap-2">
                {presetInvestments.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTotalInvestment(amount)}
                    disabled={useSipData}
                    className={`preset-button px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                      useSipData
                        ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500'
                        : totalInvestment === amount
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                  >
                    {amount >= 1000000 ? `₹${(amount/1000000).toFixed(1)}Cr` : `₹${(amount/100000).toFixed(1)}L`}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {formatCurrency(totalInvestment)}
              </span>
              <span className="text-gray-500 text-sm block">corpus available</span>
            </div>
          </div>

          {/* Monthly Withdrawal */}
          <div className="swp-input-card input-card bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
            <label className="block text-gray-700 text-sm font-semibold mb-4">
              📤 Monthly Withdrawal Amount
              {useSipData && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                  4% Rule Applied
                </span>
              )}
            </label>
            <div className="input-control flex items-center bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-2">
              <div className="input-control-row">
                <button
                  onClick={() => handleValueChange(setMonthlyWithdrawal, monthlyWithdrawal, -1000)}
                  className="input-button w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center font-bold shadow-md hover:shadow-lg transform hover:scale-110"
                >
                  -
                </button>
                <input
                  type="number"
                  value={monthlyWithdrawal}
                  onChange={(e) => setMonthlyWithdrawal(parseInt(e.target.value) || 0)}
                  className="input-field flex-1 bg-transparent text-center text-2xl font-bold text-gray-800 focus:outline-none mx-4"
                  placeholder="Enter withdrawal amount"
                />
                <button
                  onClick={() => handleValueChange(setMonthlyWithdrawal, monthlyWithdrawal, 1000)}
                  className="input-button w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center font-bold shadow-md hover:shadow-lg transform hover:scale-110"
                >
                  +
                </button>
              </div>
            </div>
            <div className="mt-4">
              <div className="preset-grid flex flex-wrap gap-2">
                {presetWithdrawals.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setMonthlyWithdrawal(amount)}
                    className={`preset-button px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                      monthlyWithdrawal === amount
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
                {formatCurrency(monthlyWithdrawal)}
              </span>
              <span className="text-gray-500 text-sm block">per month</span>
            </div>
          </div>

          {/* Annual Return */}
          <div className="swp-input-card input-card bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
            <label className="block text-gray-700 text-sm font-semibold mb-4">
              📈 Expected Annual Return
            </label>
            <div className="input-control flex items-center bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-2">
              <div className="input-control-row">
                <button
                  onClick={() => handleValueChange(setAnnualReturn, annualReturn, -0.5)}
                  disabled={useSipData}
                  className={`input-button w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center font-bold shadow-md hover:shadow-lg transform hover:scale-110 ${
                    useSipData ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  -
                </button>
                <input
                  type="number"
                  value={annualReturn}
                  onChange={(e) => setAnnualReturn(parseFloat(e.target.value) || 0)}
                  disabled={useSipData}
                  className={`input-field flex-1 bg-transparent text-center text-2xl font-bold text-gray-800 focus:outline-none mx-4 ${
                    useSipData ? 'cursor-not-allowed opacity-60' : ''
                  }`}
                  placeholder="Enter return rate"
                  step="0.5"
                />
                <button
                  onClick={() => handleValueChange(setAnnualReturn, annualReturn, 0.5)}
                  disabled={useSipData}
                  className={`input-button w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center font-bold shadow-md hover:shadow-lg transform hover:scale-110 ${
                    useSipData ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
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
                    disabled={useSipData}
                    className={`preset-button px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                      useSipData
                        ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500'
                      : annualReturn === returnRate
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
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="swp-result-section space-y-6">
          {result && (
            <>
              {/* Main Result Card */}
              <div className="swp-result-card result-card bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white transform hover:scale-105 transition-transform duration-300">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">📤 Your SWP Plan</h2>
                  <p className="text-orange-100">Systematic withdrawal analysis</p>
                </div>
                
                <div className="result-grid grid grid-cols-1 gap-6">
                  <div className="result-item bg-white/20 rounded-xl p-6 backdrop-blur-sm transform hover:scale-105 transition-transform duration-200">
                    <div className="text-center">
                      <div className="result-value text-4xl font-bold mb-2 animate-pulse">
                        {result.yearsLasting.toFixed(1)} Years
                      </div>
                      <div className="result-label text-orange-100 text-sm">Corpus Duration</div>
                    </div>
                  </div>
                  
                  <div className="result-grid grid grid-cols-2 gap-4">
                    <div className="result-item bg-white/20 rounded-xl p-4 backdrop-blur-sm transform hover:scale-105 transition-transform duration-200">
                      <div className="text-center">
                        <div className="result-value text-xl font-bold mb-1">
                          {formatCurrency(result.totalWithdrawn)}
                        </div>
                        <div className="result-label text-orange-100 text-xs">Total Withdrawn</div>
                      </div>
                    </div>
                    
                    <div className="result-item bg-white/20 rounded-xl p-4 backdrop-blur-sm transform hover:scale-105 transition-transform duration-200">
                      <div className="text-center">
                        <div className="result-value text-xl font-bold mb-1">
                          {result.monthlyIncomePercentage.toFixed(2)}%
                        </div>
                        <div className="text-orange-100 text-xs">Monthly Income %</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`rounded-xl p-4 backdrop-blur-sm transform hover:scale-105 transition-transform duration-200 ${
                    result.isSustainable ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">
                        {result.isSustainable ? '✅ Sustainable' : '⚠️ High Risk'}
                      </div>
                      <div className="text-orange-100 text-sm">
                        Recommended: {formatCurrency(result.sustainableWithdrawal)}/month
                      </div>
                    </div>
                  </div>
                  
                  {/* PDF Download Buttons */}
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => downloadSWPPDF("My SWP Withdrawal Plan")}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      📄 Download SWP Report PDF
                    </button>
                    
                    {sipResult && (
                      <button
                        onClick={() => downloadCombinedPDF()}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        📊 Download Combined SIP+SWP Report
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="swp-detailed-card bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-xl font-bold text-gray-800 mb-6">📊 SWP Analysis</h3>
                
                <div className="grid grid-cols-1 gap-6 mb-6">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-orange-600">
                          {result.monthsLasting}
                        </div>
                        <div className="text-xs text-gray-600">Total Months</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-600">
                          ₹{(result.monthlyWithdrawal * 12).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Yearly Income</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-pink-600">
                          {((result.totalWithdrawn / result.totalInvestment) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Corpus Utilized</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Your SWP Plan Section */}
                <div className="swp-detailed-card bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">📋 Your SWP Plan Summary</h3>
                  
                  {/* Plan Overview */}
                  <div className="swp-plan-overview bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4">💰 Investment Details</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Starting Corpus:</span>
                            <span className="font-semibold text-blue-600">
                              {formatCurrency(result.totalInvestment)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Expected Return:</span>
                            <span className="font-semibold text-green-600">
                              {result.annualReturn}% annually
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Investment Source:</span>
                            <span className="font-semibold text-purple-600">
                              {useSipData ? 'SIP Corpus' : 'Manual Input'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4">📤 Withdrawal Plan</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Monthly Withdrawal:</span>
                            <span className="font-semibold text-orange-600">
                              {formatCurrency(result.monthlyWithdrawal)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Annual Withdrawal:</span>
                            <span className="font-semibold text-red-600">
                              {formatCurrency(result.monthlyWithdrawal * 12)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Withdrawal Rate:</span>
                            <span className={`font-semibold ${result.isSustainable ? 'text-green-600' : 'text-red-600'}`}>
                              {(result.monthlyIncomePercentage * 12).toFixed(1)}% annually
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plan Timeline */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-4">⏱️ Timeline Projection</h4>
                    <div className="swp-timeline-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white transform hover:scale-105 transition-transform duration-200 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-100 text-sm font-medium">Duration</span>
                          <div className="w-8 h-8 flex items-center justify-center">
                            <span className="text-xl">⏳</span>
                          </div>
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {result.yearsLasting.toFixed(1)}
                        </div>
                        <div className="text-blue-100 text-xs">Years</div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white transform hover:scale-105 transition-transform duration-200 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-green-100 text-sm font-medium">Total Months</span>
                          <div className="w-8 h-8 flex items-center justify-center">
                            <span className="text-xl">📅</span>
                          </div>
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {result.monthsLasting}
                        </div>
                        <div className="text-green-100 text-xs">Months</div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white transform hover:scale-105 transition-transform duration-200 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-purple-100 text-sm font-medium">Total Withdrawn</span>
                          <div className="w-8 h-8 flex items-center justify-center">
                            <span className="text-xl">💰</span>
                          </div>
                        </div>
                        <div className="text-lg font-bold mb-1">
                          {result.totalWithdrawn >= 10000000 
                            ? `₹${(result.totalWithdrawn / 10000000).toFixed(1)}Cr`
                            : result.totalWithdrawn >= 100000 
                            ? `₹${(result.totalWithdrawn / 100000).toFixed(1)}L`
                            : formatCurrency(result.totalWithdrawn)
                          }
                        </div>
                        <div className="text-purple-100 text-xs">Amount</div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white transform hover:scale-105 transition-transform duration-200 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-orange-100 text-sm font-medium">Final Balance</span>
                          <div className="w-8 h-8 flex items-center justify-center">
                            <span className="text-xl">🏦</span>
                          </div>
                        </div>
                        <div className="text-lg font-bold mb-1">
                          {result.remainingValue >= 10000000 
                            ? `₹${(result.remainingValue / 10000000).toFixed(1)}Cr`
                            : result.remainingValue >= 100000 
                            ? `₹${(result.remainingValue / 100000).toFixed(1)}L`
                            : formatCurrency(result.remainingValue)
                          }
                        </div>
                        <div className="text-orange-100 text-xs">Remaining</div>
                      </div>
                    </div>
                    
                    {/* Additional Timeline Stats */}
                    <div className="mt-4 bg-gray-50 rounded-xl p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-sm text-gray-600">Weekly Income</div>
                          <div className="text-lg font-semibold text-blue-600">
                            {formatCurrency(result.monthlyWithdrawal / 4)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Daily Income</div>
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(result.monthlyWithdrawal / 30)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Annual Income</div>
                          <div className="text-lg font-semibold text-purple-600">
                            {formatCurrency(result.monthlyWithdrawal * 12)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Corpus Usage</div>
                          <div className="text-lg font-semibold text-orange-600">
                            {((result.totalWithdrawn / result.totalInvestment) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Milestone Years */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-4">🎯 Key Milestones</h4>
                    <div className="space-y-3">
                      {(() => {
                        const milestones = [];
                        const quarterMark = Math.floor(result.yearsLasting * 0.25);
                        const halfMark = Math.floor(result.yearsLasting * 0.5);
                        const threeQuarterMark = Math.floor(result.yearsLasting * 0.75);
                        
                        if (quarterMark > 0) {
                          const quarterData = result.yearlyData.find(d => d.year === quarterMark);
                          if (quarterData) {
                            milestones.push({
                              year: quarterMark,
                              label: '25% Duration',
                              remaining: quarterData.remainingValue,
                              color: 'green'
                            });
                          }
                        }
                        
                        if (halfMark > 0) {
                          const halfData = result.yearlyData.find(d => d.year === halfMark);
                          if (halfData) {
                            milestones.push({
                              year: halfMark,
                              label: '50% Duration',
                              remaining: halfData.remainingValue,
                              color: 'blue'
                            });
                          }
                        }
                        
                        if (threeQuarterMark > 0) {
                          const threeQuarterData = result.yearlyData.find(d => d.year === threeQuarterMark);
                          if (threeQuarterData) {
                            milestones.push({
                              year: threeQuarterMark,
                              label: '75% Duration',
                              remaining: threeQuarterData.remainingValue,
                              color: 'yellow'
                            });
                          }
                        }
                        
                        return milestones.map((milestone, index) => (
                          <div key={index} className={`swp-milestone-item flex items-center justify-between p-3 rounded-lg bg-gradient-to-r ${
                            milestone.color === 'green' ? 'from-green-50 to-green-100' :
                            milestone.color === 'blue' ? 'from-blue-50 to-blue-100' :
                            'from-yellow-50 to-yellow-100'
                          }`}>
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                milestone.color === 'green' ? 'bg-green-500' :
                                milestone.color === 'blue' ? 'bg-blue-500' :
                                'bg-yellow-500'
                              }`}>
                                {milestone.year}
                              </div>
                              <div>
                                <div className="font-semibold">{milestone.label}</div>
                                <div className="text-sm text-gray-600">After {milestone.year} years</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold ${
                                milestone.color === 'green' ? 'text-green-600' :
                                milestone.color === 'blue' ? 'text-blue-600' :
                                'text-yellow-600'
                              }`}>
                                {formatCurrency(milestone.remaining)}
                              </div>
                              <div className="text-sm text-gray-600">Remaining</div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Monthly Income Breakdown */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-4">💳 Monthly Income Breakdown</h4>
                    <div className="swp-income-breakdown bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(result.monthlyWithdrawal)}
                          </div>
                          <div className="text-sm text-gray-600">Monthly Income</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {formatCurrency(result.monthlyWithdrawal / 30)}
                          </div>
                          <div className="text-sm text-gray-600">Daily Income</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {formatCurrency(result.monthlyWithdrawal * 12)}
                          </div>
                          <div className="text-sm text-gray-600">Annual Income</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">💡 Recommendations</h4>
                    <div className="space-y-2 text-sm">
                      {result.isSustainable ? (
                        <div className="flex items-start space-x-2">
                          <span className="text-green-500">✅</span>
                          <span>Your withdrawal plan follows the 4% rule and is sustainable for long-term retirement.</span>
                        </div>
                      ) : (
                        <div className="flex items-start space-x-2">
                          <span className="text-red-500">⚠️</span>
                          <span>Consider reducing monthly withdrawal to {formatCurrency(result.sustainableWithdrawal)} for better sustainability.</span>
                        </div>
                      )}
                      
                      {result.yearsLasting < 20 && (
                        <div className="flex items-start space-x-2">
                          <span className="text-yellow-500">⚠️</span>
                          <span>Your corpus will last only {result.yearsLasting.toFixed(1)} years. Consider building a larger corpus or reducing withdrawals.</span>
                        </div>
                      )}
                      
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-500">💡</span>
                        <span>Keep some emergency funds separate from your SWP corpus for unexpected expenses.</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <span className="text-purple-500">📊</span>
                        <span>Review and adjust your withdrawal amount annually based on market performance.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                {result.yearlyData && (
                  <SWPChart data={result.yearlyData} width={600} height={300} />
                )}

                {/* Sustainability Guide */}
                <div className={`rounded-xl p-4 ${
                  result.isSustainable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <h4 className="font-bold mb-2">💡 Sustainability Guide</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 4% Rule: Withdraw max 4% annually for sustainable income</li>
                    <li>• Your current withdrawal rate: {(result.monthlyIncomePercentage * 12).toFixed(1)}% annually</li>
                    <li>• {result.isSustainable ? 'Your plan is sustainable for long-term retirement' : 'Consider reducing withdrawal amount for better sustainability'}</li>
                  </ul>
                </div>
              </div>

              {/* Year-wise Data */}
              <div className="swp-year-wise-card bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-xl font-bold text-gray-800 mb-6">📅 Year-wise Corpus Depletion</h3>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                    <div className="text-sm text-gray-600">Starting Corpus</div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(result.totalInvestment)}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 text-center">
                    <div className="text-sm text-gray-600">Monthly Withdrawal</div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(result.monthlyWithdrawal)}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 text-center">
                    <div className="text-sm text-gray-600">Final Remaining</div>
                    <div className="text-lg font-bold text-red-600">
                      {formatCurrency(result.remainingValue)}
                    </div>
                  </div>
                </div>

                {/* Detailed Year-wise Breakdown */}
                <div 
                  className="year-wise-scroll space-y-3 max-h-80 overflow-y-auto pr-2" 
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e0 #f7fafc'
                  }}
                >
                  {result.yearlyData.map((yearData, index) => {
                    const corpusPercentage = (yearData.remainingValue / result.totalInvestment) * 100;
                    const isLowCorpus = corpusPercentage < 25;
                    const isCriticalCorpus = corpusPercentage < 10;
                    
                    return (
                      <div key={index} className={`swp-year-item p-4 rounded-lg transform hover:scale-105 transition-transform duration-200 ${
                        isCriticalCorpus ? 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200' :
                        isLowCorpus ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200' :
                        'bg-gradient-to-r from-gray-50 to-orange-50'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                              isCriticalCorpus ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                              isLowCorpus ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white' :
                              'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                            }`}>
                              {yearData.year}
                            </div>
                            <div>
                              <div className="text-sm font-semibold">Year {yearData.year}</div>
                              <div className="text-xs text-gray-600">
                                Annual Withdrawal: {formatCurrency(yearData.monthlyIncome * 12)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              isCriticalCorpus ? 'text-red-600' :
                              isLowCorpus ? 'text-yellow-600' :
                              'text-orange-600'
                            }`}>
                              {formatCurrency(yearData.remainingValue)}
                            </div>
                            <div className="text-xs text-gray-600">
                              ({corpusPercentage.toFixed(1)}% remaining)
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="swp-progress-container w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isCriticalCorpus ? 'bg-gradient-to-r from-red-500 to-red-600' :
                              isLowCorpus ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                              'bg-gradient-to-r from-orange-500 to-red-500'
                            }`}
                            style={{ width: `${corpusPercentage}%` }}
                          ></div>
                        </div>
                        
                        {/* Additional Details */}
                        <div className="swp-year-details grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Total Withdrawn:</span>
                            <div className="font-semibold">{formatCurrency(yearData.totalWithdrawn)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Monthly Income:</span>
                            <div className="font-semibold">{formatCurrency(yearData.monthlyIncome)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Corpus Status:</span>
                            <div className={`font-semibold ${
                              isCriticalCorpus ? 'text-red-600' :
                              isLowCorpus ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {isCriticalCorpus ? 'Critical' : isLowCorpus ? 'Low' : 'Healthy'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Warning Messages */}
                {result.yearsLasting < 20 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-yellow-600 mr-2">⚠️</span>
                      <div>
                        <div className="font-semibold text-yellow-800">Short Duration Warning</div>
                        <div className="text-sm text-yellow-700">
                          Your corpus will last only {result.yearsLasting.toFixed(1)} years. Consider reducing withdrawal amount for longer sustainability.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {!result.isSustainable && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-red-600 mr-2">🚨</span>
                      <div>
                        <div className="font-semibold text-red-800">High Withdrawal Rate</div>
                        <div className="text-sm text-red-700">
                          Your withdrawal rate exceeds the safe 4% rule. Recommended monthly withdrawal: {formatCurrency(result.sustainableWithdrawal)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          
          {isCalculating && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <div className="text-gray-600">Calculating withdrawal plan...</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <span className="text-lg">✅</span>
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};

export default SWPCalculator;
