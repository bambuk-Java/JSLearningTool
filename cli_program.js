const readline = require('node:readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let right = 0;
let wrong = 0;
const wrongAttempts = [];
let wrongAttemptsDetails = {};
let isEnglishToGerman = true;  

// Übersetzungstabellen für Sätze
const translations = {
  "Andeo develops mobile apps": "Andeo entwickelt mobile Apps.",
  "Andeo offers IT-services": "Andeo bietet IT-Dienstleistungen an.",
  "Andeo is located in Winterthur": "Andeo befindet sich in Winterthur.",
/*"The company was founded in 2005": "Das Unternehmen wurde 2005 gegründet.",
"Andeo specializes in web design": "Andeo ist auf Webdesign spezialisiert.",
"Andeo offers remote support": "Andeo bietet Fernsupport an.",
"Andeo helps with infrastructure": "Andeo hilft bei der Infrastruktur.",
"Their office is at Technikumstrasse": "Ihr Büro befindet sich in der Technikumstrasse.",
"Andeo creates customized solutions": "Andeo erstellt massgeschneiderte Lösungen.",
"Andeo works with Android and iOS": "Andeo arbeitet mit Android und iOS.",
"Andeo provides cloud services": "Andeo bietet Cloud-Dienste an.",
"Andeo focuses on data security": "Andeo legen Wert auf Datensicherheit.",
"Andeo maintains complex systems": "Andeo warten komplexe Systeme.",*/
};

const responses = [
  "Gut gemacht, Sie hatten keine Fehler, wollen sie nochmals das Quiz lösen?",
  "Sie hatten einen Fehler, wollen Sie diese Frage wiederholen?",
  "Wollen Sie es nochmals probieren? Sie hatten mehrere Antworten falsch. Das jetzt erstellte Set besteht nur aus diesen Antworten."
];

const translationEntries = Object.entries(translations);

// Startet das Quiz
function startQuiz() {
  
    rl.question("Möchten Sie von Englisch nach Deutsch (E) oder von Deutsch nach Englisch (D) übersetzen? \nAntworten Sie mit 'E' oder 'D': ", userInput => {
      if (userInput.toLowerCase() === 'd') {
        isEnglishToGerman = false;
        askQuestion();
      } else if (userInput.toLowerCase() === 'e') {
        isEnglishToGerman = true;
        askQuestion();
      } else {
        console.log("---------------");
        console.log("Bitte geben Sie 'E', 'e' oder 'D', 'd' ein.");
        startQuiz();
      }
    });
  
}

// Erstellt ein neues Quiz basierend auf früheren Fehlern
function restartQuiz() {
  const previousWrong = [...wrongAttempts];
  resetCounters();
  
  if (previousWrong.length > 0) {
    askQuestion(0, true);
  } else {
    askQuestion();
  }
}

// Setzt die Zähler zurück
function resetCounters() {
  wrong = 0;
  right = 0;
}

// Funktion, um den Satz mit fehlendem Wort zu generieren
function missingWordTranslation(sentence, isEnglishToGerman) {
  const translation = isEnglishToGerman ? translations[sentence] : getKeyByValue(translations, sentence);
  const words = translation.split(" ");
  const missingIndex = Math.floor(Math.random() * (words.length - 1)) + 1;
  
  const sentenceWithMissingWord = words.slice();
  sentenceWithMissingWord[missingIndex] = "_".repeat(words[missingIndex].length);

  return {
    sentence: sentenceWithMissingWord.join(" "),
    missingWord: words[missingIndex],
    index: missingIndex
  };
}

// Findet den Key in einem Objekt anhand des Werts
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

// Zeigt die Ergebnisauswertung und fragt, ob das Quiz neu gestartet werden soll
function displayResultsAndAskForRestart() {
  console.log(`Sie hatten ${right} Antworten richtig und ${wrong} falsch.`);
  console.log(`Index der falschen Versuche: ${wrongAttempts}`);
  
  const responseIndex = wrong === 0 ? 0 : wrong === 1 ? 1 : 2;
  
  rl.question(`${responses[responseIndex]} \nAntworten Sie mit y/Y, falls Sie Lust darauf haben.\n`, userInput => {
    if (userInput.toLowerCase() === 'y') {
      restartQuiz();
    } else {
      console.log("Danke für die gratis Übersetzung!");
      rl.close();
    }
  });
}

// Stellt eine Frage aus dem aktuellen Fragenpool
function askQuestion(index = 0, onlyWrongAttempts = false) {
  const questionSet = onlyWrongAttempts ? wrongAttempts : [...Array(translationEntries.length).keys()];

  if (index >= questionSet.length) {
    displayResultsAndAskForRestart();
    return;
  }

  const currentIndex = questionSet[index];
  const { sentence, translation, missingWord } = getQuestionData(currentIndex, onlyWrongAttempts);

  console.log(`Frage ${index + 1}:`);
  if (isEnglishToGerman) {
    console.log(`Satz auf Englisch: ${sentence}`);
  } else {
    console.log(`Satz auf Deutsch: ${sentence}`);
  }
  
  rl.question((isEnglishToGerman ? "Deutsch" : "Englisch") + ": " + translation + '\n', userAnswer => {
    checkAnswer(userAnswer, missingWord, currentIndex);
    askQuestion(index + 1, onlyWrongAttempts);
  });
}

// Gibt die Frage und die fehlenden Wortdaten zurück
function getQuestionData(currentIndex, onlyWrongAttempts) {
  if (onlyWrongAttempts && wrongAttemptsDetails[currentIndex]) {
    return wrongAttemptsDetails[currentIndex];
  }

  let sentence, translation;
  if (isEnglishToGerman) {
    [sentence, translation] = translationEntries[currentIndex];
  } else {
    [translation, sentence] = translationEntries[currentIndex];
  }

  const { sentence: sentenceWithMissingWord, missingWord } = missingWordTranslation(sentence, isEnglishToGerman);

  return { sentence, translation: sentenceWithMissingWord, missingWord };
}

// Überprüft die Antwort des Benutzers
function checkAnswer(userAnswer, missingWord, currentIndex) {
  if (userAnswer === missingWord) {
    console.log("Korrekt!");
    right += 1;
  } else {
    console.log("Falsch!");
    wrong += 1;
    trackWrongAttempt(currentIndex);
  }
  console.log("------------");
}

// Verfolgt falsche Versuche und speichert die Details
function trackWrongAttempt(currentIndex) {
  if (!wrongAttempts.includes(currentIndex)) {
    wrongAttempts.push(currentIndex);
    wrongAttemptsDetails[currentIndex] = getQuestionData(currentIndex, false);
  }
}

// Startet das Quiz
startQuiz();
