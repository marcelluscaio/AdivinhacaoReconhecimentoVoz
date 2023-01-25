const loader = document.querySelector("#loader");
const instrucao = document.querySelector("#instrucao");
const dica = document.querySelector("#dica");
const numInicial = document.querySelector("#menor-numero");
let numInicialInteiro;
const numFinal = document.querySelector("#maior-numero");
let numFinalInteiro;
const qtdChances = document.querySelector("#chances");
const campoChute = document.querySelector('#chute');
const listaChutesCampo = document.querySelector('#lista-chutes')
let qtdChancesValor;
let numeroSorteado;
let etapaJogo = 'inicio';
let ultimaTentativa = "";
let penultimaTentativa = "";
let arrayChutes = [];

//Speech recognition
window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'pt-BR';

const reiniciaJogo = () => {
   etapaJogo = 'inicio';
   instrucao.innerText = 'Você vai controlar tudo com a sua voz. Se o computador não entender seu número, coloque "zero" na frente, por exemplo "zero zero" ou "zero treze". Diga "Entendi" para continuar';
   [numInicial, numFinal, qtdChances, campoChute].forEach(elemento => elemento.innerText = '?');
   [numInicialInteiro, numFinalInteiro, ultimaTentativa, penultimaTentativa].forEach(elemento => elemento = undefined);
   [dica, listaChutesCampo].forEach(elemento => elemento.innerText = '');
   arrayChutes = [];
}
/* 
   COMPARAR CÓDIGO   
   numInicial.innerText = '?';
   numFinal.innerText = '?';
   qtdChances.innerText = '?';
   campoChute.innerText = '?';
*/

recognition.start();
recognition.onresult = (e) => {
   loader.style.display = 'block';
   processaResposta(e);
   
}
const processaResposta = resposta => {
   setTimeout(() => {
      const result = resposta.results[0][0].transcript;
      engrenagemJogo(etapaJogo, result);
      loader.style.display = 'none';
   }, 1000);
}

/* 
   COMPARAR CÓDIGO
   if(result ==='reiniciar'){
     etapaJogo = 'inicio';
      instrucao.innerText = 'Você vai controlar tudo com a sua voz. Siga com cuidado as instruções. Se algo der errado diga "Reiniciar". Diga "Entendi" para ir para continuar';
      numInicial.innerText = '?';
      numFinal.innerText = '?';
   } */ /* else if(etapaJogo === 'inicio' && result ==='entendi'){
      etapaJogo = 'menorNumero';
      instrucao.innerText = 'Diga o primeiro número do seu intervalo de adivinhação. Para 0 diga "zero zero" e para 1 dia "zero um"';
   } */ /* else if(etapaJogo === 'menorNumero' && isNumber(result)){
      numInicial.innerText = corrigeNumeros(result);
      etapaJogo = 'maiorNumero';
      instrucao.innerText = 'Diga o segundo número do seu intervalo de adivinhação';
   } */ /* else if(etapaJogo === 'maiorNumero' && isNumber(result)){
      numFinal.innerText = corrigeNumeros(result);
      etapaJogo = 'chances';
      instrucao.innerText = 'Quantas chances para adivinhar você quer?';
   } *//*  else if(etapaJogo === 'chances' && isNumber(result)){
      qtdChancesValor = corrigeNumeros(result);
      etapaJogo = 'confirmar';
      instrucao.innerText = 'Podemos começar o jogo? Diga "agora" para começar';
   } */ /* else if(etapaJogo === 'confirmar' && result==="agora"){
      console.log('Começar jogo')
   } 
*/

recognition.onend = () => {
   recognition.start()
}

function engrenagemJogo(etapaAtual, palavra){
   if(palavra === "reiniciar"){
      reiniciaJogo();
      return
   }
   const objetoEtapa = etapasJogo.filter(elemento => elemento.etapaJogo === etapaAtual);
   console.log(objetoEtapa);
   if( objetoEtapa[0].condicao(palavra)){
      instrucao.innerText = objetoEtapa[0].instrucao;
      etapaJogo = objetoEtapa[0].proximaEtapa;
      if(objetoEtapa[0].acao){
         objetoEtapa[0].acao(palavra);
      };
   }
}

