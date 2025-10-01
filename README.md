# Harate Business Intelligence Dashboard

🌱 **Settlement-based revenue validation and payout analysis for Harate Cafe**

## 🚀 Live Dashboard
**Production:** https://harate-dashboard.web.app  
**Firebase Project:** harate-dashboard

## Features

- ✅ **Accurate Settlement Analysis** - Uses real settlement data instead of estimates
- 🔍 **Variance Detection** - Identifies gaps between expected and actual payouts  
- 💰 **Platform-specific Analysis** - Zomato and Swiggy breakdown with actual commission rates
- 📊 **Root Cause Analysis** - Detailed RCA for major variances
- 🏪 **Business Intelligence** - Professional dashboard for restaurant operations
- 📱 **Responsive Design** - Works on all devices
- 🎨 **Harate Branding** - Custom green tea cafe themed design

## Quick Start

1. **Visit Dashboard**: https://harate-dashboard.web.app
2. **Upload Files**: POS reports, Zomato settlement, Swiggy reports
3. **Generate Analysis**: Click "Generate Settlement Analysis"
4. **Review Variances**: Check for major gaps and RCA recommendations
5. **Take Action**: Implement recommended fixes for budget control

## Key Metrics Tracked

- **Expected vs Actual Payouts** with detailed variance analysis
- **Commission Rate Accuracy** (25% Zomato, 22% Swiggy)
- **Ad Spend Analysis** with budget variance (+430.8% overspend detection)
- **Tax Impact** (GST 18%, TDS, TCS calculations)
- **Settlement Status** and timing for cash flow planning
- **Order-level Analysis** with settlement reconciliation

## Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with Harate brand colors (#2ECC71, #27AE60, #F1C40F)
- **Hosting**: Firebase Hosting (harate-dashboard project)
- **CI/CD**: GitHub integration with automatic deployment
- **Analytics**: Built-in variance detection and RCA engine

## Deployment

This project is automatically deployed to Firebase Hosting via GitHub integration.

### Manual Deployment
```bash
npm install -g firebase-tools
firebase login
firebase use harate-dashboard
firebase deploy
```

## Project Structure

```
/ (harate-dashboard repository)
├── index.html              # Main dashboard (settlement-based)
├── package.json            # Node.js configuration
├── firebase.json           # Firebase hosting config
├── .firebaserc            # Project: harate-dashboard
├── README.md              # This documentation
├── .gitignore             # Git ignore rules
├── 404.html               # Custom error page
└── .env.example           # Environment template
```

## Business Impact - Real Results

This dashboard helped Harate Cafe identify:
- **₹14,816.64 payout variance** (51.8% gap) - CRITICAL
- **₹7,021.95 ad overspend** (+430.8% over budget) - MAJOR ISSUE
- **Commission rate error** (20% assumed vs 25% actual)
- **Missing tax calculations** impacting projections
- **Settlement timing** affecting cash flow

## Key Features by Tab

### 1. Settlement Analysis
- Critical variance alerts for major gaps
- Expected vs actual breakdown with RCA
- Settlement status tracking
- Commission rate corrections

### 2. Variance & RCA  
- Detailed gap analysis with root causes
- Action recommendations with priorities
- Ad spend budget control alerts
- Tax impact identification

### 3. Actual vs Expected
- Side-by-side platform comparison
- Real payout calculations vs projections
- Settlement timing impact analysis
- Cash flow planning tools

### 4. Order Analysis
- Settlement status per order batch
- Average order value impact assessment
- Commission cost per order
- Marketing ROI analysis

## Support & Configuration

For technical support or business queries:
- **Business**: Harate Cafe Management
- **Technical**: Dashboard Development Team  
- **Firebase Project**: harate-dashboard
- **Production URL**: https://harate-dashboard.web.app

---

**Built with ❤️ for Harate Cafe Business Intelligence**  
*Accurate settlement analysis • Variance detection • Business growth*