const fs = require('fs');

module.exports = {
  generateCSV,
  calculateStatistics,
  runSimulation,
  generateClients,
  getServiceTimeForClientsOnSystem,
  randomGenerator
}

function randomGenerator (options) {
  var state = options.seed;
  return getNext;

  function getNext () {
    state = (options.multiplier * state + options.increment) % options.module;

    // Divide by module, cause we want the normalized value
    return state / options.module;
  }
}

function getServiceTimeForClientsOnSystem (currentClient, queue, clientBeingServed) {
  let serviceTimeForClientsOnQueue = clientBeingServed && currentClient.id !== clientBeingServed.id ? clientBeingServed.remainingServiceTime : 0;
  queue.forEach((clientOnQueue) => {
    if (currentClient.id !== clientOnQueue.id) {
      serviceTimeForClientsOnQueue += clientOnQueue.ts;
    }
  })

  return serviceTimeForClientsOnQueue;
}

function generateCSV (data) {
  let fileContent = getHeaders();
  data.forEach((row) => {
    fileContent += `${row.tec},${row.ts},${row.realTime},${row.initialTime},${row.endTime},${row.queueTime},${row.systemTime},${row.queueLength},${row.attendantFreeTime}\n`
  })

  fs.writeFile('data.csv', fileContent, (err) => {
    if (err) {
      throw err;
    }

    console.log(`./data.csv created successfully :)`);
  });
}

function getHeaders () {
  return "TEC,TS,T_REAL,T_INICIO,T_FIM,T_FILA,T_SISTEMA,N_PESSOAS_FILA,TEMPO_LIVRE_CAIXA\n"
}

function calculateStatistics (data) {
  const totalAttendantFreeTime = getTotal('attendantFreeTime');
  const totalTimeBetweenArrivals = getTotal('tec');
  const totalServiceTime = getTotal('ts');
  const totalQueueTime = getTotal('queueTime');
  const totalSystemTime = getTotal('systemTime');

  return {
    freeAttendancyProbability: totalAttendantFreeTime / data[data.length - 1].realTime,
    meanTimeBetweenArrivals: totalTimeBetweenArrivals / data.length,
    meanServiceTime: totalServiceTime / data.length,
    meanQueueTime: totalQueueTime / data.length,
    meanSystemTime: totalSystemTime / data.length
  }

  function getTotal (fieldName) {
    return data.reduce((accumulator, row) => {
      return accumulator + row[fieldName];
    }, 0)
  }
}

function generateClients ({serviceTime, timeBetweenArrivals, iteratorCount, randomGeneratorFn}) {
  var clients = [];
  
  for (let i = 0; i < iteratorCount; i++) {
    x = randomGeneratorFn();
  
    let obj = {};
  
    if (x <= 0.52) {
      timeBetweenArrivals["0.52"]++;
      obj.tec = 1;
    } else if (x <= 0.8) {
      timeBetweenArrivals["0.8"]++;
      obj.tec = 3;
    } else if (x <= 0.9) {
      timeBetweenArrivals["0.9"]++;
      obj.tec = 5;
    } else if (x <= 0.96) {
      timeBetweenArrivals["0.96"]++;
      obj.tec = 7;
    } else {
      timeBetweenArrivals["1"]++;
      obj.tec = 9;
    }
  
    if (x <= 0.5) {
      serviceTime["0.5"]++;
      obj.ts = 1.25;
    } else if (x <= 0.82) {
      serviceTime["0.82"]++;
      obj.ts = 3.75;
    } else if (x <= 0.9) {
      serviceTime["0.9"]++;
      obj.ts = 6.25;
    } else if (x <= 0.94) {
      serviceTime["0.94"]++;
      obj.ts = 8.75;
    } else {
      serviceTime["1"]++;
      obj.ts = 11.25;
    }
  
    obj.id = i;
    clients.push(obj);
  }

  return clients;
}

function runSimulation (clients) {
  let queue = [];
  let clientBeingServed = null;
  let realTime = 0;
  let data = [];
  
  clients.forEach((client, index) => {
    realTime += client.tec;

    if (clientBeingServed === null) {
      clientBeingServed = client;
    } else {
      queue.push(client);
    }
  
    calculateRemainingServiceTime(client, index);
    checkClientBeingServed(index);
  
    let serviceTimeLeft = getServiceTimeForClientsOnSystem(client, queue, clientBeingServed);
    let initialTime = realTime + serviceTimeLeft;
    let endTime = initialTime + client.ts;
    let queueTime = initialTime - realTime;
  
    data.push({
      tec: client.tec,
      ts: client.ts,
      realTime: realTime,
      initialTime: initialTime,
      endTime: endTime,
      queueTime: initialTime - realTime,
      systemTime: queueTime + client.ts,
      queueLength: queue.length,
      attendantFreeTime: index === 0 ? client.tec : initialTime - data[index - 1].endTime
    })
  })

  return data;

  function calculateRemainingServiceTime (currentClient, index) {
    if (index === 0) {
      clientBeingServed.remainingServiceTime = currentClient.ts;
    } else {
      clientBeingServed.remainingServiceTime = clientBeingServed.remainingServiceTime - currentClient.tec;
    }
  }

  function checkClientBeingServed (index) {
    if (clientBeingServed.remainingServiceTime <= 0) {
      let i = queue.length - 1;
      while (i > 0 && data[index - i].initialTime <= realTime) {
        clientBeingServed = queue.shift();
        clientBeingServed.remainingServiceTime = clientBeingServed.ts;
        i--;
      }
  
      let lastRow = data[data.length - (i + 1)]
      clientBeingServed.remainingServiceTime -= (realTime - lastRow.initialTime)
    }
  }
}
