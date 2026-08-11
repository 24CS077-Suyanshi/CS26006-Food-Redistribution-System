const fs = require('fs');
const readline = require('readline');

// The path to your downloaded CSV file
const csvFilePath = 'C:\\Users\\Manish Patel\\Downloads\\archive (10)\\food_wastage_data.csv';
// The path to the JSON file we want to update for the website
const jsonOutputPath = 'c:\\Users\\Manish Patel\\OneDrive\\Desktop\\CHARUSAT\\Sem 5\\SGP3\\Food-Redistribution-System-main\\Food-Redistribution-System-main\\frontend\\src\\impactData.json';

async function processData() {
  const fileStream = fs.createReadStream(csvFilePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let totalFoodWastageKg = 0;
  let totalEvents = 0;
  let isFirstLine = true;

  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false; // Skip the header row
      continue;
    }

    const columns = line.split(',');
    // The 'Wastage Food Amount' is the last column (index 10)
    const wastageAmount = parseInt(columns[10]);

    if (!isNaN(wastageAmount)) {
      totalFoodWastageKg += wastageAmount;
      totalEvents++;
    }
  }

  // Calculate realistic stats based on the data
  // Since this is wastage food that FRS aims to *save*:
  const mealsShared = Math.floor(totalFoodWastageKg * 4); // Assuming 1kg of food = ~4 meals
  const registeredNGOs = Math.floor(totalEvents / 15); // Just a realistic dummy calculation
  const activeVolunteers = Math.floor(totalEvents / 5);

  const newImpactData = {
    mealsShared: mealsShared,
    registeredNGOs: registeredNGOs,
    activeVolunteers: activeVolunteers,
    foodSavedKg: totalFoodWastageKg,
    successRate: 98 // Hardcoded high success rate
  };

  // Save these calculated stats directly to the JSON file the website uses
  fs.writeFileSync(jsonOutputPath, JSON.stringify(newImpactData, null, 2));

  console.log('Successfully processed the CSV dataset!');
  console.log('New Impact Data generated:', newImpactData);
}

processData();
