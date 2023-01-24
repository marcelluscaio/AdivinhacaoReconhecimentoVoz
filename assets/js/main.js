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


/* let erro = false; */

//Speech recognition
/* const SpeechGrammarList = window.SpeechGrammarList || webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
recognition.continuous = false;
 */
window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'pt-BR';

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

const reiniciaJogo = () => {
   etapaJogo = 'inicio';
   instrucao.innerText = 'Você vai controlar tudo com a sua voz. Se o computador não entender seu número, coloque "zero" na frente, por exemplo "zero zero" ou "zero treze". Diga "Entendi" para continuar';
   [numInicial, numFinal, qtdChances, campoChute].forEach(elemento => elemento.innerText = '?');
   [numInicialInteiro, numFinalInteiro, ultimaTentativa, penultimaTentativa].forEach(elemento => elemento = undefined);
   arrayChutes = [];
/*    numInicial.innerText = '?';
   numFinal.innerText = '?';
   qtdChances.innerText = '?';
   campoChute.innerText = '?'; */
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
   condicao: (palavra) => isNumber(palavra),
   acao: (palavra) => 
         {
            numFinalInteiro = corrigeNumeros(palavra);
            numFinal.innerText = numFinalInteiro
         },
   instrucao: 'Quantas chances para adivinhar você quer?',
   proximaEtapa: 'chances'
   },
   {etapaJogo: 'chances',
   condicao: (palavra) => isNumber(palavra),
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
   instrucao: '',
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

recognition.start();
recognition.onresult = (e) => {
  const result = e.results[0][0].transcript;
  engrenagemJogo(etapaJogo, result);
   /* if(result ==='reiniciar'){
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
   } */
}

recognition.onend = () => {
   recognition.start()
}

const corrigeNumeros = (palavra) => {
   for(numero in numeros){
      if(palavra === numero){
         palavra = numeros[numero];   
      }         
   }
   return parseInt(palavra);
}

const isNumber = (value) => {
   return !isNaN(corrigeNumeros(value));
}

const sorteiaNumero = () => {
   return numeroSorteado = Math.floor((Math.random()*((numFinalInteiro+1)-numInicialInteiro))+numInicialInteiro);
   //tirar return?
}

const chuteEValido = (palavra) => {
   const palavraCorrigida = corrigeNumeros(palavra);
   let valido = true;
   let mensagem = '';
   errosChute.forEach(tipoDeErro =>{
      if(tipoDeErro.naoEValido(palavraCorrigida)){
         mensagem = tipoDeErro.mensagem;
         valido = false;
      }
   });
   if(mensagem) instrucao.innerText = mensagem; 
   return valido;
}

function mostraChuteNaTela(palavra){
   campoChute.innerText = palavra;
};

const acertou = (palavra) => {
   return palavra === numeroSorteado
}

const ganhaJogo = () => {
   instrucao.innerText = "Você venceu! Fale 'Reiniciar' para jogar de novo";
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
]




/*
function comparaChute(){
      
      else if(tentativas === ""){
         mensagemResultado.classList.remove("escondido");
         let diferencaPositiva = Math.sign(chuteValor-numeroSorteado)===1 ? chuteValor-numeroSorteado : numeroSorteado-chuteValor;
        
        
         if(diferencaPositiva<(escala/4)){
            mensagemResultado.innerHTML = `Primeira tentativa e já está quente! Tente de novo. Você tem mais ${qtdChancesValor} chances.`;         
         } 
         
         
         else{
            mensagemResultado.innerHTML = `Está um pouco longe do seu alvo. Mas essa é só a primeira tentativa! Tente de novo. Você tem mais ${qtdChancesValor} chances.`; 
         }


         tentativas = chuteValor;
      } 
      
      
      
      else if((tentativas<numeroSorteado && chuteValor<numeroSorteado)||(tentativas>numeroSorteado && chuteValor>numeroSorteado)){
         mensagemResultado.classList.remove("escondido");
         let diferencaPositivaAntigo = Math.sign(tentativas-numeroSorteado)===1 ? tentativas-numeroSorteado : numeroSorteado-tentativas;
         let diferencaPositivaNovo = Math.sign(chuteValor-numeroSorteado)===1 ? chuteValor-numeroSorteado : numeroSorteado-chuteValor;
         
         
         let frioOuQuente = diferencaPositivaNovo<(escala/4) ? "quente" : "frio";


         if(diferencaPositivaAntigo>diferencaPositivaNovo){
            let mensagem = frioOuQuente ==="quente"? ", cada vez mais quente" : ", mas ainda está frio";
            mensagemResultado.innerHTML = `Está mais perto do seu alvo${mensagem}! Esse é o caminho. Tente de novo. Você tem mais ${qtdChancesValor} chances.`;
         } else{
            let mensagem = frioOuQuente ==="quente"? ", mas ainda está quente! Não desanima." : ". Não desanima.";
            mensagemResultado.innerHTML = `Esfriou! Agora você está mais longe do seu alvo${mensagem} Tente de novo. Você tem mais ${qtdChancesValor} chances.`;
         }
         tentativas = chuteValor;
      }  else{
         mensagemResultado.classList.remove("escondido"); 
         let diferencaPositivaNovo = Math.sign(chuteValor-numeroSorteado)===1 ? chuteValor-numeroSorteado : numeroSorteado-chuteValor;
         let frioOuQuente = diferencaPositivaNovo<(escala/4) ? "quente" : "frio"; 
         let mensagem = frioOuQuente ==="quente"? ", e está bem perto!" : ", mas foi longe demais. Volte alguns números.";       
         mensagemResultado.innerHTML = `Você passou pelo seu alvo${mensagem} O número sorteado está entre este chute e o anterior. Você tem mais ${qtdChancesValor} chances.`;
         tentativas = chuteValor;
      }
   }   
}

function validaNumeros(){
   let numInicialValor = numInicial.value;
   let numFinalValor = numFinal.value;
   let qtdChancesValor = qtdChances.value;
   let mensagemErro = document.querySelector("#mensagemErro");   
   if(numInicialValor == "" || numFinalValor == "" || qtdChancesValor == ""){
      mensagemErro.classList.remove("escondido");
      mensagemErro.innerHTML = "Preencha todos os campos";
      erro=true;
   } else if(Number.isInteger(parseFloat(numInicialValor)) == false || Number.isInteger(parseFloat(numFinalValor)) == false || Number.isInteger(parseFloat(qtdChancesValor)) == false){
      mensagemErro.classList.remove("escondido");
      mensagemErro.innerHTML = "Somente números inteiros";
      erro=true;
   } else if(parseInt(numFinalValor)<parseInt(numInicialValor)){
      mensagemErro.classList.remove("escondido");
      mensagemErro.innerHTML = "O número final deve ser maior que o número inicial";
      erro=true;
   } else if(parseInt(numFinalValor)-parseInt(numInicialValor)<=parseInt(qtdChancesValor)*3){
      mensagemErro.classList.remove("escondido");
      mensagemErro.innerHTML = "Assim fica fácil, fera! O número final deve ser maior que a soma do número inicial com o triplo da quantidade de chances";
      erro=true;
   }   
}

*/



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