const etapasJogo = [
   {etapaJogo: 'inicio',
   condicao: (palavra) => palavra === 'entendi',
   acao: '',
   instrucao: 'Diga o primeiro número do seu intervalo de adivinhação. Para 0 diga "zero zero" e para 1 dia "zero um"',
   proximaEtapa: 'menorNumero'
   },
   {etapaJogo: 'menorNumero',
   condicao: (palavra) => isNumber(palavra),
   acao: (palavra) => 
         {
            numInicialInteiro = corrigeNumeros(palavra);
            numInicial.innerText = numInicialInteiro
         },
   instrucao: 'Diga o segundo número do seu intervalo de adivinhação',
   proximaEtapa: 'maiorNumero'
   },
   {etapaJogo: 'maiorNumero',
   condicao: (palavra) => isNumber(palavra) && validaNumeroMaior(palavra),
   acao: (palavra) => 
         {
            numFinalInteiro = corrigeNumeros(palavra);
            numFinal.innerText = numFinalInteiro;
         },
   instrucao: `Quantas chances para adivinhar você quer?`,
   proximaEtapa: 'chances'
   },
   {etapaJogo: 'chances',
   condicao: (palavra) => isNumber(palavra) && validaChances(palavra),
   acao: (palavra) =>
         {
            qtdChancesValor = corrigeNumeros(palavra);
            qtdChances.innerText = qtdChancesValor;
         },
   instrucao: 'Podemos começar o jogo? Diga "agora" para começar',
   proximaEtapa: 'confirmar'
   },
   {etapaJogo: 'confirmar',
   condicao: (palavra) => palavra === 'agora',
   acao: () => sorteiaNumero() ,
   instrucao: 'Pode chutar um número',
   proximaEtapa: 'jogo'
   },
   {etapaJogo: 'jogo',
   condicao: (palavra) => isNumber(palavra) && chuteEValido(palavra),
   acao: (palavra) => {
      const palavraCorrigida = corrigeNumeros(palavra);      
      mostraChuteNaTela(palavraCorrigida);
      acertou(corrigeNumeros(palavraCorrigida)) ? ganhaJogo() : processaErro(palavraCorrigida);
   },
   instrucao: '',
   proximaEtapa: 'jogo'
   },
   {etapaJogo: 'fim',
   condicao: () =>  false,
   acao: () => false,
   instrucao: '',
   proximaEtapa: 'fim'
   }
];

const isNumber = (value) => {
   return !isNaN(corrigeNumeros(value));
}

const corrigeNumeros = (palavra) => {
   for(numero in numeros){
      if(palavra === numero){
         palavra = numeros[numero];   
      }         
   }
   return parseInt(palavra);
}

const numeros = {
   'zero zero': 0,
   '00': 0,
   '01': 1,
   'um': 1,
   'dois': 2,
   'três': 3,
   'quatro': 4,
   'cinco': 5,
   'seis': 6,
   'sete': 7,
   'oito': 8,
   'nove': 9,
   'dez': 10,
   'vinte': 20
}

const validaNumeroMaior = (value) => {
   if(corrigeNumeros(value) < numInicialInteiro){
      instrucao.innerText = 'Número final deve ser maior que número inicial';
      return false
   }
      
   return true;
}

const validaChances = (value) => {
   if(corrigeNumeros(value) > Math.ceil((numFinalInteiro - numInicialInteiro) / 3)){
      instrucao.innerText = `Seu número de chances deve ser menor que ${Math.ceil((numFinalInteiro - numInicialInteiro) / 3)}, se não fica muito fácil!`;
      return false
   }
   return true
}

const sorteiaNumero = () => {
   numeroSorteado = Math.floor((Math.random()*((numFinalInteiro+1)-numInicialInteiro))+numInicialInteiro);
}

const chuteEValido = (palavra) => {
   const palavraCorrigida = corrigeNumeros(palavra);
   let valido = true;
   let mensagem = '';
   errosChute.forEach(tipoDeErro =>{
      if(tipoDeErro.naoEValido(palavraCorrigida)){
         dica.innerText = '';
         mensagem = tipoDeErro.mensagem;
         valido = false;
      }
   });
   if(mensagem) instrucao.innerText = mensagem; 
   return valido;
}

const errosChute = [
   {
      naoEValido: (palavra) => palavra<numInicialInteiro || palavra>numFinalInteiro ? true : false ,
      tipo: 'fora da escala',
      mensagem: "Esse não foi um chute muito bom. Chute dentro da escala =)",
   },
   {
      naoEValido: (palavra) => arrayChutes.includes(palavra) ? true : false ,
      tipo: 'repetido',
      mensagem: "Esse você já chutou"
   }
];

function mostraChuteNaTela(palavra){
   campoChute.innerText = palavra;
};

const acertou = (palavra) => {
   return palavra === numeroSorteado
}

const ganhaJogo = () => {
   instrucao.innerText = "Você venceu! Fale 'Reiniciar' para jogar de novo";
   dica.innerText = '';
   etapaJogo = "fim";
}

const perdeJogo = () => {
   instrucao.innerText = `Suas chances acabaram! O número era ${numeroSorteado} Fale 'Reiniciar' para jogar de novo`;
   etapaJogo = "fim";
}

const processaErro = (palavra) => {
   qtdChancesValor--;
   qtdChances.innerText = qtdChancesValor;
   penultimaTentativa = ultimaTentativa;
   ultimaTentativa = palavra;
   atualizaListaChutes(palavra);
   qtdChancesValor > 0 ? daDica(palavra) : perdeJogo();
}

const atualizaListaChutes = (palavra) =>{   
   arrayChutes.push(palavra);
   arrayChutes.sort((a,b) => a - b);
   listaChutesCampo.innerText =`${arrayChutes.map((chute, i) => i>0 ? " " + chute : chute)}`;
}

