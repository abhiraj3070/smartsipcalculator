import { jsPDF } from "jspdf";

class PDFGenerator {
  constructor() {
    this.doc = null;
  }

  // Initialize PDF document
  initializePDF() {
    try {
      this.doc = new jsPDF();
      this.doc.setFont("helvetica");
      return this.doc;
    } catch (error) {
      console.error("Error initializing PDF:", error);
      throw new Error("Failed to initialize PDF document");
    }
  }

  // Format currency for PDF
  formatCurrency(amount) {
    try {
      if (typeof amount !== 'number' || isNaN(amount)) {
        amount = 0;
      }
      // Use Rs instead of rupee symbol for better PDF compatibility
      return `Rs ${amount.toLocaleString('en-IN')}`;
    } catch (error) {
      return `Rs ${amount.toLocaleString()}`;
    }
  }

  // Generate SIP PDF Report
  generateSIPReport(sipData, calculationName = "SIP Investment Plan") {
    try {
      if (!sipData) {
        throw new Error("No SIP data provided");
      }

      console.log("Generating SIP PDF with data:", sipData);
      this.initializePDF();
      
      // Add professional header background with gradient effect
      this.doc.setFillColor(0, 60, 120);
      this.doc.rect(0, 0, 210, 45, 'F');
      this.doc.setFillColor(0, 100, 180);
      this.doc.rect(0, 0, 210, 35, 'F');
      this.doc.setFillColor(0, 120, 200);
      this.doc.rect(0, 0, 210, 25, 'F');
      
      // Add corner decorations
      this.doc.setFillColor(255, 255, 255);
      this.doc.circle(25, 15, 2, 'F');
      this.doc.circle(185, 15, 2, 'F');
      this.doc.circle(25, 30, 1.5, 'F');
      this.doc.circle(185, 30, 1.5, 'F');
      
      // Add title with enhanced styling
      this.doc.setFontSize(26);
      this.doc.setTextColor(255, 255, 255);
      this.doc.text("SIP INVESTMENT REPORT", 105, 18, { align: "center" });
      
      this.doc.setFontSize(12);
      this.doc.setTextColor(200, 230, 255);
      this.doc.text(calculationName, 105, 32, { align: "center" });
      
      // Add decorative elements
      this.doc.setDrawColor(255, 255, 255);
      this.doc.setLineWidth(1);
      this.doc.line(40, 40, 170, 40);
      // Add small decorative dots
      for (let i = 0; i < 5; i++) {
        this.doc.circle(90 + i * 8, 40, 0.5, 'F');
      }
      
      let yPosition = 65;
      
      // Investment Summary section
      this.doc.setFillColor(240, 248, 255);
      this.doc.rect(15, yPosition - 5, 180, 22, 'F');
      this.doc.setDrawColor(0, 120, 200);
      this.doc.setLineWidth(2);
      this.doc.line(15, yPosition - 5, 195, yPosition - 5);
      
      this.doc.setFontSize(16);
      this.doc.setTextColor(0, 80, 160);
      this.doc.text("INVESTMENT SUMMARY", 20, yPosition + 8);
      yPosition += 35;
      
      // Summary details
      this.doc.setFontSize(11);
      this.doc.setTextColor(50, 50, 50);
      
      const summaryItems = [
        ["Monthly Investment:", this.formatCurrency(sipData.investmentAmount || 0)],
        ["Investment Period:", `${sipData.sipDuration || 0} years`],
        ["Expected Return:", `${sipData.annualReturn || 0}%`],
        ["Total Investment:", this.formatCurrency(sipData.totalInvestment || 0)],
        ["Maturity Value:", this.formatCurrency(sipData.futureValue || 0)],
        ["Total Returns:", this.formatCurrency(sipData.totalGains || 0)],
        ["Wealth Multiplier:", `${(sipData.wealthMultiplier || 0).toFixed(2)}x`]
      ];
      
      // Draw summary items
      summaryItems.forEach(([label, value], index) => {
        if (index % 2 === 0) {
          this.doc.setFillColor(248, 252, 255);
          this.doc.rect(15, yPosition - 2, 180, 10, 'F');
        }
        
        this.doc.setTextColor(0, 80, 160);
        this.doc.setFont("helvetica", "bold");
        this.doc.text(label, 20, yPosition + 4);
        this.doc.setTextColor(50, 50, 50);
        this.doc.setFont("helvetica", "normal");
        this.doc.text(value, 120, yPosition + 4);
        yPosition += 12;
      });
      
      yPosition += 15;
      
      // Year-wise breakdown with all data
      if (sipData.yearlyData && sipData.yearlyData.length > 0) {
        // Check if we need a new page
        if (yPosition > 200) {
          this.doc.addPage();
          yPosition = 20;
        }
        
        // Section header
        this.doc.setFillColor(0, 120, 80);
        this.doc.rect(15, yPosition - 5, 180, 22, 'F');
        this.doc.setFillColor(0, 150, 100);
        this.doc.rect(15, yPosition - 5, 180, 12, 'F');
        
        this.doc.setFontSize(16);
        this.doc.setTextColor(255, 255, 255);
        this.doc.text("COMPLETE YEAR-WISE GROWTH ANALYSIS", 20, yPosition + 6);
        yPosition += 30;
        
        // Table header
        this.doc.setFillColor(230, 230, 230);
        this.doc.rect(15, yPosition - 5, 180, 12, 'F');
        
        this.doc.setFontSize(10);
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFont("helvetica", "bold");
        this.doc.text("Year", 20, yPosition + 2);
        this.doc.text("Investment", 50, yPosition + 2);
        this.doc.text("Portfolio Value", 90, yPosition + 2);
        this.doc.text("Returns", 130, yPosition + 2);
        this.doc.text("Return %", 170, yPosition + 2);
        this.doc.setFont("helvetica", "normal");
        yPosition += 18;
        
        // Data rows - ALL YEARS
        sipData.yearlyData.forEach((year, index) => {
          // Check if we need a new page
          if (yPosition > 270) {
            this.doc.addPage();
            yPosition = 20;
            
            // Re-add table header on new page
            this.doc.setFillColor(230, 230, 230);
            this.doc.rect(15, yPosition - 5, 180, 12, 'F');
            
            this.doc.setFontSize(10);
            this.doc.setTextColor(0, 0, 0);
            this.doc.setFont("helvetica", "bold");
            this.doc.text("Year", 20, yPosition + 2);
            this.doc.text("Investment", 50, yPosition + 2);
            this.doc.text("Portfolio Value", 90, yPosition + 2);
            this.doc.text("Returns", 130, yPosition + 2);
            this.doc.text("Return %", 170, yPosition + 2);
            this.doc.setFont("helvetica", "normal");
            yPosition += 18;
          }
          
          if (index % 2 === 0) {
            this.doc.setFillColor(248, 255, 248);
            this.doc.rect(15, yPosition - 2, 180, 10, 'F');
          }
          
          this.doc.setFontSize(9);
          this.doc.setTextColor(0, 100, 0);
          this.doc.text(`${year.year}`, 20, yPosition + 3);
          this.doc.setTextColor(50, 50, 50);
          this.doc.text(this.formatCurrency(year.investment || 0), 50, yPosition + 3);
          this.doc.setTextColor(0, 80, 160);
          this.doc.text(this.formatCurrency(year.value || 0), 90, yPosition + 3);
          this.doc.setTextColor(0, 120, 80);
          this.doc.text(this.formatCurrency(year.returns || 0), 130, yPosition + 3);
          this.doc.setTextColor(200, 80, 0);
          this.doc.text(`${((year.returns / year.investment) * 100 || 0).toFixed(1)}%`, 170, yPosition + 3);
          yPosition += 10;
        });
      }
      
      // Add comprehensive investment insights section
      if (sipData.totalInvestment && sipData.futureValue) {
        // Check if we need a new page
        if (yPosition > 220) {
          this.doc.addPage();
          yPosition = 20;
        }
        
        yPosition += 20;
        this.doc.setFillColor(255, 248, 220);
        this.doc.rect(15, yPosition - 5, 180, 80, 'F');
        this.doc.setDrawColor(200, 150, 0);
        this.doc.setLineWidth(2);
        this.doc.line(15, yPosition - 5, 195, yPosition - 5);
        
        this.doc.setFontSize(14);
        this.doc.setTextColor(200, 100, 0);
        this.doc.text("COMPREHENSIVE INVESTMENT INSIGHTS", 20, yPosition + 8);
        yPosition += 18;
        
        this.doc.setFontSize(9);
        this.doc.setTextColor(80, 80, 80);
        
        // Calculate comprehensive insights
        const totalInvestment = sipData.totalInvestment || 0;
        const futureValue = sipData.futureValue || 0;
        const totalReturns = sipData.totalGains || 0;
        const annualReturn = sipData.annualReturn || 0;
        const sipDuration = sipData.sipDuration || 0;
        const monthlyInvestment = sipData.investmentAmount || 0;
        
        const doubleTime = annualReturn > 0 ? (Math.log(2) / Math.log(1 + annualReturn / 100)).toFixed(1) : 0;
        const totalReturnPercent = totalInvestment > 0 ? ((totalReturns / totalInvestment) * 100).toFixed(1) : 0;
        const monthlyReturnRate = monthlyInvestment > 0 ? ((futureValue / (monthlyInvestment * 12 * sipDuration)) - 1).toFixed(2) : 0;
        const averageYearlyGrowth = sipDuration > 0 ? (totalReturns / sipDuration).toFixed(0) : 0;
        const yearlyInvestment = monthlyInvestment * 12;
        const totalMonths = sipDuration * 12;
        const avgMonthlyReturn = totalMonths > 0 ? (totalReturns / totalMonths).toFixed(0) : 0;
        const maturityAmount = futureValue;
        const wealthMultiplier = totalInvestment > 0 ? (maturityAmount / totalInvestment).toFixed(2) : 0;
        
        this.doc.text(`• Investment doubles in approximately ${doubleTime} years`, 20, yPosition);
        this.doc.text(`• Total return percentage: ${totalReturnPercent}%`, 20, yPosition + 8);
        this.doc.text(`• Monthly return multiplier: ${monthlyReturnRate}x`, 20, yPosition + 16);
        this.doc.text(`• Average yearly wealth growth: Rs ${averageYearlyGrowth}`, 20, yPosition + 24);
        this.doc.text(`• Yearly investment amount: Rs ${yearlyInvestment.toLocaleString('en-IN')}`, 20, yPosition + 32);
        this.doc.text(`• Average monthly returns: Rs ${avgMonthlyReturn}`, 20, yPosition + 40);
        this.doc.text(`• Wealth multiplier at maturity: ${wealthMultiplier}x`, 20, yPosition + 48);
        this.doc.text(`• Power of compounding creates exponential growth`, 20, yPosition + 56);
        this.doc.text(`• Longer investment period amplifies returns significantly`, 20, yPosition + 64);
        this.doc.text(`• Systematic investment builds disciplined wealth creation`, 20, yPosition + 72);
      }
      
      // Add pagination to all pages
      this.addPaginationToAllPages("SIP");
      
      console.log("SIP PDF generated successfully");
      return this.doc;
    } catch (error) {
      console.error("Error generating SIP PDF:", error);
      throw new Error(`Failed to generate SIP PDF: ${error.message}`);
    }
  }

