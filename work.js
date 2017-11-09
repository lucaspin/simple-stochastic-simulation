let utils = require('./workUtils');
let config = require('./config');

let timeBetweenArrivals = config.timeBetweenArrivals;
let serviceTime = config.serviceTime;
let seed = config.generatorOptions.seed;
let statistics = [];
const T_STUDENT = 1.96;

for (let i = 0; i <= 10000; i++) {
    console.log('Generating replica number ' + i);
    config.generatorOptions.seed = seed + (i * 10);
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

let totalTimeBetweenArrivals = getTotal('meanTimeBetweenArrivals');
let totalQueueTime = getTotal('meanQueueTime');
let totalSystemTime = getTotal('meanSystemTime');
let totalServiceTime = getTotal('meanServiceTime');

let meanTimeBetweenArrivals = totalTimeBetweenArrivals / statistics.length;
let meanQueueTime = totalQueueTime / statistics.length;
let meanSystemTime = totalSystemTime / statistics.length;
let meanServiceTime = totalServiceTime / statistics.length;

let varianceForTimeBetweenArrivals = utils.calculateVariance(mapStatisticsByField('meanTimeBetweenArrivals'), meanTimeBetweenArrivals)
let varianceForQueueTime = utils.calculateVariance(mapStatisticsByField('meanQueueTime'), meanQueueTime);
let varianceForSystenTime = utils.calculateVariance(mapStatisticsByField('meanSystemTime'), meanSystemTime);
let varianceForServiceTime = utils.calculateVariance(mapStatisticsByField('meanServiceTime'), meanServiceTime);

const sqrtForStatisticsLength = Math.sqrt(statistics.length);

let lowerBoundConfidenceIntervalForTimeBetweenArrivals = meanTimeBetweenArrivals - (T_STUDENT * (Math.sqrt(varianceForTimeBetweenArrivals) / sqrtForStatisticsLength));
let upperBoundConfidenceIntervalForTimeBetweenArrivals = meanTimeBetweenArrivals + (T_STUDENT * (Math.sqrt(varianceForTimeBetweenArrivals) / sqrtForStatisticsLength));

let lowerBoundConfidenceIntervalForQueueTime = meanQueueTime - (T_STUDENT * (Math.sqrt(varianceForQueueTime) / sqrtForStatisticsLength));
let upperBoundConfidenceIntervalForQueueTime = meanQueueTime + (T_STUDENT * (Math.sqrt(varianceForQueueTime) / sqrtForStatisticsLength));

let lowerBoundConfidenceIntervalForSystemTime = meanSystemTime - (T_STUDENT * (Math.sqrt(varianceForSystenTime) / sqrtForStatisticsLength));
let upperBoundConfidenceIntervalForSystemTime = meanSystemTime + (T_STUDENT * (Math.sqrt(varianceForSystenTime) / sqrtForStatisticsLength));

let lowerBoundConfidenceIntervalForServiceTime = meanServiceTime - (T_STUDENT * (Math.sqrt(varianceForServiceTime) / sqrtForStatisticsLength));
let upperBoundConfidenceIntervalForServiceTime = meanServiceTime + (T_STUDENT * (Math.sqrt(varianceForServiceTime) / sqrtForStatisticsLength));


console.log('totalTimeBetweenArrivals => ' + totalTimeBetweenArrivals);
console.log('totalQueueTime => ' + totalQueueTime);
console.log('totalSystemTime => ' + totalSystemTime);
console.log('totalServiceTime => ' + totalServiceTime);
console.log('meanTimeBetweenArrivals => ' + meanTimeBetweenArrivals);
console.log('meanQueueTime => ' + meanQueueTime);
console.log('meanSystemTime => ' + meanSystemTime);
console.log('meanServiceTime => ' + meanServiceTime);
console.log('varianceForTimeBetweenArrivals => ' + varianceForTimeBetweenArrivals);
console.log('varianceForQueueTime => ' + varianceForQueueTime);
console.log('varianceForSystenTime => ' + varianceForSystenTime);
console.log('varianceForServiceTime => ' + varianceForServiceTime);

console.log('lowerBoundConfidenceIntervalForServiceTime => ' + lowerBoundConfidenceIntervalForServiceTime);
console.log('lowerBoundConfidenceIntervalForQueueTime => ' + lowerBoundConfidenceIntervalForQueueTime);
console.log('lowerBoundConfidenceIntervalForSystemTime => ' + lowerBoundConfidenceIntervalForSystemTime);
console.log('lowerBoundConfidenceIntervalForTimeBetweenArrivals => ' + lowerBoundConfidenceIntervalForTimeBetweenArrivals);

console.log('upperBoundConfidenceIntervalForServiceTime => ' + upperBoundConfidenceIntervalForServiceTime);
console.log('upperBoundConfidenceIntervalForQueueTime => ' + upperBoundConfidenceIntervalForQueueTime);
console.log('upperBoundConfidenceIntervalForSystemTime => ' + upperBoundConfidenceIntervalForSystemTime);
console.log('upperBoundConfidenceIntervalForTimeBetweenArrivals => ' + upperBoundConfidenceIntervalForTimeBetweenArrivals);

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
