var fs = require('fs');

var PDFParser = require('pdf2json');

var pdfCaminho = '/home/robertof/Downloads/poc.pdf';

if (fs.existsSync(pdfCaminho)) {

    var pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", function (errData) {

        console.error(errData.parserError)

    });

    pdfParser.on("pdfParser_dataReady", function (pdfData) {

        var retornoHtml = "";



        pdfData.formImage.Pages.forEach(function (page, index) {

            retornoHtml += "<p>Pagina " + (parseInt(index) + 1) + "</p>";

            var y = 0;
            var m = false;

            page.Texts.forEach(function (text, index) {

                if (index == 0) {

                    y = text.y;

                }

                text.R.forEach(function (t) {

                    if (text.y !== y) {

                        retornoHtml += "<br/>";

                    }

                    retornoHtml += decodeURIComponent(t.T);

                });

                y = text.y;

            });

            retornoHtml += "</p>";

        });



        fs.writeFile("resultado.html", retornoHtml, function (err) {

            if (err) {

                return console.log(err);

            }

        });

    });




    pdfParser.loadPDF(pdfCaminho);

} else {

    console.log('Arquivo não localizado');

}