  // Generate SWP PDF Report
  generateSWPReport(swpData, calculationName = "SWP Withdrawal Plan") {
    try {
      if (!swpData) {
        throw new Error("No SWP data provided");
      }

      console.log("Generating SWP PDF with data:", swpData);
      this.initializePDF();
      
      // Add professional header background with gradient effect
      this.doc.setFillColor(80, 30, 120);
      this.doc.rect(0, 0, 210, 45, 'F');
      this.doc.setFillColor(120, 50, 180);
      this.doc.rect(0, 0, 210, 35, 'F');
      this.doc.setFillColor(150, 70, 200);
      this.doc.rect(0, 0, 210, 25, 'F');
      
      // Add corner decorations
      this.doc.setFillColor(255, 255, 255);
      this.doc.circle(25, 15, 2, 'F');
      this.doc.circle(185, 15, 2, 'F');
      this.doc.circle(25, 30, 1.5, 'F');
      this.doc.circle(185, 30, 1.5, 'F');
      
      // Add title with enhanced styling
      this.doc.setFontSize(26);
      this.doc.setTextColor(255, 255, 255);
      this.doc.text("SWP WITHDRAWAL REPORT", 105, 18, { align: "center" });
      
      this.doc.setFontSize(12);
      this.doc.setTextColor(220, 200, 255);
      this.doc.text(calculationName, 105, 32, { align: "center" });
      
      // Add decorative elements
      this.doc.setDrawColor(255, 255, 255);
      this.doc.setLineWidth(1);
      this.doc.line(40, 40, 170, 40);
      // Add small decorative dots
      for (let i = 0; i < 5; i++) {
        this.doc.circle(90 + i * 8, 40, 0.5, 'F');
      }
      
      let yPosition = 65;
      
      // SWP Summary section
      this.doc.setFillColor(250, 245, 255);
      this.doc.rect(15, yPosition - 5, 180, 22, 'F');
      this.doc.setDrawColor(150, 70, 200);
      this.doc.setLineWidth(2);
      this.doc.line(15, yPosition - 5, 195, yPosition - 5);
      
      this.doc.setFontSize(16);
      this.doc.setTextColor(120, 50, 180);
      this.doc.text("WITHDRAWAL SUMMARY", 20, yPosition + 8);
      yPosition += 35;
      
      // Summary details
      this.doc.setFontSize(11);
      this.doc.setTextColor(50, 50, 50);
      
      const summaryItems = [
        ["Initial Corpus:", this.formatCurrency(swpData.totalInvestment || swpData.initialCorpus || 0)],
        ["Monthly Withdrawal:", this.formatCurrency(swpData.monthlyWithdrawal || 0)],
        ["Expected Return:", `${swpData.annualReturn || swpData.expectedReturn || 0}%`],
        ["Withdrawal Period:", `${swpData.yearsLasting?.toFixed(1) || swpData.withdrawalDuration || 0} years`],
        ["Total Withdrawals:", this.formatCurrency(swpData.totalWithdrawn || swpData.totalWithdrawals || 0)],
        ["Remaining Corpus:", this.formatCurrency(swpData.remainingValue || swpData.finalCorpus || 0)],
        ["Sustainability:", swpData.isSustainable ? "Sustainable" : "Limited Duration"]
      ];
      
      // Draw summary items
      summaryItems.forEach(([label, value], index) => {
        if (index % 2 === 0) {
          this.doc.setFillColor(248, 250, 255);
          this.doc.rect(15, yPosition - 2, 180, 10, 'F');
        }
        
        this.doc.setTextColor(120, 50, 180);
        this.doc.setFont("helvetica", "bold");
        this.doc.text(label, 20, yPosition + 4);
        this.doc.setTextColor(50, 50, 50);
        this.doc.setFont("helvetica", "normal");
        this.doc.text(value, 120, yPosition + 4);
        yPosition += 12;
      });
      
      yPosition += 20;
      
      // Enhanced key insights section with comprehensive data
      this.doc.setFillColor(255, 248, 220);
      this.doc.rect(15, yPosition - 5, 180, 90, 'F');
      this.doc.setDrawColor(200, 150, 0);
      this.doc.setLineWidth(2);
      this.doc.line(15, yPosition - 5, 195, yPosition - 5);
      
      this.doc.setFontSize(14);
      this.doc.setTextColor(200, 100, 0);
      this.doc.text("COMPREHENSIVE WITHDRAWAL INSIGHTS", 20, yPosition + 8);
      yPosition += 18;
      
      this.doc.setFontSize(9);
      this.doc.setTextColor(80, 80, 80);
      
      // Calculate comprehensive insights
      const monthlyIncome = swpData.monthlyWithdrawal || 0;
      const yearlyIncome = monthlyIncome * 12;
      const initialCorpus = swpData.totalInvestment || swpData.initialCorpus || 0;
      const expectedReturn = swpData.annualReturn || swpData.expectedReturn || 0;
      const withdrawalPeriod = swpData.yearsLasting || swpData.withdrawalDuration || 0;
      const totalWithdrawals = swpData.totalWithdrawn || swpData.totalWithdrawals || 0;
      const remainingCorpus = swpData.remainingValue || swpData.finalCorpus || 0;
      
      const withdrawalRate = initialCorpus > 0 ? ((yearlyIncome / initialCorpus) * 100).toFixed(2) : 0;
      const monthlyReturnNeeded = initialCorpus > 0 ? ((monthlyIncome / initialCorpus) * 100).toFixed(3) : 0;
      const totalIncomeGenerated = totalWithdrawals;
      const corpusPreservation = initialCorpus > 0 ? ((remainingCorpus / initialCorpus) * 100).toFixed(1) : 0;
      const sustainabilityText = swpData.isSustainable ? "Your corpus can sustain this withdrawal plan" : "Consider reducing withdrawal amount";
      const totalMonthsWithdrawal = Math.floor(withdrawalPeriod * 12);
      const avgMonthlyCorpusReduction = totalMonthsWithdrawal > 0 ? ((initialCorpus - remainingCorpus) / totalMonthsWithdrawal).toFixed(0) : 0;
      const yearlyWithdrawalAmount = monthlyIncome * 12;
      const incomeVsCorpusRatio = initialCorpus > 0 ? ((totalIncomeGenerated / initialCorpus) * 100).toFixed(1) : 0;
      
      this.doc.text(`• Monthly Income: ${this.formatCurrency(monthlyIncome)}`, 20, yPosition);
      this.doc.text(`• Yearly Income: ${this.formatCurrency(yearlyIncome)}`, 20, yPosition + 8);
      this.doc.text(`• Annual Withdrawal Rate: ${withdrawalRate}%`, 20, yPosition + 16);
      this.doc.text(`• Monthly Return Needed: ${monthlyReturnNeeded}%`, 20, yPosition + 24);
      this.doc.text(`• Total Income Generated: ${this.formatCurrency(totalIncomeGenerated)}`, 20, yPosition + 32);
      this.doc.text(`• Corpus Preservation: ${corpusPreservation}%`, 20, yPosition + 40);
      this.doc.text(`• Total withdrawal months: ${totalMonthsWithdrawal} months`, 20, yPosition + 48);
      this.doc.text(`• Average monthly corpus reduction: Rs ${avgMonthlyCorpusReduction}`, 20, yPosition + 56);
      this.doc.text(`• Income vs corpus ratio: ${incomeVsCorpusRatio}%`, 20, yPosition + 64);
      this.doc.text(`• Sustainability: ${sustainabilityText}`, 20, yPosition + 72);
      this.doc.text(`• Strategic withdrawal planning ensures financial security`, 20, yPosition + 80);
      
      yPosition += 100;
      
      // Add withdrawal timeline if space allows
      if (yPosition < 180 && withdrawalPeriod > 0) {
        this.doc.setFillColor(240, 255, 240);
        this.doc.rect(15, yPosition - 5, 180, 50, 'F');
        this.doc.setDrawColor(0, 150, 0);
        this.doc.setLineWidth(2);
        this.doc.line(15, yPosition - 5, 195, yPosition - 5);
        
        this.doc.setFontSize(14);
        this.doc.setTextColor(0, 120, 0);
        this.doc.text("WITHDRAWAL TIMELINE", 20, yPosition + 8);
        yPosition += 18;
        
        this.doc.setFontSize(9);
        this.doc.setTextColor(80, 80, 80);
        
        const totalMonths = Math.floor(withdrawalPeriod * 12);
        const totalYears = Math.floor(withdrawalPeriod);
        const remainingMonths = totalMonths - (totalYears * 12);
        const dailyIncome = monthlyIncome / 30;
        const weeklyIncome = dailyIncome * 7;
        const quarterlyIncome = monthlyIncome * 3;
        
        this.doc.text(`• Total Withdrawal Period: ${totalYears} years and ${remainingMonths} months`, 20, yPosition);
        this.doc.text(`• Total Months of Income: ${totalMonths} months`, 20, yPosition + 8);
        this.doc.text(`• Daily Income: Rs ${dailyIncome.toFixed(0)}`, 20, yPosition + 16);
        this.doc.text(`• Weekly Income: Rs ${weeklyIncome.toFixed(0)}`, 20, yPosition + 24);
        this.doc.text(`• Quarterly Income: Rs ${quarterlyIncome.toLocaleString('en-IN')}`, 20, yPosition + 32);
        this.doc.text(`• Average Monthly Corpus Depletion: ${this.formatCurrency((initialCorpus - remainingCorpus) / totalMonths)}`, 20, yPosition + 40);
      }
      
      // Add pagination to all pages
      this.addPaginationToAllPages("SWP");
      
      console.log("SWP PDF generated successfully");
      return this.doc;
    } catch (error) {
      console.error("Error generating SWP PDF:", error);
      throw new Error(`Failed to generate SWP PDF: ${error.message}`);
    }
  }