const daDica = (chute) => {
   const escala = numFinalInteiro-numInicialInteiro+1;
   const diferencaChuteAlvo = Math.abs(chute - numeroSorteado);
   const razaoEscalaChute = escala / diferencaChuteAlvo;
   const temperatura = razaoEscalaChute > 4 ? 'quente' : 'frio';
    
   let comparacaoAnterior = "";
   let comparacaoAlvo = "";
   if(arrayChutes.length > 1){
      const diferencaAnteriorChuteAlvo = Math.abs(penultimaTentativa - numeroSorteado);
      comparacaoAnterior = diferencaAnteriorChuteAlvo > diferencaChuteAlvo ? 'aproximou' : 'afastou';
      comparacaoAlvo = ((chute < numeroSorteado) && (penultimaTentativa < numeroSorteado)) || ((chute > numeroSorteado) && (penultimaTentativa > numeroSorteado)) ? 'não passou' : 'passou';
   }

   let filtroTentativas = dicas.filter(e => e.tentativas === arrayChutes.length > 1);
   let filtroTemperatura = filtroTentativas.filter(e => e.temperatura === temperatura);
   let filtroComparaAnterior = filtroTemperatura.filter(e => e.comparacaoAnterior === comparacaoAnterior);
   let filtroComparaAlvo = filtroComparaAnterior.filter(e => e.comparacaoAlvo === comparacaoAlvo || e.comparacaoAlvo === "");
   let mensagemDica = filtroComparaAlvo[0].mensagem;
    dica.innerText = mensagemDica;
}

const dicas = [
   {
      tentativas: false,
      temperatura: 'quente',
      comparacaoAnterior: '',
      comparacaoAlvo: '',
      mensagem: 'Primeira tentativa e já está quente! Tente de novo.'
   },
   {
      tentativas: false,
      temperatura: 'frio',
      comparacaoAnterior: '',
      comparacaoAlvo: '',
      mensagem:'Está um pouco longe do seu alvo. Mas essa é só a primeira tentativa! Tente de novo.'
   },
   {
      tentativas: true,
      temperatura: 'frio',
      comparacaoAnterior: 'aproximou',
      comparacaoAlvo: 'passou',
      mensagem:'Você passou do seu alvo, mas está mais perto que antes. Ainda está frio, mas eu acredito em você!'
   },
   {
      tentativas: true,
      temperatura: 'frio',
      comparacaoAnterior: 'aproximou',
      comparacaoAlvo: 'não passou',
      mensagem:'Você está mais perto que antes, mas ainda está frio! O caminho é esse!'
   },
   {
      tentativas: true,
      temperatura: 'frio',
      comparacaoAnterior: 'afastou',
      comparacaoAlvo: 'passou',
      mensagem:'Você passou pelo seu alvo, e está mais distante que antes. Está quase congelando. Tente voltar alguns números =)'
   },
   {
      tentativas: true,
      temperatura: 'frio',
      comparacaoAnterior: 'afastou',
      comparacaoAlvo: 'não passou',
      mensagem:'Você está indo na direção oposta do seu alvo. Está quase congelando. Vá para o outro lado =)'
   },
   {
      tentativas: true,
      temperatura: 'quente',
      comparacaoAnterior: 'aproximou',
      comparacaoAlvo: 'passou',
      mensagem:'Você chegou muito perto do seu alvo, mas passou batido por ele. Ainda está bem perto, continue tentando!'
   },
   {
      tentativas: true,
      temperatura: 'quente',
      comparacaoAnterior: 'aproximou',
      comparacaoAlvo: 'não passou',
      mensagem:'Você está no caminho certo, está bem perto do seu alvo! Continue assim =)'
   },
   {
      tentativas: true,
      temperatura: 'quente',
      comparacaoAnterior: 'afastou',
      comparacaoAlvo: 'passou',
      mensagem:'Você ainda está perto, mas passou direto pelo seu alvo, e está mais distante que antes. Não desanima!'
   },
   {
      tentativas: true,
      temperatura: 'quente',
      comparacaoAnterior: 'afastou',
      comparacaoAlvo: 'não passou',
      mensagem:'Você ainda está perto, mas está mais distante do seu alvo. Vá na outra direção!'
   }
];

//Regras do jogo
//if(parseInt(numFinalValor)-parseInt(numInicialValor)<=parseInt(qtdChancesValor)*3 
//Assim fica fácil, fera! O número final deve ser maior que a soma do número inicial com o triplo da quantidade de chances



//Oxford
//https://developer.oxforddictionaries.com/documentation/making-requests-to-the-api
//https://developer.oxforddictionaries.com/documentation
/* const id = 	'ef4dc1b4';
const key = '9dd942bb0687f9ca2b975fa4dfe5ba81';
const url = `https://od-api.oxforddictionaries.com/api/v2/entries/PT/example`;

(function(){
   fetch(url, headers = {"app_id": id, "app_key": key})
   .then(result => console.log(result))
})() */


//https://api.dicionario-aberto.net/index.html
/* (function(){
   fetch('https://api.dicionario-aberto.net/random')
   .then(result => result.json())
   .then(result => console.log(result.word))
})() */