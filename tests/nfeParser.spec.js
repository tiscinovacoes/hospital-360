/**
 * Testes Unitários do Parser de XML da NF-e 4.0 com Leitura de Rastreabilidade <rastro>
 */

import assert from 'node:assert/strict';
import { NfeParser } from '../nucleo/src/lib/estoque/nfeParser.ts';

console.log('🧪 Iniciando testes do Parser XML de NF-e 4.0...');

const XML_NFE_EXEMPLO = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe50260901234567000199550010000412801123456789" versao="4.00">
      <ide>
        <nNF>41280</nNF>
        <serie>1</serie>
        <dhEmi>2026-09-23T14:30:00-04:00</dhEmi>
      </ide>
      <emit>
        <CNPJ>01234567000199</CNPJ>
        <xNome>DISTRIBUIDORA FARMACEUTICA SUL MATOGROSSENSE LTDA</xNome>
      </emit>
      <dest>
        <CNPJ>03152678000140</CNPJ>
        <xNome>MUNICIPIO DE ITAQUIRAI - FUNDO MUNICIPAL DE SAUDE</xNome>
      </dest>
      <total>
        <ICMSTot>
          <vNF>15420.50</vNF>
        </ICMSTot>
      </total>
      <det nItem="1">
        <prod>
          <cProd>MED-AMO-01</cProd>
          <xProd>AMOXICILINA + CLAVULANATO DE POTASSIO 500/125MG CX C/ 30 COMP</xProd>
          <NCM>30041019</NCM>
          <uCom>CX</uCom>
          <qCom>150.0000</qCom>
          <vUnCom>42.5000</vUnCom>
          <vProd>6375.00</vProd>
          <rastro>
            <nLote>LT-AMO-2026-NFE1</nLote>
            <qLote>150.0000</qLote>
            <dFab>2026-01-10</dFab>
            <dVal>2027-01-10</dVal>
          </rastro>
        </prod>
      </det>
      <det nItem="2">
        <prod>
          <cProd>MED-DIP-02</cProd>
          <xProd>DIPIRONA SODICA 500MG COMPRIMIDO CX C/ 100 COMP</xProd>
          <NCM>30049099</NCM>
          <uCom>CX</uCom>
          <qCom>500.0000</qCom>
          <vUnCom>18.0910</vUnCom>
          <vProd>9045.50</vProd>
          <rastro>
            <nLote>LT-DIP-2026-NFE2</nLote>
            <qLote>500.0000</qLote>
            <dFab>2026-02-01</dFab>
            <dVal>2028-02-01</dVal>
          </rastro>
        </prod>
      </det>
    </infNFe>
  </NFe>
</nfeProc>`;

const nfe = NfeParser.parseNfeXml(XML_NFE_EXEMPLO);

// Teste 1: Chave de acesso e dados do cabeçalho
assert.equal(nfe.chaveAcesso, '50260901234567000199550010000412801123456789');
assert.equal(nfe.numero, '41280');
assert.equal(nfe.serie, '1');
assert.equal(nfe.emitenteCnpj, '01234567000199');
assert.equal(nfe.emitenteNome, 'DISTRIBUIDORA FARMACEUTICA SUL MATOGROSSENSE LTDA');
assert.equal(nfe.valorTotal, 15420.50);
console.log('✅ 1. Cabeçalho e chave de 44 dígitos extraídos com sucesso.');

// Teste 2: Itens e leitura do bloco <rastro>
assert.equal(nfe.itens.length, 2);

const item1 = nfe.itens[0];
assert.equal(item1.cProd, 'MED-AMO-01');
assert.equal(item1.uCom, 'CX');
assert.equal(item1.qCom, 150);
assert.equal(item1.rastro.length, 1);
assert.equal(item1.rastro[0].nLote, 'LT-AMO-2026-NFE1');
assert.equal(item1.rastro[0].dVal, '2027-01-10');
assert.equal(item1.rastro[0].dFab, '2026-01-10');
console.log('✅ 2. Item 1 e bloco <rastro> de medicamento extraídos com sucesso.');

const item2 = nfe.itens[1];
assert.equal(item2.cProd, 'MED-DIP-02');
assert.equal(item2.qCom, 500);
assert.equal(item2.rastro[0].nLote, 'LT-DIP-2026-NFE2');
assert.equal(item2.rastro[0].dVal, '2028-02-01');
console.log('✅ 3. Item 2 e rastreabilidade extraídos com sucesso.');

console.log('🎉 Todos os testes do parser NF-e 4.0 concluídos com sucesso!');
