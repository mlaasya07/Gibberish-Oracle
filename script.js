let usedSentences = new Set();
let wordData = {};

// Load words from words.json
async function loadWords() {
  const res = await fetch('words.json');
  wordData = await res.json();
}

// Get a unique word starting with a letter, avoiding repeats within the sentence
function getWordByLetter(letter, usedWords) {
  const validLengths = [4, 5, 6, 7];
  let possibleWords = [];

  for (let length of validLengths) {
    let pool = wordData[length];
    let matches = pool.filter(word =>
      word[0].toLowerCase() === letter.toLowerCase() &&
      !usedWords.has(word)
    );
    if (matches.length > 0) {
      possibleWords.push(...matches);
    }
  }

  // If all matches are used up, allow reuse as fallback
  if (possibleWords.length === 0) {
    for (let length of validLengths) {
      let fallbackPool = wordData[length];
      let fallbackMatches = fallbackPool.filter(word => word[0].toLowerCase() === letter.toLowerCase());
      if (fallbackMatches.length > 0) {
        possibleWords.push(...fallbackMatches);
      }
    }
  }

  if (possibleWords.length === 0) return "nulla";

  const word = possibleWords[Math.floor(Math.random() * possibleWords.length)];
  usedWords.add(word);
  return word;
}

// Build sentence based on input letters
function buildSentenceFromInput(input) {
  const chars = input.toLowerCase().split("").filter(c => /[a-z]/.test(c));
  if (chars.length === 0) return "🌀 The silence is deafening.";

  const usedWords = new Set();
  const words = chars.map(letter => getWordByLetter(letter, usedWords));
  const sentence = words.join(" ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

// Main function triggered by button or Enter key
function generateSentence() {
  const input = document.getElementById("userInput").value.trim();
  if (!input) return;

  const chatBox = document.getElementById("chatBox");
  const userMsg = document.createElement("div");
  userMsg.className = "user-msg";
  userMsg.textContent = input;
  chatBox.appendChild(userMsg);

  let sentence;
  do {
    sentence = buildSentenceFromInput(input);
  } while (usedSentences.has(sentence) && usedSentences.size < 1000);

  usedSentences.add(sentence);

  const botMsg = document.createElement("div");
  botMsg.className = "bot-msg";
  botMsg.textContent = sentence;
  chatBox.appendChild(botMsg);

  document.getElementById("userInput").value = "";
  chatBox.scrollTop = chatBox.scrollHeight;
}

loadWords();

// Pressing Enter = Clicking Send
document.getElementById("userInput").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    generateSentence();
  }
});
