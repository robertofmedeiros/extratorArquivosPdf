const argumento1 = process.argv.slice(2);
const argumento2 = process.argv.slice(3);
const [arquivo] = argumento1;
const [arquivoDestino] = argumento2;

var pdfreader = require("pdfreader");

var fs = require('fs');

var m = false;
var retornoPdf = "";
var descricao = "";
var unidade = "";
var pula = false;
var observacao = "";
var producaoEquipamento = "";
var lerProducaoEquipamento = false;

lerArquivo(arquivo, arquivoDestino);

//"/home/robertof/Downloads/poc.pdf"

function lerArquivo(arquivoPdf, arquivoDestino) {
    new pdfreader.PdfReader().parseFileItems(
        arquivoPdf,
        function (err, item) {

            try {
                if (!item || item.page) {

                    console.log("PAGE:", item.page);

                    if(descricao != ""){
                        retornoPdf += descricao.replace("\n", "") + ";" + unidade + ";" + observacao + ";" + producaoEquipamento + "\n";
                    }
                    m = false;
                    unidade = "";
                    pula = false;
                    descricao = "";
                    observacao = "";
                    servico = "";
                } else if (item.text) {
                    
                    if(lerProducaoEquipamento){
                        lerProducaoEquipamento = false;
                        producaoEquipamento = item.text;
                    }

                    if(item.text.indexOf("Serviço:") > -1){
                        console.log(item.text);
                        descricao += item.text.replace("   ", ";");
                        m = true;
                    }else if(item.text.indexOf("Unidade:") > -1){
                        console.log(item.text);
                        unidade= item.text;
                        pula = true;
                    }else if(item.text.indexOf("Observações:") > -1){
                        console.log(item.text);
                        observacao = item.text;
                        m = false;
                    }else if(item.text.indexOf("(A)Equipamento") > -1){
                        m = false;
                    }else if(item.text.indexOf("(D) Produção da Equipe") > -1){
                        lerProducaoEquipamento = true;    
                    }

                    if(m == true && pula == false && item.text.indexOf("Serviço:") === -1){
                        descricao += item.text;
                    }

                    if(pula == true)
                        pula = false;
                }
            } catch (erro) {
                gravaArquivo(arquivoDestino);
            }
        }
    );
}

function gravaArquivo(arquivo) {

    console.log("Vai gravar arquivo.");
    fs.writeFile(arquivo, retornoPdf, function (err) {

        if (err) {

            return console.log(err);

        }

    });
}