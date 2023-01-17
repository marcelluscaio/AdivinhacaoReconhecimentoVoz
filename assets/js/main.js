const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

const recognition = new SpeechRecognition();
recognition.lang = 'pt-Br';
recognition.continuous = false;
recognition.interimResults = false;
recognition.maxAlternatives = 1;
recognition.start();

recognition.onresult = (e) => {
  const result = e.results[0][0].transcript;
  console.log(`Result received: ${result}.`);
}

recognition.onend = () => {
   recognition.start()
}


//Oxford
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