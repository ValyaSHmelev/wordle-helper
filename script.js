const words = glossary.filter(word => word.length === 5)
const state = {
    curRow: 1,
    curCell: 1
}

document.addEventListener('DOMContentLoaded', () => {
    initializeGrid();
    displaySuggestions(words)

    // document.getElementById('solve').addEventListener('click', () => {
    //     // Здесь будет логика для подбора слов
    //     console.log('Поиск подходящих слов...');
    //     filterWords();
    // });
});

function initializeGrid() {
    for (let i = 1; i <= 5; i++) {
        const row = document.getElementById(`row${i}`);
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('div')
            cell.classList = 'cell'
            cell.id = `cell${j + 1}`
            // cell.innerText = 'а'
            // const input = document.createElement('input');
            // input.setAttribute('maxlength', '1');
            // Убираем установку начального состояния 'absent'
            // input.addEventListener('keydown', (e) => handleKeydown(e, j, i));
            cell.addEventListener('dblclick', (e) => handleDoubleClick(e.target));
            row.appendChild(cell);
        }
    }
}


function handleKeydown(e, inputIndex, rowIndex) {
    // Проверяем, нажата ли клавиша Backspace
    if (e.key === 'Backspace') {
        setTimeout(() => { // Используем setTimeout для обработки после обновления значения инпута
            if (e.target.value === '') {
                // Если инпут пустой после нажатия Backspace, удаляем состояние
                e.target.removeAttribute('data-state');
            }
            // Перемещаем фокус на предыдущий инпут, если это не первый инпут в строке
            if (inputIndex > 0) {
                const previousInput = document.getElementById(`row${rowIndex}`).children[inputIndex - 1];
                previousInput.focus();
            }
        }, 0);
    } else if (e.key.length === 1 && e.key.match(/[а-я]/i)) {
        // Если нажата буква, устанавливаем состояние 'absent' для инпута
        e.target.setAttribute('data-state', 'absent');
        // Перемещаем фокус на следующий инпут после ввода буквы
        if (inputIndex < 4) {
            setTimeout(() => { // Используем setTimeout для корректной обработки ввода
                document.getElementById(`row${rowIndex}`).children[inputIndex + 1].focus();
            }, 0);
        }
    }
    filterWords();
}

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
                if (state === 'present') rules.present.push(letter)
                if (state === 'absent') rules.absent.push(letter)
            });
        }
    });

    filteredWords = filteredWords.filter(word => {
        const allAbsent = rules.absent.every(letter => !word.includes(letter))
        const allPresent = rules.present.every(letter => word.includes(letter))
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

    shuffleArray(suggestions)
    sortUniqueFirst(suggestions)

    suggestionsElement.innerText = suggestions.join(', ')

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


    console.log(state);
}

function handleEnter() {

    if (state.curRow < 5 && state.curCell == 5) {
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
    console.log(state);
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