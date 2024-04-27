const words = glossary.filter(word => word.length === 5)

document.addEventListener('DOMContentLoaded', () => {
    initializeGrid();

    document.getElementById('solve').addEventListener('click', () => {
        // Здесь будет логика для подбора слов
        console.log('Поиск подходящих слов...');
        filterWords();
    });
});

function initializeGrid() {
    for (let i = 1; i <= 5; i++) {
        const row = document.getElementById(`row${i}`);
        for (let j = 0; j < 5; j++) {
            const input = document.createElement('input');
            input.setAttribute('maxlength', '1');
            // Убираем установку начального состояния 'absent'
            input.addEventListener('keydown', (e) => handleKeydown(e, j, i));
            input.addEventListener('dblclick', (e) => handleDoubleClick(e.target));
            row.appendChild(input);
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

function handleDoubleClick(input) {
    // Проверяем, есть ли значение в инпуте перед изменением его состояния
    if (input.value.trim() !== '') {
        const currentState = input.getAttribute('data-state');
        switch (currentState) {
            case 'absent':
                input.setAttribute('data-state', 'present');
                break;
            case 'present':
                input.setAttribute('data-state', 'correct');
                break;
            case 'correct':
                input.setAttribute('data-state', 'absent');
                break;
            default:
                input.setAttribute('data-state', 'absent'); // Устанавливаем 'absent', если состояние не было установлено
        }
    } else {
        // Если в инпуте нет значения, убедимся, что удалим атрибут 'data-state', если он есть
        input.removeAttribute('data-state');
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
        const inputs = row.querySelectorAll('input');
        if (Array.from(inputs).every(input => input.value)) {
            inputs.forEach((input, inputIndex) => {
                const letter = input.value.toLowerCase();
                const state = input.getAttribute('data-state');
                if (state === 'correct') rules.correct.push({ index: inputIndex, letter: letter })
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

    suggestionsElement.innerText = suggestions.join(', ')

    // suggestions.forEach(word => {
    //     const wordElement = document.createElement('div');
    //     wordElement.textContent = word;
    //     suggestionsElement.appendChild(wordElement);
    // });
}
