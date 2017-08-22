/* global Intl, parseFloat */
const request = require('request');
const util = require('util');
const Discord = require('discord.io');
const config = require('./config.json');

const token = config.token;

const cmcUrl = 'https://api.coinmarketcap.com/v1/ticker?convert=EUR';

const dateOptions = {
    weekday: "long", year: "numeric", month: "short",
    day: "numeric", hour: "2-digit", minute: "2-digit"
};

var formatter = {};
var cmcData = {};

var call = function () {
    request({
        url: cmcUrl,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            for (var i in body) {
                cmcData[body[i].id] = body[i];
            }
        }
    });
};

// initial call
call();

const interval = setInterval(call, 30 * 1000);

var bot = new Discord.Client({
    token: token,
    autorun: true
});

bot.on('ready', function () {
    console.log(bot.username + " - (" + bot.id + ")");
});

bot.on('disconnect', function (errMsg, code) {
    console.log('bot disconnected with code ', code, ' for reason ', errMsg);
    bot.connect();
});

bot.on('message', function (user, userID, channelID, message, event) {
    command = message.toLowerCase().split(' ');
    if (command[0] === "!cmc") {
        ticker = command.slice(1, command.length);
        sendCoinData(channelID, ticker);
    }
});

function sendCoinData(channelID, ticker) {
    // max 3 coins to post
    if (ticker.length > 3) {
        ticker.length = 3;
    }

    for (var t in ticker) {
        if (cmcData[ticker[t]] === undefined) {
            console.log('not found ' + ticker[t]);
            continue;
        }

        var price = parseFloat(cmcData[ticker[t]]['price_usd']);
        var priceEUR = parseFloat(cmcData[ticker[t]]['price_eur']);
        var priceBTC = parseFloat(cmcData[ticker[t]]['price_btc']).toFixed(8);
        var change24h = cmcData[ticker[t]]['percent_change_24h'];

        bot.sendMessage({
            to: channelID,
            message: "",
            embed: {
                color: change24h >= 0 ? 1026080 : 14824448,
                title: cmcData[ticker[t]]['symbol'] + ' - ' + cmcData[ticker[t]]['name'] + ' #' + cmcData[ticker[t]]['rank'],
                thumbnail: {
                    url: 'https://files.coinmarketcap.com/static/img/coins/64x64/' + cmcData[ticker[t]]['id'] + '.png'
                },
                fields: [
                    {
                        name: "Price",
                        value: (price < 1 ? formatCurrency(price, 'USD', 6) : formatCurrency(price, 'USD', 2)) + '\n'
                            + (priceEUR < 1 ? formatCurrency(priceEUR, 'EUR', 6) : formatCurrency(priceEUR, 'EUR', 2)) + '\n*' + priceBTC + ' BTC*'
                    },
                    {
                        name: "Market Cap",
                        value: formatCurrency(cmcData[ticker[t]]['market_cap_usd'], 'USD', 2)
                    },
                    {
                        name: "24h Volume",
                        value: formatCurrency(cmcData[ticker[t]]['24h_volume_usd'], 'USD', 2)
                    },
                    {
                        name: "Change",
                        value: 'hour: ' + cmcData[ticker[t]]['percent_change_1h'] + '%\n'
                            + 'day: ' + cmcData[ticker[t]]['percent_change_24h'] + '%\n'
                            + 'week: ' + cmcData[ticker[t]]['percent_change_7d'] + '%\n'
                    }
                ],
                footer: {
                    text: 'last update: ' + new Date(parseInt(cmcData[ticker[t]]['last_updated']) * 1000).toLocaleDateString("en-US", dateOptions)
                },
                url: 'https://coinmarketcap.com/currencies/' + cmcData[ticker[t]]['id']
            }
        });
    }
}

function formatCurrency(value, currency, digits) {
    var locale;

    switch (currency) {
        case 'EUR':
            locale = 'de-DE';
            break;
        case 'USD':
            locale = 'en-US';
            break;
    }

    if (formatter[currency + '' + digits] === undefined) {
        formatter[currency + '' + digits] = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: digits
        });
    }

    return formatter[currency + '' + digits].format(value);
}