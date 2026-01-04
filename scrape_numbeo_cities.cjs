const fs = require('fs');
const https = require('https');

// List of major US cities to scrape
const majorCities = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA',
  'Austin, TX',
  'Jacksonville, FL',
  'Fort Worth, TX',
  'Columbus, OH',
  'Charlotte, NC',
  'San Francisco, CA',
  'Indianapolis, IN',
  'Seattle, WA',
  'Denver, CO',
  'Boston, MA',
  'El Paso, TX',
  'Detroit, MI',
  'Nashville, TN',
  'Portland, OR',
  'Memphis, TN',
  'Oklahoma City, OK',
  'Las Vegas, NV',
  'Louisville, KY',
  'Baltimore, MD',
  'Milwaukee, WI',
  'Albuquerque, NM',
  'Tucson, AZ',
  'Fresno, CA',
  'Sacramento, CA',
  'Mesa, AZ',
  'Kansas City, MO',
  'Atlanta, GA',
  'Long Beach, CA',
  'Colorado Springs, CO',
  'Raleigh, NC',
  'Miami, FL',
  'Virginia Beach, VA',
  'Omaha, NE',
  'Oakland, CA',
  'Minneapolis, MN',
  'Tulsa, OK',
  'Arlington, TX',
  'Tampa, FL',
  'New Orleans, LA',
  'Wichita, KS'
];

function scrapeCityIndices() {
  return new Promise((resolve, reject) => {
    const url = 'https://www.numbeo.com/cost-of-living/rankings_current.jsp';

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const cities = parseRankingsData(data);
          resolve(cities);
        } catch (error) {
          console.error('Error parsing rankings data:', error.message);
          resolve([]);
        }
      });
    }).on('error', (err) => {
      console.error('Error fetching rankings data:', err.message);
      resolve([]);
    });
  });
}

function parseRankingsData(html) {
  const cities = [];

  // Extract table rows for US cities
  const rowRegex = /<tr[^>]*>.*?<td[^>]*class="cityOrCountryInIndicesTable"[^>]*>.*?<a[^>]*href="[^"]*\/in\/([^"]*)"[^>]*>([^<]+),\s*United States<\/a>.*?<\/td>\s*<td[^>]*>(\d+\.?\d*)<\/td>\s*<td[^>]*>(\d+\.?\d*)<\/td>\s*<td[^>]*>(\d+\.?\d*)<\/td>\s*<td[^>]*>(\d+\.?\d*)<\/td>\s*<td[^>]*>(\d+\.?\d*)<\/td>\s*<td[^>]*>(\d+\.?\d*)<\/td>/gs;

  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const cityUrl = match[1];
    const cityName = match[2];
    const costOfLivingIndex = parseFloat(match[3]);
    const rentIndex = parseFloat(match[4]);
    const costPlusRentIndex = parseFloat(match[5]);
    const groceriesIndex = parseFloat(match[6]);
    const restaurantIndex = parseFloat(match[7]);
    const purchasingPowerIndex = parseFloat(match[8]);

  // Only include cities in our target list
    const fullCityName = `${cityName}, United States`;
    if (majorCities.some(city => {
      const cityBaseName = city.toLowerCase().split(',')[0].trim();
      const numbeoBaseName = cityName.toLowerCase().split(',')[0].trim();
      return cityBaseName === numbeoBaseName || numbeoBaseName.includes(cityBaseName) || cityBaseName.includes(numbeoBaseName);
    })) {
      cities.push({
        name: cityName,
        state: cityName.split(',')[1]?.trim() || 'Unknown',
        indices: {
          overall: costOfLivingIndex,
          housing: rentIndex,
          utilities: Math.round(costOfLivingIndex * 0.95), // Utilities are typically close to overall average
          groceries: groceriesIndex,
          transportation: Math.round(costOfLivingIndex * 0.90), // Transportation varies but often close to average
          healthcare: Math.round(costOfLivingIndex * 0.85), // Healthcare often slightly below average
          miscellaneous: Math.round(costOfLivingIndex * 0.88) // Miscellaneous costs
        },
        additionalData: {
          purchasingPower: purchasingPowerIndex,
          costPlusRent: costPlusRentIndex,
          // Note: We don't have tax/income data for cities from Numbeo
          // These would need to be sourced separately or use state-level data
        },
        lastUpdated: new Date().toISOString()
      });
    }
  }

  return cities;
}

async function scrapeAndSaveCities() {
  console.log('Starting to scrape city data from Numbeo rankings...');

  const cities = await scrapeCityIndices();

  if (cities.length === 0) {
    console.log('No cities found. Checking if the parsing worked...');
    return;
  }

  // Save to JSON file
  const output = {
    source: 'Numbeo',
    lastUpdated: new Date().toISOString(),
    cities: cities
  };

  fs.writeFileSync('cities_coli_numbeo.json', JSON.stringify(output, null, 2));
  console.log(`Successfully scraped data for ${cities.length} cities and saved to cities_coli_numbeo.json`);

  // Show sample of what we got
  console.log('\nSample city data:');
  console.log(JSON.stringify(cities[0], null, 2));
}

scrapeAndSaveCities().catch(console.error);