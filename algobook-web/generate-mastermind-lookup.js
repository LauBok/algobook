const fs = require('fs');

// Constants
const COLORS = 6;
const POSITIONS = 4;

// Calculate feedback between guess and secret
function calculateFeedback(guess, secret) {
    let blackPegs = 0;
    const guessColors = new Array(COLORS).fill(0);
    const secretColors = new Array(COLORS).fill(0);
    
    // Count black pegs and color frequencies
    for (let j = 0; j < POSITIONS; j++) {
        if (guess[j] === secret[j]) {
            blackPegs++;
        } else {
            guessColors[guess[j]]++;
            secretColors[secret[j]]++;
        }
    }
    
    // Count white pegs
    let whitePegs = 0;
    for (let c = 0; c < COLORS; c++) {
        whitePegs += Math.min(guessColors[c], secretColors[c]);
    }
    
    return [blackPegs, whitePegs];
}

// Generate all possible codes
function generateAllCodes() {
    const codes = [];
    for (let a = 0; a < COLORS; a++) {
        for (let b = 0; b < COLORS; b++) {
            for (let c = 0; c < COLORS; c++) {
                for (let d = 0; d < COLORS; d++) {
                    codes.push([a, b, c, d]);
                }
            }
        }
    }
    return codes;
}

// Generate lookup table for first guess scenarios
function generateLookupTable() {
    console.log('Generating Mastermind lookup table...');
    const allCodes = generateAllCodes();
    const lookupTable = {};
    
    let processed = 0;
    for (const potentialGuess of allCodes) {
        const feedbackCounts = {};
        
        // For each potential guess, calculate feedback against all possible secrets
        for (const possibility of allCodes) {
            const feedback = calculateFeedback(potentialGuess, possibility);
            const key = `${feedback[0]},${feedback[1]}`;
            feedbackCounts[key] = (feedbackCounts[key] || 0) + 1;
        }
        
        // Convert to the format expected by evaluate_guess
        const results = [];
        for (const [feedbackKey, count] of Object.entries(feedbackCounts)) {
            const [black, white] = feedbackKey.split(',').map(Number);
            results.push([[black, white], count]);
        }
        
        // Sort by most common feedback first
        results.sort((a, b) => b[1] - a[1]);
        
        lookupTable[JSON.stringify(potentialGuess)] = results;
        
        processed++;
        if (processed % 100 === 0) {
            console.log(`Processed ${processed}/${allCodes.length} guesses...`);
        }
    }
    
    return lookupTable;
}

// Main execution
console.log('Starting Mastermind lookup table generation...');
const startTime = Date.now();

const lookupTable = generateLookupTable();

const endTime = Date.now();
console.log(`Generation completed in ${(endTime - startTime) / 1000}s`);

// Save to JSON file
const outputPath = './public/mastermind-lookup.json';
console.log(`Saving lookup table to ${outputPath}...`);

// Ensure public directory exists
if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public');
}

fs.writeFileSync(outputPath, JSON.stringify(lookupTable, null, 0));

const fileSize = fs.statSync(outputPath).size;
console.log(`Lookup table saved! File size: ${(fileSize / 1024).toFixed(1)} KB`);
console.log(`Total entries: ${Object.keys(lookupTable).length}`);