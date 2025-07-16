import React, { useState } from 'react';

const AdvancedCalculators = ({ sipAmount, duration, returnRate }) => {
  const [activeTab, setActiveTab] = useState('inflation');
  const [inflationRate, setInflationRate] = useState(6);
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [taxRate, setTaxRate] = useState(20);

  // Inflation Adjusted Calculator
  const calculateInflationAdjusted = () => {
    if (!sipAmount || !returnRate || !duration || sipAmount <= 0 || returnRate <= 0 || duration <= 0) {
      return { realValue: 0, nominalValue: 0, inflationImpact: 0, realReturnRate: 0 };
    }
    
    const realReturnRate = ((1 + returnRate/100) / (1 + inflationRate/100) - 1) * 100;
    const monthlyRealReturn = realReturnRate / 12 / 100;
    const months = duration * 12;
    
    if (monthlyRealReturn === 0) {
      const futureValue = sipAmount * months;
      const nominalValue = sipAmount * months;
      return {
        realValue: futureValue,
        nominalValue: nominalValue,
        inflationImpact: 0,
        realReturnRate: realReturnRate
      };
    }
    
    const futureValue = sipAmount * (((Math.pow(1 + monthlyRealReturn, months) - 1) / monthlyRealReturn) * (1 + monthlyRealReturn));
    const nominalValue = sipAmount * (((Math.pow(1 + returnRate/12/100, months) - 1) / (returnRate/12/100)) * (1 + returnRate/12/100));
    
    return {
      realValue: futureValue,
      nominalValue: nominalValue,
      inflationImpact: nominalValue - futureValue,
      realReturnRate: realReturnRate
    };
  };

  // Tax Calculator
  const calculateTaxImpact = () => {
    if (!sipAmount || !returnRate || !duration || sipAmount <= 0 || returnRate <= 0 || duration <= 0) {
      return { grossReturns: 0, gains: 0, taxOnGains: 0, netReturns: 0, effectiveRate: 0 };
    }
    
    const monthlyReturn = returnRate / 12 / 100;
    const months = duration * 12;
    const totalInvestment = sipAmount * months;
    
    if (monthlyReturn === 0) {
      return {
        grossReturns: totalInvestment,
        gains: 0,
        taxOnGains: 0,
        netReturns: totalInvestment,
        effectiveRate: 0
      };
    }
    
    const grossReturns = sipAmount * (((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * (1 + monthlyReturn));
    const gains = grossReturns - totalInvestment;
    const taxOnGains = gains * (taxRate / 100);
    const netReturns = grossReturns - taxOnGains;
    
    return {
      grossReturns,
      gains,
      taxOnGains,
      netReturns,
      effectiveRate: totalInvestment > 0 ? ((netReturns / totalInvestment) ** (1 / duration) - 1) * 100 : 0
    };
  };

  // Step-up SIP Calculator
  const calculateStepUpSIP = (stepUpRate = 10) => {
    let totalValue = 0;
    let currentSIP = sipAmount;
    
    for (let year = 1; year <= duration; year++) {
      const monthlyReturn = returnRate / 12 / 100;
      const months = 12;
      
      // Calculate value for this year with current SIP
      const yearValue = currentSIP * (((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * (1 + monthlyReturn));
      
      // Compound the previous total value for one year
      totalValue = totalValue * Math.pow(1 + monthlyReturn, 12) + yearValue;
      
      // Step up SIP for next year
      currentSIP = currentSIP * (1 + stepUpRate / 100);
    }
    
    const regularSIP = sipAmount * (((Math.pow(1 + returnRate/12/100, duration * 12) - 1) / (returnRate/12/100)) * (1 + returnRate/12/100));
    
    return {
      stepUpValue: totalValue,
      regularValue: regularSIP,
      additionalBenefit: totalValue - regularSIP
    };
  };

  const inflationData = calculateInflationAdjusted();
  const taxData = calculateTaxImpact();
  const stepUpData = calculateStepUpSIP();

  const tabs = [
    { id: 'inflation', label: '📊 Inflation Impact', icon: '📈' },
    { id: 'tax', label: '💰 Tax Calculator', icon: '🧾' },
    { id: 'stepup', label: '📈 Step-up SIP', icon: '⬆️' },
    { id: 'comparison', label: '⚖️ Comparison', icon: '📊' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🧮 Advanced Calculators</h3>
        
        {/* Tab Navigation */}
        <div className="advanced-calculator-tabs flex space-x-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`advanced-calculator-tab flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 text-center ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <span className="tab-icon text-lg">{tab.icon}</span>
                <span className="tab-label text-xs leading-tight">{tab.label.split(' ').slice(1).join(' ')}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="advanced-calculator-content p-6">
        {/* Inflation Impact Tab */}
        {activeTab === 'inflation' && (
          <div className="space-y-6">
            <div className="advanced-calculator-grid grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Inflation Rate (%)
                </label>
                <input
                  type="number"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)}
                  className="advanced-calculator-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Real Return Rate
                </label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg font-semibold text-green-600">
                  {inflationData.realReturnRate.toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="advanced-calculator-grid grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="advanced-calculator-card bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="advanced-calculator-result text-center">
                  <div className="advanced-calculator-result-value text-2xl font-bold text-blue-600">
                    ₹{inflationData.nominalValue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </div>
                  <div className="advanced-calculator-result-label text-sm text-blue-700 mt-1">Nominal Value</div>
                </div>
              </div>
              
              <div className="advanced-calculator-card bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <div className="advanced-calculator-result text-center">
                  <div className="advanced-calculator-result-value text-2xl font-bold text-green-600">
                    ₹{inflationData.realValue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </div>
                  <div className="advanced-calculator-result-label text-sm text-green-700 mt-1">Real Value (Today's Power)</div>
                </div>
              </div>
              
              <div className="advanced-calculator-card bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                <div className="advanced-calculator-result text-center">
                  <div className="advanced-calculator-result-value text-2xl font-bold text-red-600">
                    ₹{inflationData.inflationImpact.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </div>
                  <div className="advanced-calculator-result-label text-sm text-red-700 mt-1">Inflation Impact</div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-yellow-600 mr-3">💡</div>
                <div>
                  <div className="font-semibold text-yellow-800">Inflation Insight</div>
                  <div className="text-yellow-700 text-sm mt-1">
                    Due to {inflationRate}% inflation, your ₹{inflationData.nominalValue.toLocaleString(undefined, {maximumFractionDigits: 0})} 
                    will have the purchasing power of ₹{inflationData.realValue.toLocaleString(undefined, {maximumFractionDigits: 0})} 
                    in today's money.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tax Calculator Tab */}
        {activeTab === 'tax' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Rate on Gains (%)
                </label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective Return Rate
                </label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg font-semibold text-green-600">
                  {taxData.effectiveRate.toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    ₹{taxData.grossReturns.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </div>
                  <div className="text-xs text-blue-700 mt-1">Gross Returns</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">
                    ₹{taxData.gains.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </div>
                  <div className="text-xs text-yellow-700 mt-1">Capital Gains</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    ₹{taxData.taxOnGains.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </div>
                  <div className="text-xs text-red-700 mt-1">Tax Liability</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    ₹{taxData.netReturns.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </div>
                  <div className="text-xs text-green-700 mt-1">Net Returns</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-blue-600 mr-3">📋</div>
                <div>
                  <div className="font-semibold text-blue-800">Tax Planning Tip</div>
                  <div className="text-blue-700 text-sm mt-1">
                    Consider ELSS funds for tax deduction under 80C. Long-term capital gains on equity 
                    mutual funds above ₹1 lakh are taxed at 10% without indexation.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step-up SIP Tab */}
        {activeTab === 'stepup' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
              <h4 className="font-semibold text-lg mb-4">📈 Step-up SIP Benefits</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    ₹{stepUpData.regularValue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </div>
                  <div className="text-sm text-purple-700 mt-1">Regular SIP</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{stepUpData.stepUpValue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </div>
                  <div className="text-sm text-green-700 mt-1">Step-up SIP (10%)</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{stepUpData.additionalBenefit.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </div>
                  <div className="text-sm text-blue-700 mt-1">Extra Benefit</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold mb-3">Step-up Schedule (10% annually)</h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {Array.from({length: Math.min(duration, 10)}, (_, i) => {
                    const year = i + 1;
                    const sipForYear = sipAmount * Math.pow(1.1, i);
                    return (
                      <div key={year} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Year {year}</span>
                        <span className="font-semibold text-blue-600">
                          ₹{sipForYear.toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-green-600 mr-3">🚀</div>
                  <div>
                    <div className="font-semibold text-green-800">Step-up Advantage</div>
                    <div className="text-green-700 text-sm mt-1">
                      By increasing your SIP by 10% annually, you can accumulate 
                      ₹{stepUpData.additionalBenefit.toLocaleString(undefined, {maximumFractionDigits: 0})} 
                      more than regular SIP. This helps beat inflation and achieve goals faster.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SIP vs Lump Sum */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h5 className="font-semibold mb-3">📊 SIP vs Lump Sum</h5>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">SIP (Monthly)</span>
                    <span className="font-semibold">₹{sipAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Lump Sum Equivalent</span>
                    <span className="font-semibold">₹{(sipAmount * duration * 12).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">SIP Advantage</span>
                    <span className="font-semibold text-green-600">Rupee Cost Averaging</span>
                  </div>
                </div>
              </div>

              {/* Different Return Scenarios */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h5 className="font-semibold mb-3">📈 Return Scenarios</h5>
                <div className="space-y-2">
                  {[8, 10, 12, 15, 18].map((rate) => {
                    const value = sipAmount * (((Math.pow(1 + rate/12/100, duration * 12) - 1) / (rate/12/100)) * (1 + rate/12/100));
                    return (
                      <div key={rate} className="flex justify-between items-center">
                        <span className="text-sm">{rate}% return</span>
                        <span className={`font-semibold ${rate === returnRate ? 'text-blue-600' : 'text-gray-600'}`}>
                          ₹{(value/100000).toFixed(1)}L
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h5 className="font-semibold mb-4">🎯 Investment Comparison</h5>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { name: 'Bank FD', rate: 6.5, risk: 'Low', liquidity: 'Medium' },
                  { name: 'Debt Funds', rate: 8, risk: 'Low-Medium', liquidity: 'High' },
                  { name: 'Hybrid Funds', rate: 10, risk: 'Medium', liquidity: 'High' },
                  { name: 'Equity Funds', rate: 12, risk: 'High', liquidity: 'High' }
                ].map((investment) => {
                  const value = sipAmount * (((Math.pow(1 + investment.rate/12/100, duration * 12) - 1) / (investment.rate/12/100)) * (1 + investment.rate/12/100));
                  return (
                    <div key={investment.name} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-center">
                        <div className="font-semibold text-sm mb-2">{investment.name}</div>
                        <div className="text-lg font-bold text-blue-600">
                          ₹{(value/100000).toFixed(1)}L
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          <div>Risk: {investment.risk}</div>
                          <div>Liquidity: {investment.liquidity}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedCalculators;
