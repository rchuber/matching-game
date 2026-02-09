const wordLibrary = [
  { word: "bad", syllable: "closed", length: 3 },
  { word: "bag", syllable: "closed", length: 3 },
  { word: "bat", syllable: "closed", length: 3 },
  { word: "cap", syllable: "closed", length: 3 },
  { word: "cat", syllable: "closed", length: 3 },
  { word: "dab", syllable: "closed", length: 3 },
  { word: "fad", syllable: "closed", length: 3 },
  { word: "fat", syllable: "closed", length: 3 },
  { word: "gab", syllable: "closed", length: 3 },
  { word: "gal", syllable: "closed", length: 3 },
  { word: "hot", syllable: "closed", length: 3 },
  { word: "hop", syllable: "closed", length: 3 },
  { word: "kit", syllable: "closed", length: 3 },
  { word: "men", syllable: "closed", length: 3 },
  { word: "rim", syllable: "closed", length: 3 },
  { word: "sun", syllable: "closed", length: 3 },
  { word: "make", syllable: "vce", length: 4 },
  { word: "tape", syllable: "vce", length: 4 },
  { word: "bike", syllable: "vce", length: 4 },
  { word: "cube", syllable: "vce", length: 4 },
  { word: "home", syllable: "vce", length: 4 },
  { word: "late", syllable: "vce", length: 4 },
  { word: "rake", syllable: "vce", length: 4 },
  { word: "mole", syllable: "vce", length: 4 },
  { word: "hi", syllable: "open", length: 2 },
  { word: "he", syllable: "open", length: 2 },
  { word: "she", syllable: "open", length: 3 },
  { word: "go", syllable: "open", length: 2 },
  { word: "me", syllable: "open", length: 2 },
  { word: "we", syllable: "open", length: 2 },
  { word: "paint", syllable: "vowel-team", length: 5 },
  { word: "boat", syllable: "vowel-team", length: 4 },
  { word: "seed", syllable: "vowel-team", length: 4 },
  { word: "rain", syllable: "vowel-team", length: 4 },
  { word: "team", syllable: "vowel-team", length: 4 },
  { word: "shark", syllable: "r-controlled", length: 5 },
  { word: "car", syllable: "r-controlled", length: 3 },
  { word: "fern", syllable: "r-controlled", length: 4 },
  { word: "bird", syllable: "r-controlled", length: 4 },
  { word: "curl", syllable: "r-controlled", length: 4 },
  { word: "far", syllable: "r-controlled", length: 3 },
  { word: "her", syllable: "r-controlled", length: 3 },
  { word: "bubble", syllable: "consonant-le", length: 6 },
  { word: "candle", syllable: "consonant-le", length: 6 },
  { word: "puzzle", syllable: "consonant-le", length: 6 },
  { word: "turtle", syllable: "consonant-le", length: 6 },
  { word: "little", syllable: "consonant-le", length: 6 }
];

const elements = {
  tabs: document.querySelectorAll(".tab"),
  panels: document.querySelectorAll(".panel"),
  heroButtons: document.querySelectorAll("[data-tab-target]"),
  wordList: document.getElementById("wordList"),
  search: document.getElementById("wordSearch"),
  syllableFilter: document.getElementById("syllableFilter"),
  lengthFilter: document.getElementById("lengthFilter"),
  selectFiltered: document.getElementById("selectFiltered"),
  clearSelections: document.getElementById("clearSelections"),
  filteredCount: document.getElementById("filteredCount"),
  selectedCount: document.getElementById("selectedCount"),
  listStatus: document.getElementById("listStatus"),
  pairCount: document.getElementById("pairCount"),
  pairCountValue: document.getElementById("pairCountValue"),
  startGame: document.getElementById("startGame"),
  shuffleGame: document.getElementById("shuffleGame"),
  board: document.getElementById("gameBoard"),
  readMode: document.getElementById("readMode"),
  twoPlayerMode: document.getElementById("twoPlayerMode"),
  selectionHint: document.getElementById("selectionHint"),
  playerOneScore: document.getElementById("playerOneScore"),
  playerTwoScore: document.getElementById("playerTwoScore"),
  matchCount: document.getElementById("matchCount"),
  deckCount: document.getElementById("deckCount"),
  turnIndicator: document.getElementById("turnIndicator")
};

const STORAGE_KEY = "word-match-selected";
let selectedWords = new Set();
let currentDeck = [];
let flippedCards = [];
let lockBoard = false;
let scores = { player1: 0, player2: 0 };
let currentPlayer = 1;

const formatSyllable = (syllable) => {
  const map = {
    "vowel-team": "Vowel Team",
    "r-controlled": "R-Controlled",
    "consonant-le": "Consonant-le",
    vce: "VCe",
    closed: "Closed",
    open: "Open"
  };
  return map[syllable] || syllable;
};

const saveSelections = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...selectedWords]));
};

const loadSelections = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  try {
    const parsed = JSON.parse(stored);
    selectedWords = new Set(parsed);
  } catch (error) {
    selectedWords = new Set();
  }
};

const getFilters = () => {
  return {
    search: elements.search.value.toLowerCase(),
    syllable: elements.syllableFilter.value,
    length: elements.lengthFilter.value
  };
};

const getFilteredWords = () => {
  const { search, syllable, length } = getFilters();
  return wordLibrary.filter((item) => {
    const matchesSearch = item.word.includes(search);
    const matchesSyllable = syllable === "all" || item.syllable === syllable;
    const matchesLength =
      length === "all" || item.length === Number.parseInt(length, 10);
    return matchesSearch && matchesSyllable && matchesLength;
  });
};

