var pdfreader = require("pdfreader");

var fs = require('fs');

var rows = {}; // indexed by y-position

function printRows() {
    Object.keys(rows) // => array of y-positions (type: float)
        .sort((y1, y2) => parseFloat(y1) - parseFloat(y2)) // sort float positions
        .forEach((y) => console.log((rows[y] || []).join("")));
}

var m = false;
var retornoPdf = "(A) + (B);Produção da Equipe;[(A) + (B)] / (D);(E) + (F) + (G) + (H);BDI:23,01%;Preço Unitário Total\n";
var posAnt = 0;
var lerDescricao = false;
var controle = false;
var descricao = "";
var vcont = 0;
var page = "";

lerArquivo();

function lerArquivo() {
    new pdfreader.PdfReader().parseFileItems(
        "/home/robertof/Downloads/poc.pdf",
        function (err, item) {

            try {
                if (!item || item.page) {
                    // end of file, or page
                    printRows();
                    console.log("PAGE:", item.page);
                    rows = {}; // clear rows for next page
                    m = false;
                    page = item.page;
                } else if (item.text) {

                    if(m === true){
                        retornoPdf += item.text + ";";
                        m = false;
                    }

                    if(item.text === "Custo Direto Total (E) + (F) + (G) + (H):"){
                        m = true;
                    }else if(item.text === "BDI:23,01%"){
                        m = true;
                    }else if(item.text === "Preço Unitário Total"){
                        m = true;
                        retornoPdf += "\n";
                    }else if(item.text === "Custo Horário da Execução (A) + (B)"){
                        m = true;
                    }else if(item.text === "(D) Produção da Equipe"){
                        m = true;    
                    }else if(item.text === "(E) Custo Unitário da Execução [(A) + (B)] / (D)"){
                        m = true;
                    }
                }
            } catch (erro) {
                gravaArquivo()
            }
        }
    );
}

function gravaArquivo() {

    retornoPdf = retornoPdf.replace(/"(G)Serviços;Código;Unid.;Consumo;Custo Unitário;"/g, "");

    console.log("Vai gravar arquivo.");
    fs.writeFile("resultado_mais_informacoes.csv", retornoPdf, function (err) {

        if (err) {

            return console.log(err);

        }

    });
}