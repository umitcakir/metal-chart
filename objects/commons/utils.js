var config = require('../../config.json');
var crypto = require('crypto');
var request = require('request');
var messages = require('../commons/messages');
var utils = require('../commons/utils');
var path = require("path");
var fs = require('fs');

module.exports = {
    generateToken: function () {
        var token = crypto.randomBytes(64).toString('hex');
        return token;
    },
    requestPage: function (url, callback, error, attr) {
        var l = attr;
        request(url, {timeout: 60000}, function (error, response, body) {
            // console.log(error);
            if (error) {
                callback(null,error,l);
            }
            else {
                if (l == undefined)
                    callback(body);
                else
                    callback(body,error,l);
            }
        });
    },
    isExistInJson: function (json, key, value) {
        var state = false;

        for (let obj of json) {
            if (obj[key] == value)
                state = true;
        }
        return state;
    },
    getFromJsonArray: function (json, key, value) {
        for (let obj of json) {
            if (obj[key] == value)
                return obj;
        }
    },
    formatDate: function (date, fstr, utc) {
        utc = utc ? 'getUTC' : 'get';
        return fstr.replace(/%[YmdHMS]/g, function (m) {
            switch (m) {
                case '%Y':
                    return date[utc + 'FullYear']();
                case '%m':
                    m = 1 + date[utc + 'Month']();
                    break;
                case '%d':
                    m = date[utc + 'Date']();
                    break;
                case '%H':
                    m = date[utc + 'Hours']();
                    break;
                case '%M':
                    m = date[utc + 'Minutes']();
                    break;
                case '%S':
                    m = date[utc + 'Seconds']();
                    break;
                default:
                    return m.slice(1);
            }
            return ('0' + m).slice(-2);
        });
    },
    getLatestDate: function (xs) {
        if (xs.length) {
            return xs.reduce((m, v, i) => (v.createDate > m.createDate) && i ? v : m).createDate;
        }
    },
    getFirstDate: function (xs) {
        if (xs.length) {
            return xs.reduce((m, v, i) => (v.createDate < m.createDate) && i ? v : m).createDate;
        }
    },
    sortByProperty: function (property) {
        return function (x, y) {
            return ((x[property] === y[property]) ? 0 : ((x[property] > y[property]) ? 1 : -1));
        };
    },
    convertMapToJSON: function (map) {
        // let obj = Object.create(null);
        // for (let [k,v] of map) {
        //     obj[k] = v;
        // }
        // return obj;

        var json = [];

        var keys = Array.from(map.keys());
        for (let obj of keys) {
            // console.log(obj + map.get(obj));
            json.push({user: obj, counter: map.get(obj)});
        }
        return json;
    },
    getDates: function (startDate, endDate) {
        var dates = [],
            currentDate = startDate,
            addDays = function (days) {
                var date = new Date(this.valueOf());
                date.setDate(date.getDate() + days);
                return date;
            };
        while (currentDate <= endDate) {
            dates.push(currentDate);
            currentDate = addDays.call(currentDate, 1);
        }
        return dates;
    },
    getValueAsArrayFromJson: function(json,key,converttodate,converttonumber)
    {
        if(converttodate==undefined)
            converttodate = false;

        var tmp = [];
        for (let obj of json) {
            if(converttodate)
            {
                var d = new Date(Date.parse(obj[key]));
                tmp.push(d.getTime());
            }
            else if(converttonumber)
            {
                // console.log('before:',obj[key] );
                tmp.push(parseFloat(obj[key]));
                // console.log('after:',parseFloat(obj[key]));
            }
            else
            {
                tmp.push(obj[key]);
            }
        }
        // console.log(tmp);
        return tmp;
    }
};