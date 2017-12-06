var express = require('express');
var router = express.Router();
var path = require('path');
var secrets= require("secrets.js");
var HashJS= require('crypto-js/sha1');
var User = require('../models/users');
var Secret = require('../models/secrets');
var Admin= require('../models/admins');
var bigInt = require("big-integer");
var nonRep = require('../../PasswordPurse/routes/nonRepudiation');
var p=bigInt.zero;
var q=bigInt.zero;
var n=bigInt.zero;
var d=bigInt.zero;
var e= bigInt(65537);
var data =[];

genNRSA=function () {

    var base=bigInt(2);
    var prime=false;

    while (!prime) {
        p = bigInt.randBetween(base.pow(255), base.pow(256).subtract(1));
        prime = bigInt(p).isPrime()

    }
    prime = false;
    while (!prime) {
        q = bigInt.randBetween(base.pow(255), base.pow(256).subtract(1));
        prime = bigInt(q).isPrime()
    }
    var phi = p.subtract(1).multiply(q.subtract(1));
    n = p.multiply(q);
    d = e.modInv(phi);

    console.log("RSA TTP Generated correctly")

};

router.post('/repudiationThirdPart',function (req,res) {

    if(n===bigInt.zero){
        this.genNRSA(function () {})
    }
    else{
        nonRep.checkPayloadTTP(req.body.origin,req.body.destination,req.body.thirdpart,req.body.key,req.body.modulus,req.body.publicE,req.body.signature,function (buff) {

            if (buff === 1){

                nonRep.shareKey(req.body.origin,req.body.destination,req.body.thirdpart,d,n,e,req.body.key,function (buff2) {

                    var dat = {
                        name: req.body.origin,
                        data: buff2,
                        sharedKey: buff2.key
                    };
                    data.push(dat);
                    res.send(dat.data);
                });
            }
            else {
                res.send("ERROR")
            }
        });
    }
});


router.get('/generateTTP', function (req,res) {
    if(n===bigInt.zero){
        this.genNRSA(function () {
            res.send(1);

        })
    }
});

router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});

module.exports = router;