const renderWordList = () => {
  const filtered = getFilteredWords();
  elements.wordList.innerHTML = "";

  filtered.forEach((item) => {
    const row = document.createElement("label");
    row.className = "word-item";

    const info = document.createElement("div");
    info.innerHTML = `<strong>${item.word}</strong> <div class="word-item__meta">${formatSyllable(
      item.syllable
    )} • ${item.length} letters</div>`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = selectedWords.has(item.word);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedWords.add(item.word);
      } else {
        selectedWords.delete(item.word);
      }
      saveSelections();
      updateSummary();
    });

    row.appendChild(info);
    row.appendChild(checkbox);
    elements.wordList.appendChild(row);
  });

  elements.filteredCount.textContent = filtered.length;
  elements.listStatus.textContent =
    filtered.length > 0 ? `${filtered.length} words` : "No matches";
};

const updateSummary = () => {
  elements.selectedCount.textContent = selectedWords.size;
  elements.deckCount.textContent = selectedWords.size;
};

const shuffle = (array) => {
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const buildDeck = () => {
  const pairCount = Number.parseInt(elements.pairCount.value, 10);
  const available = [...selectedWords];

  if (available.length < pairCount) {
    elements.selectionHint.textContent =
      "Select more words in Admin Mode to build a full deck.";
    currentDeck = [];
    renderBoard();
    return;
  }

  elements.selectionHint.textContent = "";
  const chosen = shuffle(available).slice(0, pairCount);
  currentDeck = shuffle([...chosen, ...chosen]);
  scores = { player1: 0, player2: 0 };
  currentPlayer = 1;
  flippedCards = [];
  elements.matchCount.textContent = "0";
  updateScoreboard();
  renderBoard();
};

const updateScoreboard = () => {
  elements.playerOneScore.textContent = scores.player1;
  elements.playerTwoScore.textContent = scores.player2;
  elements.turnIndicator.textContent = elements.twoPlayerMode.checked
    ? `Player ${currentPlayer} Turn`
    : "Solo Round";
};

const speakWord = (word) => {
  if (!elements.readMode.checked) return;
  if (!("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

const handleMatch = () => {
  scores[`player${currentPlayer}`] += 1;
  elements.matchCount.textContent = Number.parseInt(
    elements.matchCount.textContent,
    10
  ) + 1;
  updateScoreboard();
};

const handleMismatch = () => {
  if (elements.twoPlayerMode.checked) {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateScoreboard();
  }
};

const resetFlipped = () => {
  flippedCards.forEach((card) => card.classList.remove("is-flipped"));
  flippedCards = [];
  lockBoard = false;
};

const onCardClick = (event) => {
  const card = event.currentTarget;
  if (lockBoard || card.classList.contains("is-matched")) return;
  if (flippedCards.includes(card)) return;

  card.classList.add("is-flipped");
  speakWord(card.dataset.word);
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    lockBoard = true;
    const [first, second] = flippedCards;
    if (first.dataset.word === second.dataset.word) {
      first.classList.add("is-matched");
      second.classList.add("is-matched");
      flippedCards = [];
      lockBoard = false;
      handleMatch();
    } else {
      setTimeout(() => {
        resetFlipped();
        handleMismatch();
      }, 900);
    }
  }
};

const renderBoard = () => {
  elements.board.innerHTML = "";
  if (currentDeck.length === 0) return;
  currentDeck.forEach((word) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "card-tile";
    tile.textContent = word;
    tile.dataset.word = word;
    tile.addEventListener("click", onCardClick);
    elements.board.appendChild(tile);
  });
};

const handleTabClick = (target) => {
  elements.tabs.forEach((tab) => tab.classList.remove("is-active"));
  elements.panels.forEach((panel) => panel.classList.remove("is-active"));
  const activeTab = document.querySelector(`[data-tab="${target}"]`);
  const activePanel = document.getElementById(`panel-${target}`);
  if (activeTab && activePanel) {
    activeTab.classList.add("is-active");
    activePanel.classList.add("is-active");
  }
};

const initTabs = () => {
  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => handleTabClick(tab.dataset.tab));
  });
  elements.heroButtons.forEach((button) => {
    button.addEventListener("click", () => handleTabClick(button.dataset.tabTarget));
  });
};

const initFilters = () => {
  [elements.search, elements.syllableFilter, elements.lengthFilter].forEach(
    (input) => {
      input.addEventListener("input", () => {
        renderWordList();
      });
    }
  );

  elements.selectFiltered.addEventListener("click", () => {
    const filtered = getFilteredWords();
    filtered.forEach((item) => selectedWords.add(item.word));
    saveSelections();
    renderWordList();
    updateSummary();
  });

  elements.clearSelections.addEventListener("click", () => {
    selectedWords.clear();
    saveSelections();
    renderWordList();
    updateSummary();
  });
};

const initGameControls = () => {
  elements.pairCount.addEventListener("input", () => {
    elements.pairCountValue.textContent = elements.pairCount.value;
  });

  elements.startGame.addEventListener("click", buildDeck);
  elements.shuffleGame.addEventListener("click", buildDeck);
  elements.twoPlayerMode.addEventListener("change", updateScoreboard);
};

const init = () => {
  loadSelections();
  initTabs();
  initFilters();
  initGameControls();
  renderWordList();
  updateSummary();
  elements.pairCountValue.textContent = elements.pairCount.value;
  updateScoreboard();
};

init();
