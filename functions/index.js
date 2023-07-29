const functions = require("firebase-functions");

exports.InitiateTransactionApi = functions.https.onRequest(async (req, res) => {
  const https = require("https");
  /*
   * import checksum generation utility
   * You can get this utility from https://developer.paytm.com/docs/checksum/
   */

  var mid;
  var mkey;
  const amount=req.query.amt;
  const orderId=req.query.oid;
  const PaytmChecksum = require('paytmchecksum');

  var paytmParams = {};

  paytmParams.body = {
    requestType: "Payment",
    mid: mid,
    "websiteName": "WEBSTAGING",
    orderId: orderId,
    "callbackUrl": 'https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID= ${orderId}',
    txnAmount: {
      value: amount,
      currency: "INR",
    },
    userInfo: {
      custId: "CUST_001",
    },
  };

  /*
   * Generate checksum by parameters we have in body
   * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
   */
  PaytmChecksum.generateSignature(
    JSON.stringify(paytmParams.body),
    mkey
  ).then(function (checksum) {
    paytmParams.head = {
      signature: checksum,
    };

    var post_data = JSON.stringify(paytmParams);

    var options = {
      /* for Staging */
      hostname: 'securegw-stage.paytm.in' /* for Production */, // hostname: 'securegw.paytm.in',

      port: 442,
      path: "/theia/api/v1/initiateTransaction?mid=${mid}&orderId=${orderId}",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": post_data.length,
      },
    };

    var response = "";
    var post_req = https.request(options, function (post_res) {
      post_res.on("data", function (chunk) {
        response += chunk;
      });

      post_res.on("end", function () {
        res.json({Response: response,merchantId:mid})
      });
    });

    post_req.write(post_data);
    post_req.end();
  });
});