  // Generate Combined PDF Report
  generateCombinedReport(sipData, swpData, calculationName = "Complete Investment Plan") {
    try {
      if (!sipData || !swpData) {
        throw new Error("Both SIP and SWP data required");
      }

      console.log("Generating Combined PDF with data:", { sipData, swpData });
      this.initializePDF();
      
      // Add professional header background with gradient effect
      this.doc.setFillColor(20, 80, 20);
      this.doc.rect(0, 0, 210, 45, 'F');
      this.doc.setFillColor(40, 120, 40);
      this.doc.rect(0, 0, 210, 35, 'F');
      this.doc.setFillColor(60, 150, 60);
      this.doc.rect(0, 0, 210, 25, 'F');
      
      // Add corner decorations
      this.doc.setFillColor(255, 255, 255);
      this.doc.circle(25, 15, 2, 'F');
      this.doc.circle(185, 15, 2, 'F');
      this.doc.circle(25, 30, 1.5, 'F');
      this.doc.circle(185, 30, 1.5, 'F');
      
      // Add title with enhanced styling
      this.doc.setFontSize(24);
      this.doc.setTextColor(255, 255, 255);
      this.doc.text("COMPLETE INVESTMENT JOURNEY", 105, 18, { align: "center" });
      
      this.doc.setFontSize(12);
      this.doc.setTextColor(200, 255, 200);
      this.doc.text(calculationName, 105, 32, { align: "center" });
      
      // Add decorative elements
      this.doc.setDrawColor(255, 255, 255);
      this.doc.setLineWidth(1);
      this.doc.line(40, 40, 170, 40);
      // Add small decorative dots
      for (let i = 0; i < 5; i++) {
        this.doc.circle(90 + i * 8, 40, 0.5, 'F');
      }
      
      let yPosition = 65;
      
      // Phase 1: SIP Accumulation
      this.doc.setFillColor(240, 248, 255);
      this.doc.rect(15, yPosition - 5, 180, 22, 'F');
      this.doc.setDrawColor(0, 120, 200);
      this.doc.setLineWidth(2);
      this.doc.line(15, yPosition - 5, 195, yPosition - 5);
      
      this.doc.setFontSize(16);
      this.doc.setTextColor(0, 80, 160);
      this.doc.text("PHASE 1: WEALTH ACCUMULATION (SIP)", 20, yPosition + 8);
      yPosition += 30;
      
      this.doc.setFontSize(11);
      this.doc.setTextColor(50, 50, 50);
      
      const sipItems = [
        ["Monthly Investment:", this.formatCurrency(sipData.investmentAmount || 0)],
        ["Investment Period:", `${sipData.sipDuration || 0} years`],
        ["Expected Return:", `${sipData.annualReturn || 0}%`],
        ["Total Investment:", this.formatCurrency(sipData.totalInvestment || 0)],
        ["Maturity Value:", this.formatCurrency(sipData.futureValue || 0)],
        ["Total Returns:", this.formatCurrency(sipData.totalGains || 0)]
      ];
      
      sipItems.forEach(([label, value], index) => {
        if (index % 2 === 0) {
          this.doc.setFillColor(248, 252, 255);
          this.doc.rect(15, yPosition - 2, 180, 10, 'F');
        }
        
        this.doc.setTextColor(0, 80, 160);
        this.doc.setFont("helvetica", "bold");
        this.doc.text(label, 20, yPosition + 4);
        this.doc.setTextColor(50, 50, 50);
        this.doc.setFont("helvetica", "normal");
        this.doc.text(value, 120, yPosition + 4);
        yPosition += 12;
      });
      
      yPosition += 20;
      
      // Phase 2: SWP Distribution
      this.doc.setFillColor(250, 245, 255);
      this.doc.rect(15, yPosition - 5, 180, 22, 'F');
      this.doc.setDrawColor(150, 70, 200);
      this.doc.setLineWidth(2);
      this.doc.line(15, yPosition - 5, 195, yPosition - 5);
      
      this.doc.setFontSize(16);
      this.doc.setTextColor(120, 50, 180);
      this.doc.text("PHASE 2: WEALTH DISTRIBUTION (SWP)", 20, yPosition + 8);
      yPosition += 30;
      
      const swpItems = [
        ["Initial Corpus (from SIP):", this.formatCurrency(swpData.totalInvestment || swpData.initialCorpus || 0)],
        ["Monthly Withdrawal:", this.formatCurrency(swpData.monthlyWithdrawal || 0)],
        ["Expected Return:", `${swpData.annualReturn || swpData.expectedReturn || 0}%`],
        ["Withdrawal Period:", `${swpData.yearsLasting?.toFixed(1) || swpData.withdrawalDuration || 0} years`],
        ["Total Withdrawals:", this.formatCurrency(swpData.totalWithdrawn || swpData.totalWithdrawals || 0)],
        ["Remaining Corpus:", this.formatCurrency(swpData.remainingValue || swpData.finalCorpus || 0)]
      ];
      
      swpItems.forEach(([label, value], index) => {
        if (index % 2 === 0) {
          this.doc.setFillColor(248, 250, 255);
          this.doc.rect(15, yPosition - 2, 180, 10, 'F');
        }
        
        this.doc.setTextColor(120, 50, 180);
        this.doc.setFont("helvetica", "bold");
        this.doc.text(label, 20, yPosition + 4);
        this.doc.setTextColor(50, 50, 50);
        this.doc.setFont("helvetica", "normal");
        this.doc.text(value, 120, yPosition + 4);
        yPosition += 12;
      });
      
      yPosition += 20;
      
      // Comprehensive Investment Journey Summary
      // Check if we need a new page
      if (yPosition > 180) {
        this.doc.addPage();
        yPosition = 20;
      }
      
      this.doc.setFillColor(255, 248, 220);
      this.doc.rect(15, yPosition - 5, 180, 100, 'F');
      this.doc.setDrawColor(200, 150, 0);
      this.doc.setLineWidth(2);
      this.doc.line(15, yPosition - 5, 195, yPosition - 5);
      
      this.doc.setFontSize(14);
      this.doc.setTextColor(200, 100, 0);
      this.doc.text("COMPLETE INVESTMENT JOURNEY ANALYSIS", 20, yPosition + 8);
      yPosition += 18;
      
      this.doc.setFontSize(9);
      this.doc.setTextColor(80, 80, 80);
      
      // Calculate comprehensive journey metrics
      const sipDuration = sipData.sipDuration || 0;
      const swpDuration = swpData.yearsLasting || 0;
      const totalJourneyYears = sipDuration + swpDuration;
      const totalInvestment = sipData.totalInvestment || 0;
      const sipMaturityValue = sipData.futureValue || 0;
      const totalGains = sipData.totalGains || 0;
      const totalWithdrawals = swpData.totalWithdrawn || swpData.totalWithdrawals || 0;
      const finalLegacy = swpData.remainingValue || swpData.finalCorpus || 0;
      const monthlyInvestment = sipData.investmentAmount || 0;
      const monthlyWithdrawal = swpData.monthlyWithdrawal || 0;
      
      // Advanced calculations
      const totalWealthCreated = totalGains + totalWithdrawals + finalLegacy;
      const overallReturnPercent = totalInvestment > 0 ? ((totalWealthCreated / totalInvestment) * 100).toFixed(1) : 0;
      const averageMonthlyIncome = swpDuration > 0 ? (totalWithdrawals / (swpDuration * 12)) : 0;
      const wealthMultiplier = totalInvestment > 0 ? (totalWealthCreated / totalInvestment).toFixed(2) : 0;
      const yearlyInvestmentAmount = monthlyInvestment * 12;
      const yearlyWithdrawalAmount = monthlyWithdrawal * 12;
      const totalInvestmentMonths = sipDuration * 12;
      const totalWithdrawalMonths = swpDuration * 12;
      const netWealthGain = totalWealthCreated - totalInvestment;
      const investmentEfficiency = totalInvestment > 0 ? ((netWealthGain / totalInvestment) * 100).toFixed(1) : 0;
      
      this.doc.text(`• Total Investment Journey: ${totalJourneyYears.toFixed(1)} years`, 20, yPosition);
      this.doc.text(`• SIP Phase Duration: ${sipDuration} years (${totalInvestmentMonths} months)`, 20, yPosition + 8);
      this.doc.text(`• SWP Phase Duration: ${swpDuration.toFixed(1)} years (${totalWithdrawalMonths.toFixed(0)} months)`, 20, yPosition + 16);
      this.doc.text(`• Total Amount Invested: ${this.formatCurrency(totalInvestment)}`, 20, yPosition + 24);
      this.doc.text(`• Total Wealth Created: ${this.formatCurrency(totalWealthCreated)}`, 20, yPosition + 32);
      this.doc.text(`• Overall Return Percentage: ${overallReturnPercent}%`, 20, yPosition + 40);
      this.doc.text(`• Wealth Multiplier: ${wealthMultiplier}x`, 20, yPosition + 48);
      this.doc.text(`• Net Wealth Gain: ${this.formatCurrency(netWealthGain)}`, 20, yPosition + 56);
      this.doc.text(`• Investment Efficiency: ${investmentEfficiency}%`, 20, yPosition + 64);
      this.doc.text(`• Final Legacy Value: ${this.formatCurrency(finalLegacy)}`, 20, yPosition + 72);
      this.doc.text(`• Yearly Investment Amount: Rs ${yearlyInvestmentAmount.toLocaleString('en-IN')}`, 20, yPosition + 80);
      this.doc.text(`• Yearly Withdrawal Amount: Rs ${yearlyWithdrawalAmount.toLocaleString('en-IN')}`, 20, yPosition + 88);
      
      yPosition += 108;
      
      // Monthly cash flow analysis
      if (yPosition > 200) {
        this.doc.addPage();
        yPosition = 20;
      }
      
      this.doc.setFillColor(240, 255, 240);
      this.doc.rect(15, yPosition - 5, 180, 70, 'F');
      this.doc.setDrawColor(0, 150, 0);
      this.doc.setLineWidth(2);
      this.doc.line(15, yPosition - 5, 195, yPosition - 5);
      
      this.doc.setFontSize(14);
      this.doc.setTextColor(0, 120, 0);
      this.doc.text("MONTHLY CASH FLOW ANALYSIS", 20, yPosition + 8);
      yPosition += 18;
      
      this.doc.setFontSize(9);
      this.doc.setTextColor(80, 80, 80);
      
      const totalMonthsInvestment = sipDuration * 12;
      const totalMonthsWithdrawal = swpDuration * 12;
      const cashFlowRatio = monthlyInvestment > 0 ? (monthlyWithdrawal / monthlyInvestment).toFixed(2) : 0;
      const dailyInvestment = monthlyInvestment / 30;
      const dailyWithdrawal = monthlyWithdrawal / 30;
      const weeklyInvestment = dailyInvestment * 7;
      const weeklyWithdrawal = dailyWithdrawal * 7;
      const quarterlyInvestment = monthlyInvestment * 3;
      const quarterlyWithdrawal = monthlyWithdrawal * 3;
      
      this.doc.text(`• Monthly Investment (SIP Phase): ${this.formatCurrency(monthlyInvestment)}`, 20, yPosition);
      this.doc.text(`• Monthly Withdrawal (SWP Phase): ${this.formatCurrency(monthlyWithdrawal)}`, 20, yPosition + 8);
      this.doc.text(`• Cash Flow Ratio: ${cashFlowRatio}x (Withdrawal vs Investment)`, 20, yPosition + 16);
      this.doc.text(`• Daily Investment: Rs ${dailyInvestment.toFixed(0)}`, 20, yPosition + 24);
      this.doc.text(`• Daily Withdrawal: Rs ${dailyWithdrawal.toFixed(0)}`, 20, yPosition + 32);
      this.doc.text(`• Weekly Investment: Rs ${weeklyInvestment.toFixed(0)}`, 20, yPosition + 40);
      this.doc.text(`• Weekly Withdrawal: Rs ${weeklyWithdrawal.toFixed(0)}`, 20, yPosition + 48);
      this.doc.text(`• Total Months of Investment: ${totalMonthsInvestment} months`, 20, yPosition + 56);
      this.doc.text(`• Total Months of Withdrawal: ${totalMonthsWithdrawal.toFixed(0)} months`, 20, yPosition + 64);
      
      // Add pagination to all pages
      this.addPaginationToAllPages("Combined");
      
      console.log("Combined PDF generated successfully");
      return this.doc;
    } catch (error) {
      console.error("Error generating combined PDF:", error);
      throw new Error(`Failed to generate combined PDF: ${error.message}`);
    }
  }

