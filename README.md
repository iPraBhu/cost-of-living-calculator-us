# US State Cost of Living Comparator

A static web application that allows users to compare cost of living across multiple US states and calculate comparable salaries based on different cost factors.

## Features

- **Multi-State Selection**: Select and compare 2 or more US states simultaneously
- **Searchable Interface**: Easily find states with a searchable dropdown
- **Comprehensive Comparison**: Compare across 7 cost factors:
  - Overall cost of living
  - Housing
  - Utilities
  - Groceries
  - Transportation
  - Healthcare
  - Miscellaneous
- **Economic Indicators**: Additional data points including:
  - State income tax rates
  - Property tax rates
  - Sales tax rates
  - Median household income
  - Unemployment rates
- **Comparable Salary Calculator**: Automatically calculates what your salary would need to be in each state to maintain the same standard of living
- **Interactive Visualizations**: Bar charts to visualize salary comparisons
- **Shareable Links**: Generate and share comparison URLs with query parameters
- **Baseline Selection**: Choose which state to use as your reference point
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Keyboard navigation and proper ARIA labels

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Chart.js** - Data visualization
- **CSS** - Styling (no external CSS frameworks)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/iPraBhu/cost-of-living-calculator-us.git
cd cost-of-living-calculator-us
```

2. Install dependencies:
```bash
npm install
```

### Running Locally

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Building for Production

Build the application:
```bash
npm run build
```

The built files will be in the `dist/` directory.

Preview the production build locally:
```bash
npm run preview
```

## Deployment

### GitHub Pages

1. **Update `vite.config.ts`** (if needed):
   
   If your repository is at `https://github.com/username/repo`, update the `base` option:
   ```typescript
   export default defineConfig({
     plugins: [react()],
     base: '/cost-of-living-calculator-us/', // Use your repo name
   })
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Deploy to GitHub Pages**:

   **Option A: Using gh-pages package**
   ```bash
   npm install --save-dev gh-pages
   ```
   
   Add to `package.json` scripts:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
   
   Then run:
   ```bash
   npm run deploy
   ```

   **Option B: Manual deployment**
   - Push the contents of `dist/` to the `gh-pages` branch
   - Enable GitHub Pages in repository settings, selecting the `gh-pages` branch

4. **Access your site**:
   
   Your site will be available at: `https://username.github.io/cost-of-living-calculator-us/`

### Other Static Hosting Platforms

This is a static site and can be deployed to any static hosting service:

- **Netlify**: Drag and drop the `dist/` folder or connect your Git repository
- **Vercel**: Import your repository and it will auto-detect Vite
- **Cloudflare Pages**: Connect your repository and set build command to `npm run build` and output directory to `dist`
- **AWS S3 + CloudFront**: Upload `dist/` contents to S3 bucket configured for static hosting

## Data Source

### Current Data

The application uses **real cost of living data** from the Missouri Economic Research and Information Center (MERIC) for Q3 2025. The data is stored in `/src/data/states_coli.json` and includes:

- All 50 US states plus Washington D.C.
- 7 cost factors for each state: overall, housing, utilities, groceries, transportation, healthcare, miscellaneous- **Additional economic indicators**:
  - State income tax rates (top marginal)
  - Property tax rates (average effective)
  - Sales tax rates (state-level)
  - Median household income (2023 data)
  - Unemployment rates (current)- Indices relative to the national average (100)
- MERIC derives state indices by averaging participating cities and metropolitan areas

**Data Source**: [MERIC Cost of Living Data Series](https://meric.mo.gov/data/cost-living-data-series)
**Last Updated**: Q3 2025
**License**: Free to use with attribution

#### Recommended Data Sources:

1. **Council for Community and Economic Research (C2ER)**
   - Publishes quarterly Cost of Living Index
   - Most widely cited source
   - Subscription required
   - Website: https://www.coli.org/

2. **Missouri Economic Research and Information Center (MERIC)**
   - Publishes cost of living data by state
   - Free to use
   - Updated quarterly
   - Website: https://meric.mo.gov/data/cost-living-data-series

3. **Bureau of Economic Analysis (BEA)**
   - Regional Price Parities (RPPs)
   - Federal government source
   - Free and public
   - Website: https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area

#### How to Update Data:

1. Obtain cost of living indices from your chosen source
2. Edit `/src/data/states_coli.json`
3. Update the `meta` section:
   ```json
   {
     "source": "Your Data Source Name",
     "lastUpdated": "YYYY-MM-DD"
   }
   ```
4. Update each state's indices (ensure all values are numbers relative to 100):
   ```json
   {
     "code": "CA",
     "name": "California",
     "indices": {
       "overall": 142,
       "housing": 198,
       "utilities": 115,
       "groceries": 125,
       "transportation": 118,
       "healthcare": 110
     }
   }
   ```

#### Data Licensing Considerations:

- Ensure you have the right to use any data source
- Check if attribution is required
- Verify if commercial use is permitted
- Consider data freshness and update frequency
- Document data provenance in the UI

## Project Structure

```
cost-of-living-calculator-us/
├── public/               # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── StateMultiSelect.tsx
│   │   ├── ResultsTable.tsx
│   │   └── ComparableSalaryChart.tsx
│   ├── data/           # Data files
│   │   └── states_coli.json
│   ├── utils/          # Utility functions
│   │   ├── calc.ts     # Calculation logic
│   │   └── queryState.ts # URL parameter handling
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── styles.css      # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## How It Works

### Calculation Formula

The comparable salary is calculated using the formula:

```
Comparable Salary = Income × (Target State Index / Baseline State Index)
```

For example:
- If you earn $100,000 in Texas (index: 91)
- And want to know the comparable salary in California (index: 142)
- Calculation: $100,000 × (142 / 91) = $156,044

This means you would need to earn approximately $156,044 in California to maintain the same standard of living as earning $100,000 in Texas.

### URL Sharing

The application supports shareable URLs with query parameters:

```
?states=CA,TX,NY&income=100000&base=CA
```

- `states`: Comma-separated state codes
- `income`: Annual income amount
- `base`: Baseline state code

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Disclaimer

This tool is for informational purposes only. Cost of living calculations are estimates and actual costs may vary based on individual circumstances, lifestyle choices, and specific locations within states. Always conduct thorough research when making financial or relocation decisions.

## Acknowledgments

- Cost of living data structure inspired by C2ER methodology
- Chart.js for visualization capabilities
- React and Vite communities for excellent tooling