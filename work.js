let utils = require('./workUtils');
let config = require('./config');

let timeBetweenArrivals = config.timeBetweenArrivals;
let serviceTime = config.serviceTime;
let seed = config.generatorOptions.seed;
let statistics = [];
const T_STUDENT = 1.96;

console.time('simulation');

for (let i = 0; i <= config.numberOfReplicas; i++) {
  seed = seed + (i * 10);
  let getNext = utils.randomGenerator(config.generatorOptions);
  let x = seed, y;
  let clients = utils.generateClients({
    serviceTime,
    timeBetweenArrivals,
    iteratorCount: config.iteratorCount,
    randomGeneratorFn: getNext
  })

  let data = utils.runSimulation(clients);

  if (i === 0) {
    utils.generateCSV(data);
  }

  statistics.push(utils.calculateStatistics(data));
}

// Calculate medians and variances
let {meanTimeBetweenArrivals, meanQueueTime, meanSystemTime, meanServiceTime} = calculateMedians();
let {varianceForTimeBetweenArrivals, varianceForQueueTime, varianceForSystenTime, varianceForServiceTime} = calculateVariances();

// Calculate interval bounds
const sqrtForStatisticsLength = Math.sqrt(statistics.length);
let lowerBoundConfidenceIntervalForTimeBetweenArrivals = meanTimeBetweenArrivals - (T_STUDENT * (Math.sqrt(varianceForTimeBetweenArrivals) / sqrtForStatisticsLength));
let upperBoundConfidenceIntervalForTimeBetweenArrivals = meanTimeBetweenArrivals + (T_STUDENT * (Math.sqrt(varianceForTimeBetweenArrivals) / sqrtForStatisticsLength));
let lowerBoundConfidenceIntervalForQueueTime = meanQueueTime - (T_STUDENT * (Math.sqrt(varianceForQueueTime) / sqrtForStatisticsLength));
let upperBoundConfidenceIntervalForQueueTime = meanQueueTime + (T_STUDENT * (Math.sqrt(varianceForQueueTime) / sqrtForStatisticsLength));
let lowerBoundConfidenceIntervalForSystemTime = meanSystemTime - (T_STUDENT * (Math.sqrt(varianceForSystenTime) / sqrtForStatisticsLength));
let upperBoundConfidenceIntervalForSystemTime = meanSystemTime + (T_STUDENT * (Math.sqrt(varianceForSystenTime) / sqrtForStatisticsLength));
let lowerBoundConfidenceIntervalForServiceTime = meanServiceTime - (T_STUDENT * (Math.sqrt(varianceForServiceTime) / sqrtForStatisticsLength));
let upperBoundConfidenceIntervalForServiceTime = meanServiceTime + (T_STUDENT * (Math.sqrt(varianceForServiceTime) / sqrtForStatisticsLength));

// Display everything
console.log('meanTimeBetweenArrivals => ' + meanTimeBetweenArrivals);
console.log('meanQueueTime => ' + meanQueueTime);
console.log('meanSystemTime => ' + meanSystemTime);
console.log('meanServiceTime => ' + meanServiceTime);
console.log('varianceForTimeBetweenArrivals => ' + varianceForTimeBetweenArrivals);
console.log('varianceForQueueTime => ' + varianceForQueueTime);
console.log('varianceForSystenTime => ' + varianceForSystenTime);
console.log('varianceForServiceTime => ' + varianceForServiceTime);
console.log(`ConfidenceIntervalForServiceTime => ${lowerBoundConfidenceIntervalForServiceTime}...${upperBoundConfidenceIntervalForServiceTime}`);
console.log(`ConfidenceIntervalForQueueTime => ${lowerBoundConfidenceIntervalForQueueTime}...${upperBoundConfidenceIntervalForQueueTime}`);
console.log(`ConfidenceIntervalForSystemTime => ${lowerBoundConfidenceIntervalForSystemTime}...${upperBoundConfidenceIntervalForSystemTime}`);
console.log(`ConfidenceIntervalForTimeBetweenArrivals => ${lowerBoundConfidenceIntervalForTimeBetweenArrivals}...${upperBoundConfidenceIntervalForTimeBetweenArrivals}`);

console.timeEnd('simulation');

function mapStatisticsByField (fieldName) {
  return statistics.map((statistics) => {
    return statistics[fieldName]
  })
}

function getTotal (fieldName) {
  return statistics.reduce((accumulator, statistic) => {
    return accumulator + statistic[fieldName]
  }, 0)
}

function calculateMedians () {
  let totalTimeBetweenArrivals = getTotal('meanTimeBetweenArrivals');
  let totalQueueTime = getTotal('meanQueueTime');
  let totalSystemTime = getTotal('meanSystemTime');
  let totalServiceTime = getTotal('meanServiceTime');
  
  let meanTimeBetweenArrivals = totalTimeBetweenArrivals / statistics.length;
  let meanQueueTime = totalQueueTime / statistics.length;
  let meanSystemTime = totalSystemTime / statistics.length;
  let meanServiceTime = totalServiceTime / statistics.length;

  return {
    meanTimeBetweenArrivals,
    meanQueueTime,
    meanSystemTime,
    meanServiceTime
  }
}

function calculateVariances () {
  let varianceForTimeBetweenArrivals = utils.calculateVariance(mapStatisticsByField('meanTimeBetweenArrivals'), meanTimeBetweenArrivals)
  let varianceForQueueTime = utils.calculateVariance(mapStatisticsByField('meanQueueTime'), meanQueueTime);
  let varianceForSystenTime = utils.calculateVariance(mapStatisticsByField('meanSystemTime'), meanSystemTime);
  let varianceForServiceTime = utils.calculateVariance(mapStatisticsByField('meanServiceTime'), meanServiceTime);

  return {
    varianceForTimeBetweenArrivals,
    varianceForQueueTime,
    varianceForSystenTime,
    varianceForServiceTime
  }
}