  // Helper method to add pagination to all pages
  addPaginationToAllPages(reportType = "Investment") {
    try {
      const totalPages = this.doc.internal.getNumberOfPages();
      
      // Add pagination to all pages
      for (let i = 1; i <= totalPages; i++) {
        this.doc.setPage(i);
        const pageHeight = this.doc.internal.pageSize.height;
        
        // Only add full footer on the last page
        if (i === totalPages) {
          // Footer gradient background
          this.doc.setFillColor(20, 20, 20);
          this.doc.rect(0, pageHeight - 25, 210, 25, 'F');
          this.doc.setFillColor(40, 40, 40);
          this.doc.rect(0, pageHeight - 25, 210, 15, 'F');
          
          // Add decorative border with different colors for different report types
          if (reportType === "SIP") {
            this.doc.setDrawColor(0, 120, 200);
            this.doc.setFillColor(0, 120, 200);
          } else if (reportType === "SWP") {
            this.doc.setDrawColor(150, 70, 200);
            this.doc.setFillColor(150, 70, 200);
          } else {
            this.doc.setDrawColor(60, 150, 60);
            this.doc.setFillColor(60, 150, 60);
          }
          
          this.doc.setLineWidth(1.5);
          this.doc.line(0, pageHeight - 25, 210, pageHeight - 25);
          
          // Add small decorative elements
          this.doc.circle(20, pageHeight - 12, 1, 'F');
          this.doc.circle(190, pageHeight - 12, 1, 'F');
          
          this.doc.setFontSize(9);
          this.doc.setTextColor(255, 255, 255);
          this.doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN', { hour12: false })}`, 105, pageHeight - 15, { align: "center" });
          this.doc.setTextColor(180, 180, 180);
          
          if (reportType === "SIP") {
            this.doc.text("SIP Calculator - Building Your Financial Future", 105, pageHeight - 5, { align: "center" });
          } else if (reportType === "SWP") {
            this.doc.text("SWP Calculator - Managing Your Withdrawal Strategy", 105, pageHeight - 5, { align: "center" });
          } else {
            this.doc.text("Complete Investment Journey - SIP to SWP Transition", 105, pageHeight - 5, { align: "center" });
          }
        }
        
        // Add page number to all pages (bottom right)
        this.doc.setFontSize(8);
        this.doc.setTextColor(100, 100, 100);
        this.doc.text(`Page ${i} of ${totalPages}`, 190, pageHeight - 10, { align: "right" });
      }
    } catch (error) {
      console.error('Error adding pagination:', error);
    }
  }

  // Download PDF
  downloadPDF(filename = "investment-report.pdf") {
    try {
      if (!this.doc) {
        throw new Error("PDF document not initialized");
      }
      
      console.log("Downloading PDF with filename:", filename);
      this.doc.save(filename);
      console.log("PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      throw new Error(`Failed to download PDF: ${error.message}`);
    }
  }
}

export default PDFGenerator;
