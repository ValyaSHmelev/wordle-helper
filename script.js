const words = glossary.filter(word => word.length === 5)
const state = {
    curRow: 1,
    curCell: 1
}

document.addEventListener('DOMContentLoaded', () => {
    // initializeGrid();
    displaySuggestions(words)
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('dblclick', (e) => handleDoubleClick(e.target))
    })

});

// function initializeGrid() {
//     for (let i = 1; i <= 6; i++) {
//         const row = document.getElementById(`row${i}`);
//         for (let j = 0; j < 5; j++) {
//             const cell = document.createElement('div')
//             cell.classList = 'cell'
//             cell.id = `cell${j + 1}`
//             cell.addEventListener('dblclick', (e) => handleDoubleClick(e.target));
//             row.appendChild(cell);
//         }
//     }
// }


function handleDoubleClick(cell) {
    // Проверяем, есть ли значение в инпуте перед изменением его состояния
    if (cell.innerText.trim() !== '') {
        const currentState = cell.getAttribute('data-state');
        switch (currentState) {
            case 'absent':
                cell.setAttribute('data-state', 'present');
                break;
            case 'present':
                cell.setAttribute('data-state', 'correct');
                break;
            case 'correct':
                cell.setAttribute('data-state', 'absent');
                break;
            default:
                cell.setAttribute('data-state', 'absent'); // Устанавливаем 'absent', если состояние не было установлено
        }
    } else {
        // Если в инпуте нет значения, убедимся, что удалим атрибут 'data-state', если он есть
        cell.removeAttribute('data-state');
    }
    filterWords();
}

function filterWords() {
    let filteredWords = words
    const rows = document.querySelectorAll('.row');

    const rules = {
        correct: [],
        present: [],
        absent: []
    }

    rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('.cell');
        if (Array.from(cells).every(cell => cell.innerText)) {
            cells.forEach((cell, cellIndex) => {
                const letter = cell.innerText.toLowerCase();
                const state = cell.getAttribute('data-state');
                if (state === 'correct') rules.correct.push({ index: cellIndex, letter: letter })
                if (state === 'present') rules.present.push({ notAtIdx: cellIndex, letter: letter })
                if (state === 'absent') rules.absent.push(letter)
            });
        }
    });

    filteredWords = filteredWords.filter(word => {
        const allAbsent = rules.absent.every(letter => !word.includes(letter))
        const allPresent = rules.present.every(el => word.includes(el.letter) && word[el.notAtIdx] != el.letter)
        const allCorrect = rules.correct.every(el => word[el.index] === el.letter)
        return allAbsent && allPresent && allCorrect
    })

    displaySuggestions(filteredWords);
}

function displaySuggestions(suggestions) {
    const suggestionsElement = document.getElementById('suggestions');
    const suggestionsCountElement = document.getElementById('suggestions-count');
    suggestionsElement.innerHTML = ''; // Очистка предыдущих предложений
    suggestionsCountElement.textContent = `Подходящих слов: ${suggestions.length}`; // Обновление количества подходящих слов

    // shuffleArray(suggestions)
    // sortUniqueFirst(suggestions)

    const sortedSuggestions = sortStringsByRelevance(suggestions)

    const fragment = document.createDocumentFragment();

    sortedSuggestions.forEach(suggestion => {
        const $suggestion = document.createElement('span');
        $suggestion.innerText = suggestion;
        $suggestion.classList.add('suggestion');
        $suggestion.addEventListener('click', handleSuggestion)
        fragment.appendChild($suggestion);
    })

    suggestionsElement.appendChild(fragment);

}

function handleSuggestion(e) {
    const word = e.target.innerText
    const cells = document.querySelector('#row' + state.curRow).querySelectorAll('.cell')
    cells.forEach((cell, i) => cell.innerText = word[i])
    state.curCell = 5
}

function getCurCell() {
    const curRow = document.getElementById(`row${state.curRow}`)
    const curCell = curRow.querySelector(`#cell${state.curCell}`)

    return curCell
}

function handleBackspace() {

    if (state.curCell > 1 && state.curCell === 5) {
        if (getCurCell().innerText) {
            getCurCell().innerText = ''
        } else {
            state.curCell--
            getCurCell().innerText = ''
        }
        return
    }

    if (state.curCell > 1 && state.curCell < 5) {
        state.curCell--
        getCurCell().innerText = ''
        return
    }

    if (state.curCell === 1) {
        getCurCell().innerText = ''
        return
    }

}

function handleEnter() {

    if (state.curRow < 6 && state.curCell == 5) {
        const curRow = document.getElementById(`row${state.curRow}`)
        curRow.querySelectorAll('.cell').forEach(cell => cell.setAttribute('data-state', 'absent'))
        state.curCell = 1
        state.curRow++
        filterWords()
    }

}

function handleKey(e) {

    if (state.curCell <= 5) {
        const curCell = getCurCell()
        if (!curCell.innerText) {
            curCell.innerText = e.target.innerText
        }
    }

    if (state.curCell < 5) {
        state.curCell++
    }
}

document.getElementById('enter-key').addEventListener('click', handleEnter)
document.getElementById('backspase-key').addEventListener('click', handleBackspace)

document.querySelectorAll('.key').forEach(key => {
    if (!key.id) {
        key.addEventListener('click', handleKey)
    }
})

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]; // Меняем местами
    }
    return arr;
}

function sortUniqueFirst(arr) {
    // Проверка, состоит ли строка из уникальных символов
    const isUnique = (str) => new Set(str).size === str.length;

    // Сортировка массива
    return arr.sort((a, b) => {
        const aUnique = isUnique(a);
        const bUnique = isUnique(b);

        // Если обе строки уникальны или не уникальны, сортируем их как обычно
        if (aUnique === bUnique) return 0;

        // Если первая строка уникальна, она должна быть выше второй
        return aUnique ? -1 : 1;
    });
}

function sortStringsByRelevance(words = []) {
    console.time('time');

    // 1. Создаем инвертированный индекс (мапа буква -> множество слов)
    const invertedIndex = new Map();
    words.forEach(word => {
        for (const letter of word) {
            if (!invertedIndex.has(letter)) {
                invertedIndex.set(letter, new Set());
            }
            invertedIndex.get(letter).add(word);
        }
    });

    // 2. Вычисляем релевантность для каждого слова
    const relevanceScores = new Map();
    words.forEach(word => {
        const relatedWords = new Set();
        for (const letter of word) {
            const wordsWithLetter = invertedIndex.get(letter);
            wordsWithLetter.forEach(relatedWord => relatedWords.add(relatedWord));
        }
        // Удаляем само слово из множества связанных слов
        relatedWords.delete(word);
        relevanceScores.set(word, relatedWords.size);
    });

    console.timeEnd('time');

    // 3. Сортируем слова по релевантности
    return Array.from(relevanceScores.entries())
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
}