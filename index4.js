var pdfreader = require("pdfreader");

new pdfreader.PdfReader().parseFileItems("/home/robertof/Downloads/poc.pdf", function (err, item) {
    if (err) callback(err);
    else if (!item) callback();
    else if (item.text) console.log(item.text);
  });