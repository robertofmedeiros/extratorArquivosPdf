const argumento1 = process.argv.slice(2);
const argumento2 = process.argv.slice(3);
const [arquivo] = argumento1;
const [arquivoDestino] = argumento2;

var pdfreader = require("pdfreader");

var fs = require('fs');

var rows = {}; // indexed by y-position

function printRows() {
    Object.keys(rows) // => array of y-positions (type: float)
        .sort((y1, y2) => parseFloat(y1) - parseFloat(y2)) // sort float positions
        .forEach((y) => console.log((rows[y] || []).join("")));
}

var m = false;
var retornoPdf = "";
var posAnt = 0;
var lerDescricao = false;
var controle = false;
var descricao = "";
var vcont = 0;
var idComposicao;

lerArquivo(arquivo, arquivoDestino);

function lerArquivo(arquivoPdf, arquivoDestino) {
    new pdfreader.PdfReader().parseFileItems(
        arquivoPdf,
        function (err, item) {

            try {
                if (!item || item.page) {
                    // end of file, or page
                    printRows();
                    console.log("PAGE:", item.page);
                    rows = {}; // clear rows for next page
                } else if (item.text) {

                    if (item.text === '(B)Mão-de-Obra') {
                        m = true;
                    } else if (item.text === '(B)Total:') {
                        m = false;
                        lerDescricao = false;
                        controle = false;
                        vcont = 0;
                        retornoPdf += '\n';
                    }else if(item.text.indexOf("Serviço:") > -1){
                        idComposicao = item.text.replace("   ", ";");
                    }

                    if (m === true) {

                        // if(posAnt > 0 && posAnt !== item.y && controle === false){
                        //     retornoPdf += "\n";
                        //     posAnt = item.y;
                        // }else{
                        //     posAnt = item.y;
                        // }

                        if(vcont === 7 && controle === false){
                            lerDescricao = true;
                            vcont = 0;
                        }

                        if(vcont === 6 && controle === true){
                            lerDescricao = true;
                            vcont = 0;
                        }

                        if (item.text === 'MOED-') {
                            retornoPdf += "\n" + idComposicao + descricao + ";" + item.text;
                            lerDescricao = false;
                            controle = true;
                            descricao = "";
                            vcont = 0;
                        }else{

                            if(lerDescricao === true){
                                descricao +=  item.text + " ";
                            }else{
                                retornoPdf += item.text + ";";
                                vcont++;
                            }
                        }
                    }
                    // accumulate text items into rows object, per line
                    //(rows[item.y] = rows[item.y] || []).push(item.text);
                }
            } catch (erro) {
                gravaArquivo(arquivoDestino)
            }
        }
    );
}

function gravaArquivo(arquivoDestino) {

    retornoPdf = retornoPdf.replace(/"(G)Serviços;Código;Unid.;Consumo;Custo Unitário;"/g, "");

    console.log("Vai gravar arquivo.");
    fs.writeFile(arquivoDestino, retornoPdf, function (err) {

        if (err) {

            return console.log(err);

        }

    });
}