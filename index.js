// const core = require('@actions/core');
// const github = require('@actions/github');
const moment = require('moment');
const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

/**
 * Example of using techanjs in a node runtime environment
 */
const fs = require('fs');
const d3 = require('d3');
const techan = require('techan');
const chart = require('./chart.js');

async function run() {
  const { data } = await axios.get('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=100');
  const csvData = data.map(d => {
    return {
      Date: moment(d[0]).format('DD-MMM-YY'),
      Open: d[1],
      High: d[2],
      Low: d[3],
      Close: d[4],
      Volume: d[5]
    };
  });
    
  const { document } = (new JSDOM('')).window;
  // Create the chart, passing in runtime environment specific setup: node d3, techan and csv data
  const body = d3.select(document.body).call(chart(d3, techan, csvData));

  var stream = fs.createWriteStream("chart.svg");
  stream.once('open', function(fd) {
    stream.write('<?xml version="1.0" encoding="utf-8"?>\n');
    stream.write('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n');
    stream.write(body.html());
    stream.end();
  });

  const { data: { priceChangePercent, lastPrice, highPrice, lowPrice } } = await axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
  const stats = `|$${parseFloat(lastPrice).toFixed(2)}|${parseFloat(priceChangePercent).toFixed(2)}%|$${parseFloat(highPrice).toFixed(2)}|$${parseFloat(lowPrice).toFixed(2)}|\n\n`;
  var stream = fs.createWriteStream("README.md");
  stream.once('open', function(fd) {
    stream.write('# Bitcoin Stats\n\n');
    stream.write('BTC/USDT|24h change|24h high|24h low|\n');
    stream.write('|---|---|---|---|\n');
    stream.write(stats);
    stream.write('<img src="./chart.svg">\n');
    stream.end();
  });
};

run();
