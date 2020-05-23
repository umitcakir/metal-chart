'use strict';
var messages = require('../commons/messages');
var utils = require('../commons/utils');
var config = require('../../config.json');
var mysql = require('mysql');
var con = mysql.createConnection(config.database);

con.connect(function (err) {
    if (err) throw err;
    console.log("Mysql Connected!");
});


var counter = 0;

module.exports = {
    getConfig: function (req, res) {
        messages.printConsoleMessage(color.FgBlue, 'Config method called');
        let dummy = config.marketConfig;
        res.json(dummy);
    },

    getTime: function (req, res) {
        Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
        if(!Date.now) Date.now = function() { return new Date(); }
        Date.time = function() { return Date.now().getUnixTime(); }


         var milli = new Date().getTime();
        //var milli = new Date().UTC.getUnixTime();
        console.log(milli);
        var timeWithoutMilli = Math.floor(milli / 1000);
        res.status(200).send(timeWithoutMilli.toString());
    },

    getSymbols: function (req, res) {
        var symbol = req.query.symbol;

        if (symbol.indexOf(':') >= 0)
            symbol = symbol.substr(symbol.indexOf(':') + 1, symbol.length)

        for (let obj of config.definitions) {
            if (obj.name == symbol) {
                res.json(obj);
                break;
            }
        }
    },
    getSearch: function (req, res) {
        var query = req.query.query.trim().toLowerCase();
        var limit = req.query.limit;
        var type = req.query.type;
        var exchange = req.query.exchange;

        var result = [];

        for (let obj of config.symbols) {
            if (result.length >= parseInt(limit))
                continue;

            if (
                obj.symbol.toLowerCase().includes(query) ||
                obj.full_name.toLowerCase().includes(query) ||
                obj.description.toLowerCase().includes(query)
            ) {
                result.push(obj);
            }
        }

        res.json(result);
    },
    getHistory: function (req, res) {
        var symbol = req.query.symbol;
        var from = req.query.from;

        if(from.length<=10)
        {
            from  = parseInt(from) * 1000;
        }

        var to = req.query.to;

        if(to.length<=10)
        {
            to  = parseInt(to)* 1000;
        }

        var resolution = req.query.resolution;

        var resulotion_edit = 1;

        if (resolution == 'D') {
            resulotion_edit = 1;
        }
        else if (resolution == '1D') {

        }
        else if (resolution == '1') {
            resulotion_edit = 1;
        }
        else if (resolution == '5') {

        }
        else if (resolution == '15') {

        }
        else if (resolution == '30') {

        }
        else if (resolution == '60') {

        }

        //console.log(resolution);
        let query = "select symbol,UNIX_TIMESTAMP(concat(t3.tim,':00'))  as 'time',t3.uid,t3.open,t3.high,t3.low,t3.val as 'close', t3.vol from " +
            "(select * from (select sym as 'symbol', max(uid) as 'ind', date_format(date_sub(tm,INTERVAL (MINUTE(tm) % "+resolution+") MINUTE), '%Y-%m-%d %H:%i') " +
            "as tim, val as 'open', MAX(val) AS high, MIN(val) AS low, sum(size) as 'vol' from tick where sym like '"+symbol+"' AND uid between "+from+" and "+to+"" +
            " group by tim order by ind desc, tm desc) as tLeft left join (select * from (select * from tick where sym like '"+symbol+"' order by uid desc)" +
            " as t4 group by tm) as tRight on tLeft.ind=tRight.uid and tleft.symbol=tright.sym) as t3 ";

        console.log(query);

        let time = [];
        let open = [];
        let close = [];
        let high = [];
        let low = [];
        let volume = [];

        con.query(query, function (err, result) {
            if (err) {
                messages.printConsoleMessage(m.FgRed, "Database Error ! " + err);
            }
            else {
                open = utils.getValueAsArrayFromJson(result, "open", false, true).reverse();
                time = utils.getValueAsArrayFromJson(result, "time", false, false).reverse();

                var tmptimeplus3hour = [];

                for (let obj of time) {
                    tmptimeplus3hour.push(obj + 10800);
                }
                time = tmptimeplus3hour;

                // var tmptime = [];
                // for (let obj of time) {
                //     //console.log(parseInt(obj)/1000);
                //     tmptime.push(Math.trunc(parseInt(obj)/1000));
                // }
                // time = tmptime;
                // //console.log(tmptime);
                high = utils.getValueAsArrayFromJson(result, "high", false, true).reverse();
                low = utils.getValueAsArrayFromJson(result, "low", false, true).reverse();
                close = utils.getValueAsArrayFromJson(result, "close", false, true).reverse();


                volume = utils.getValueAsArrayFromJson(result, "vol", false, false).reverse();
            }
            var status = "ok";

            var tmp = {
                "t": time,
                "o": open,
                "h": high,
                "l": low,
                "c": close,
                "v": volume,
                "s": status
            };

            //console.log(result);
            if (result == undefined || result.length <= 0) {
                status = "no_data";
                res.json({"s": status});
            }
            else {
                res.json(tmp);
            }
        });
        // var dummy = {
        //     "t": [1509667200, 1509926400, 1510012800, 1510185600, 1510272000, 1510531200, 1510617600, 1510704000, 1510790400, 1510876800, 1511136000, 1511222400, 1511308800, 1511481600, 1511740800, 1511827200, 1511913600, 1512000000, 1512086400, 1512345600, 1512432000, 1512518400, 1512604800, 1512691200, 1512950400, 1513036800, 1513123200, 1513209600, 1513296000, 1513555200, 1513641600, 1513728000, 1513814400, 1513900800, 1514246400, 1514332800, 1514419200, 1514505600, 1514851200, 1514937600, 1515024000, 1515110400, 1515369600, 1515456000, 1515542400, 1515628800, 1515715200, 1516060800, 1516147200, 1516233600, 1516320000, 1516579200, 1516665600, 1516752000, 1516838400, 1516924800, 1517184000, 1517270400, 1517356800, 1517443200, 1517529600, 1517788800, 1517875200, 1517961600, 1518048000, 1518134400, 1518393600, 1518480000, 1518566400, 1518652800, 1518739200, 1519084800, 1519171200, 1519257600, 1519344000],
        //     "o": [174, 172.365, 173.91, 175.11, 175.11, 173.5, 173.04, 169.97, 171.18, 171.04, 170.29, 170.78, 173.36, 175.1, 175.05, 174.3, 172.63, 170.43, 169.95, 172.48, 169.06, 167.5, 169.03, 170.49, 169.2, 172.15, 172.5, 172.4, 173.63, 174.88, 175.03, 174.87, 174.17, 174.68, 170.8, 170.1, 171, 170.52, 170.16, 172.53, 172.54, 173.44, 174.35, 174.55, 173.16, 174.59, 176.18, 177.9, 176.15, 179.37, 178.61, 177.3, 177.3, 177.25, 174.505, 172, 170.16, 165.525, 166.87, 167.165, 166, 159.1, 154.83, 163.085, 160.29, 157.07, 158.5, 161.95, 163.045, 169.79, 172.36, 172.05, 172.83, 171.8, 173.67],
        //     "h": [174.26, 174.99, 175.25, 176.095, 175.38, 174.5, 173.48, 170.3197, 171.87, 171.39, 170.56, 173.7, 175, 175.5, 175.08, 174.87, 172.92, 172.14, 171.67, 172.62, 171.52, 170.2047, 170.44, 171, 172.89, 172.39, 173.54, 173.13, 174.17, 177.2, 175.39, 175.42, 176.02, 175.424, 171.47, 170.78, 171.85, 170.59, 172.3, 174.55, 173.47, 175.37, 175.61, 175.06, 174.3, 175.4886, 177.36, 179.39, 179.25, 180.1, 179.58, 177.78, 179.44, 177.3, 174.95, 172, 170.16, 167.37, 168.4417, 168.62, 166.8, 163.88, 163.72, 163.4, 161, 157.89, 163.89, 164.75, 167.54, 173.09, 174.82, 174.26, 174.12, 173.95, 175.65],
        //     "l": [171.12, 171.72, 173.6, 173.14, 174.27, 173.4, 171.18, 168.38, 170.3, 169.64, 169.56, 170.78, 173.05, 174.6459, 173.34, 171.86, 167.16, 168.44, 168.5, 169.63, 168.4, 166.46, 168.91, 168.82, 168.79, 171.461, 172, 171.65, 172.46, 174.86, 174.09, 173.25, 174.1, 174.5, 169.679, 169.71, 170.48, 169.22, 169.26, 171.96, 172.08, 173.05, 173.93, 173.41, 173, 174.49, 175.65, 176.14, 175.07, 178.25, 177.41, 176.6016, 176.82, 173.2, 170.53, 170.06, 167.07, 164.7, 166.5, 166.76, 160.1, 156, 154, 159.0685, 155.03, 150.24, 157.51, 161.65, 162.88, 169, 171.77, 171.42, 171.01, 171.71, 173.54],
        //     "c": [172.5, 174.25, 174.81, 175.88, 174.67, 173.97, 171.34, 169.08, 171.1, 170.15, 169.98, 173.14, 174.96, 174.97, 174.09, 173.07, 169.48, 171.85, 171.05, 169.8, 169.64, 169.01, 169.452, 169.37, 172.67, 171.7, 172.27, 172.22, 173.87, 176.42, 174.54, 174.35, 175.01, 175.01, 170.57, 170.6, 171.08, 169.23, 172.26, 172.23, 173.03, 175, 174.35, 174.33, 174.29, 175.28, 177.09, 176.19, 179.1, 179.26, 178.46, 177, 177.04, 174.22, 171.11, 171.51, 167.96, 166.97, 167.43, 167.78, 160.37, 157.49, 163.03, 159.54, 155.32, 155.97, 162.71, 164.34, 167.37, 172.99, 172.43, 171.85, 171.07, 172.6, 175.555],
        //     "v": [58683826, 34242566, 23910914, 28636531, 25061183, 16828025, 23588451, 28702351, 23497326, 21665811, 15974387, 24875471, 24997274, 14026519, 20536313, 25468442, 40788324, 40172368, 39590080, 32115052, 27008428, 28224357, 24469613, 23096872, 33092051, 18945457, 23142242, 20219307, 37054632, 28831533, 27078872, 23000392, 20356826, 16052615, 32968167, 21672062, 15997739, 25643711, 25048048, 28819653, 22211345, 23016177, 20134092, 21262614, 23589129, 17523256, 25039531, 29159005, 32752734, 30234512, 30827809, 26023683, 31702531, 50562257, 39661804, 37121805, 48434424, 45137026, 30984099, 38099665, 85436075, 66090446, 66625484, 50852130, 49594129, 66723743, 60560145, 32104756, 39669178, 50609595, 39638793, 33531012, 35833514, 30504116, 33329232],
        //     "s": "ok"
        // };
    }
};