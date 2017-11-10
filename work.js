let utils = require('./workUtils');
let config = require('./config');

let timeBetweenArrivals = config.timeBetweenArrivals;
let serviceTime = config.serviceTime;
let getNext = utils.randomGenerator(config.generatorOptions);
let x = config.generatorOptions.seed, y;
let clients = utils.generateClients({
  serviceTime,
  timeBetweenArrivals,
  iteratorCount: config.iteratorCount,
  randomGeneratorFn: getNext
})

let frequenceMapForTimeBetweenArrivals = {
  "0.52": timeBetweenArrivals["0.52"] / config.iteratorCount,
  "0.8": timeBetweenArrivals["0.8"] / config.iteratorCount,
  "0.9": timeBetweenArrivals["0.9"] / config.iteratorCount,
  "0.96": timeBetweenArrivals["0.96"] / config.iteratorCount,
  "1": timeBetweenArrivals["1"] / config.iteratorCount
}

let frequenceMapForServiceTimes = {
  "0.5": serviceTime["0.5"] / config.iteratorCount,
  "0.82": serviceTime["0.82"] / config.iteratorCount,
  "0.9": serviceTime["0.9"] / config.iteratorCount,
  "0.94": serviceTime["0.94"] / config.iteratorCount,
  "1": 0
}

let data = utils.runSimulation(clients);
utils.generateCSV(data);
console.log(utils.calculateStatistics(data));