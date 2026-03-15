// Глобальные переменные
let currentUser = null;
let currentScene = 'start';
let gameState = {
    bag: ['пресс-карта AFP', 'диктофон', '500$ наличными'],
    story: [],
    stats: {
        evidence: 0,    
        respect: 0,   
        risk: 0,        
        money: 500,
        lies: 0
    },
    ending: null,
    job: null,
    choices: []
};

// База данных пользователей
let users = JSON.parse(localStorage.getItem('vegas_users')) || {};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log('Game initialized');
    updateUI();
    loadScene('start');
    updateInventory();
    checkSavedGame();
    
    
    const panelContent = document.getElementById('bottomPanelContent');
    if (panelContent) {
        panelContent.classList.remove('expanded');
    }
    
    
    const inventoryItems = document.getElementById('inventoryItems');
    if (inventoryItems) {
        inventoryItems.classList.remove('show');
    }
});

// Функции обновления UI
function updateUI() {
    const evidenceStat = document.getElementById('evidenceStat');
    const respectStat = document.getElementById('respectStat');
    const riskStat = document.getElementById('riskStat');
    const moneyStat = document.getElementById('moneyStat');
    
    if (evidenceStat) evidenceStat.textContent = gameState.stats.evidence;
    if (respectStat) respectStat.textContent = gameState.stats.respect;
    if (riskStat) riskStat.textContent = gameState.stats.risk;
    if (moneyStat) moneyStat.textContent = gameState.stats.money;
    
    const loginBtn = document.getElementById('loginBtn');
    const userNameSpan = document.getElementById('userName');
    
    if (currentUser) {
        if (userNameSpan) userNameSpan.textContent = currentUser;
        if (loginBtn) {
            loginBtn.textContent = 'Выйти';
            loginBtn.onclick = logout;
        }
    } else {
        if (userNameSpan) userNameSpan.textContent = 'Гость';
        if (loginBtn) {
            loginBtn.textContent = 'Войти';
            loginBtn.onclick = showLoginModal;
        }
    }
}

function updateInventory() {
    const inventoryDiv = document.getElementById('inventoryItems');
    if (!inventoryDiv) return;
    
    inventoryDiv.innerHTML = '';
    
    if (gameState.bag.length === 0) {
        inventoryDiv.innerHTML = '<div class="inventory-item">🎒 Пусто</div>';
    } else {
        gameState.bag.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            itemDiv.textContent = item;
            inventoryDiv.appendChild(itemDiv);
        });
    }
}

// Функции авторизации
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'flex';
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'none';
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showMessage('Введите имя и пароль', 'error');
        return;
    }
    
    if (users[username] && users[username].password === password) {
        currentUser = username;
        
        
        if (users[username].gameState) {
            gameState = JSON.parse(JSON.stringify(users[username].gameState));
            loadScene(currentScene);
            updateInventory();
        }
        
        updateUI();
        closeLoginModal();
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        showMessage(`Добро пожаловать, ${username}!`, 'success');
    } else {
        showMessage('Неверное имя или пароль', 'error');
    }
}

function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showMessage('Заполните все поля', 'error');
        return;
    }
    
    if (users[username]) {
        showMessage('Пользователь уже существует', 'error');
    } else {
        users[username] = {
            password: password,
            gameState: JSON.parse(JSON.stringify(gameState)),
            created: new Date().toISOString()
        };
        localStorage.setItem('vegas_users', JSON.stringify(users));
        showMessage('Регистрация успешна! Теперь войдите.', 'success');
    }
}

function logout() {
    currentUser = null;
    updateUI();
    showMessage('Вы вышли из системы', 'info');
}

// Функции сохранения и загрузки
function saveGame() {
    if (!currentUser) {
        showMessage('Сначала войдите в систему', 'error');
        showLoginModal();
        return;
    }
    
    users[currentUser].gameState = JSON.parse(JSON.stringify(gameState));
    localStorage.setItem('vegas_users', JSON.stringify(users));
    showMessage('Игра сохранена!', 'success');
}

function loadGame() {
    if (!currentUser) {
        showMessage('Сначала войдите в систему', 'error');
        showLoginModal();
        return;
    }
    
    if (users[currentUser].gameState) {
        gameState = JSON.parse(JSON.stringify(users[currentUser].gameState));
        loadScene(currentScene);
        updateInventory();
        updateUI();
        showMessage('Игра загружена!', 'success');
    } else {
        showMessage('Нет сохранений', 'error');
    }
}

function checkSavedGame() {
    const lastGame = localStorage.getItem('vegas_lastGame');
    if (lastGame && !currentUser) {
        if (confirm('Найти последнее автосохранение?')) {
            gameState = JSON.parse(lastGame);
            loadScene(currentScene);
            updateInventory();
            updateUI();
        }
    }
}

function resetGame() {
    if (confirm('Начать новую игру?')) {
        gameState = {
            bag: ['пресс-карта AFP', 'диктофон', '500$ наличными'],
            story: [],
            stats: {
                evidence: 0,
                respect: 0,
                risk: 0,
                money: 500,
                lies: 0
            },
            ending: null,
            job: null,
            choices: []
        };
        currentScene = 'start';
        loadScene('start');
        updateInventory();
        updateUI();
        showMessage('Новая игра начата!', 'success');
    }
}


function showMessage(text, type = 'info') {
    
    const oldMessages = document.querySelectorAll('.message');
    oldMessages.forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = `message message-${type}`;
    message.textContent = text;
    
    const colors = {
        error: '#f44336',
        success: '#4caf50',
        info: '#2196f3',
        warning: '#ff9800',
        evidence: '#9c27b0',
        danger: '#f44336'
    };
    
    message.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        z-index: 2000;
        animation: slideDown 0.3s, fadeOut 0.3s 2.7s;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        font-weight: 500;
        font-size: 14px;
        max-width: 80%;
        text-align: center;
    `;
    
    // стили анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { transform: translateX(-50%) translateY(-100px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

function toggleBottomPanel() {
    const panelContent = document.getElementById('bottomPanelContent');
    const toggleBtn = document.querySelector('.panel-toggle span:first-child');
    
    if (panelContent) {
        panelContent.classList.toggle('expanded');
        const isExpanded = panelContent.classList.contains('expanded');
        
        const arrows = document.querySelectorAll('.panel-toggle span');
        if (arrows.length >= 2) {
            arrows[0].textContent = isExpanded ? '▼' : '▲';
            arrows[1].textContent = isExpanded ? '▼' : '▲';
        }
    }
}

function toggleInventory() {
    const items = document.getElementById('inventoryItems');
    const icon = document.querySelector('.inventory-header .toggle-icon');
    
    if (items) {
        items.classList.toggle('show');
        if (icon) {
            icon.textContent = items.classList.contains('show') ? '▼' : '▶';
        }
    }
}

// Осн. логика игры
function loadScene(sceneId) {
    console.log('Loading scene:', sceneId);
    const gameScreen = document.getElementById('gameScreen');
    if (!gameScreen) {
        console.error('Game screen not found!');
        return;
    }
    
    currentScene = sceneId;
    
    gameScreen.setAttribute('data-scene', sceneId);
    gameScreen.removeAttribute('data-ending');
    
    if (gameState.ending) {
        showEnding(gameState.ending);
        return;
    }
    
    let sceneHTML = '';
    
    switch(sceneId) {
        case 'start':
            sceneHTML = getStartScene();
            break;
        case 'act1':
            sceneHTML = getAct1Scene();
            break;
        case 'vito_meeting':
            sceneHTML = getVitoMeetingScene();
            break;
        case 'test_skill':
            sceneHTML = getTestSkillScene();
            break;
        case 'week_later':
            sceneHTML = getWeekLaterScene();
            break;
        case 'cheater':
            sceneHTML = getCheaterScene();
            break;
        case 'documents':
            sceneHTML = getDocumentsScene();
            break;
        case 'don_meeting':
            sceneHTML = getDonMeetingScene();
            break;
        default:
            sceneHTML = getStartScene();
    }
    
    gameScreen.innerHTML = sceneHTML;
    
    // Прокрутка вниз
    setTimeout(() => {
        gameScreen.scrollTop = gameScreen.scrollHeight;
    }, 100);
}

// Сцены
function getStartScene() {
    return `
        <div class="scene">
            <div class="scene-title">Бар "У старого фонаря"</div>
            <div class="scene-description">
                Вы прилетели в Лас-Вегас по специальному поручению руководства AFP расследовать связь казино с организованной преступностью. Вам необходимо найти любую информацию, полезную для расследования.<br><br>
                Первым делом вы решили навестить своего старого знакомого бармена – Ленни. Вдруг удастся у него что-нибудь узнать.
            </div>
            
            <div class="character">
                <div class="character-avatar" style="background-image: url('images/character-lenny.png')"></div>
                <div class="character-speech">
                    <span class="character-name">Ленни</span>
                    <p>Давно не виделись, приятель!</p>
                    <p>Я догадываюсь зачем ты здесь.</p>
                    <p>Все, что ты ищешь находится в казино. Но знай, что однажды войдя туда, выйдешь ты оттуда совершенно другим человеком. Удачи!</p>
                </div>
            </div>
            
            <div class="choices">
                <button class="choice-btn" onclick="choiceMade('start_continue')">
                    ▶ Отправиться в казино
                </button>
            </div>
        </div>
    `;
}

function getAct1Scene() {
    return `
        <div class="scene">
            <div class="scene-description">
                Вы нашли то, что искали. Напротив — неоновая вывеска "GOLDEN ACE".<br>
                Охрана на входе внимательно изучает вас.<br>
                - Стоять. Приглашение есть?
            </div>
            
            <div class="choices">
                <button class="choice-btn" onclick="choiceMade('guard_legend')">
                    1 - Легенда: я новый крупье
                </button>
                <button class="choice-btn" onclick="choiceMade('guard_bribe')">
                    2 - Дать взятку (200$)
                </button>
                <button class="choice-btn" onclick="choiceMade('guard_backdoor')">
                    3 - Искать чёрный ход
                </button>
            </div>
        </div>
    `;
}

function getVitoMeetingScene() {
    return `
        <div class="scene">
            <div class="scene-description">
                Вы оказываетесь внутри казино.<br>
                Вы новое лицо в этом месте и вас тут же замечает управляющий Вито.
            </div>
            
            <div class="character">
                <div class="character-avatar" style="background-image: url('images/character-vito.png')"></div>
                <div class="character-speech">
                    <span class="character-name">Вито</span>
                    <p>Ты кто такой? Вижу тебя впервые здесь.</p>
                </div>
            </div>
            
            <div class="choices">
                <button class="choice-btn" onclick="choiceMade('vito_truth')">
                    1 - Честно: я журналист, хочу поговорить с Доном
                </button>
                <button class="choice-btn" onclick="choiceMade('vito_legend')">
                    2 - Легенда: я новый крупье
                </button>
                <button class="choice-btn" onclick="choiceMade('vito_lenny')">
                    3 - Сказать, что от Ленни из бара
                </button>
            </div>
        </div>
    `;
}

function getTestSkillScene() {
    return `
        <div class="scene">
            <div class="scene-description">
                Вито что-то заподозрил – он ведет вас в подсобку, чтобы убедиться в вашем опыте крупье.<br>
                - Показывай, что умеешь.
            </div>
            
            <div class="choices">
                <button class="choice-btn" onclick="choiceMade('skill_bluff')">
                    1 - Блефовать, что всё знаешь
                </button>
                <button class="choice-btn" onclick="choiceMade('skill_honest')">
                    2 - Честно признаться в неопытности
                </button>
                <button class="choice-btn" onclick="choiceMade('skill_show')">
                    3 - Показать базовые навыки (вы готовились)
                </button>
            </div>
        </div>
    `;
}

function getWeekLaterScene() {
    const jobText = gameState.job === 'dealer' 
        ? 'Вам чудным образом удалось убедить Вито в том, что вы крупье – вас определили на работу.\n\nПрошла неделя, вы вжились в роль. Как крупье вы видите многое: кто проигрывает, кто выигрывает, кто странно себя ведёт.'
        : 'Вы пытались продемонстрировать свои умения, но вы даже путаетесь в картах – Вито определяет вас в уборщики. Работая, вы видите то, что другим не видно: Вито встречается с людьми в подсобке, Дон приезжает только ночью, в мусоре обрывки бумаг с цифрами.';
    
    return `
        <div class="scene">
            <div class="scene-title">НЕДЕЛЯ СПУСТЯ</div>
            <div class="scene-description">
                ${jobText}
            </div>
            
            <div class="choices">
                <button class="choice-btn" onclick="choiceMade('week_continue')">
                    ▶ Продолжить
                </button>
            </div>
        </div>
    `;
}

function getCheaterScene() {
    return `
        <div class="scene">
            <div class="scene-description">
                В один из дней вы замечаете, как игрок за вашим столом явно мухлюет – он слишком часто выигрывает. Ваши действия?
            </div>
            
            <div class="choices">
                <button class="choice-btn" onclick="choiceMade('cheater_call')">
                    1 - Позвать охрану (честно)
                </button>
                <button class="choice-btn" onclick="choiceMade('cheater_silent')">
                    2 - Промолчать и проследить за ним
                </button>
                <button class="choice-btn" onclick="choiceMade('cheater_stop')">
                    3 - Самому остановить и пригрозить
                </button>
            </div>
        </div>
    `;
}

function getDocumentsScene() {
    return `
        <div class="scene">
            <div class="scene-description">
                Вы успешно выявляете жулика. Администрация вам благодарна и начинает к вам относиться более лояльно.<br><br>
                В один из дней вы решаете задержаться на работе, ожидая, пока все остальные уйдут. Дождавшись момента, вы решили продолжить искать улики к своему расследованию от AFP. К счастью, кабинет Вито оказывается открытым:
            </div>
            
            <div class="choices">
                <button class="choice-btn" onclick="choiceMade('docs_all')">
                    1 - Фотографировать всё подряд
                </button>
                <button class="choice-btn" onclick="choiceMade('docs_select')">
                    2 - Выборочно искать важное
                </button>
                <button class="choice-btn" onclick="choiceMade('docs_leave')">
                    3 - Не рисковать, уйти
                </button>
            </div>
        </div>
    `;
}

function getDonMeetingScene() {
    return `
        <div class="scene">
            <div class="scene-description">
                На следующий день вас приглашают в кабинет Дона.
            </div>
            
            <div class="character">
                <div class="character-avatar" style="background-image: url('images/character-don.png')"></div>
                <div class="character-speech">
                    <span class="character-name">Дон</span>
                    <p>Садись. Ты неплохо работаешь. Но я знаю, кто ты и зачем ты здесь.</p>
                    <p>У тебя два выхода. Работать на меня или умереть. Что выбираешь?</p>
                </div>
            </div>
            
            <div class="choices">
                <button class="choice-btn" onclick="choiceMade('don_agree')">
                    1 - Согласиться работать на мафию
                </button>
                <button class="choice-btn" onclick="choiceMade('don_refuse')">
                    2 - Отказаться и стоять на своём
                </button>
                <button class="choice-btn" onclick="choiceMade('don_trick')">
                    3 - Попытаться перехитрить (сделать вид, что согласен)
                </button>
            </div>
        </div>
    `;
}

// Главная функция обработки выборов
function choiceMade(choice) {
    console.log('Choice made:', choice);
    
  
    gameState.choices.push(choice);
    
    switch(choice) {
        // Начало
        case 'start_continue':
            loadScene('act1');
            break;
            
        // АКТ I - Охрана
        case 'guard_legend':
            gameState.story.push('Проник по легенде крупье');
            gameState.stats.respect++;
            gameState.stats.risk++;
            gameState.stats.lies++;
            showMessage('+1 уважение, +1 риск', 'info');
            loadScene('vito_meeting');
            break;
            
        case 'guard_bribe':
            if (gameState.stats.money >= 200) {
                gameState.stats.money -= 200;
                gameState.story.push('Купил вход');
                gameState.stats.risk++;
                gameState.bag.push('связь с продажным охранником');
                showMessage('-200$, +1 риск', 'info');
                loadScene('vito_meeting');
            } else {
                gameState.story.push('Денег на взятку не хватило');
                showMessage('Недостаточно денег! Ищу чёрный ход...', 'error');
                
                setTimeout(() => {
                    choiceMade('guard_backdoor');
                }, 2000);
            }
            break;
            
        case 'guard_backdoor':
            gameState.story.push('Проник через чёрный ход');
            gameState.stats.risk += 2;
            gameState.bag.push('грязная униформа (приметный)');
            showMessage('+2 риск', 'warning');
            loadScene('vito_meeting');
            break;
            
        // Встреча с Вито
        case 'vito_truth':
            gameState.ending = 'ЧЕСТНЫЙ, НО МЕРТВЫЙ';
            gameState.story.push('Вы решили искать правду честным путем. Вы верили, что справедливость важнее хитрости. Вы не врали, не предавали, не играли по их правилам. Но в мире беззакония честность — не оружие.');
            showMessage('💀 ПРОВАЛ МИССИИ...', 'danger');
            setTimeout(() => {
                showEnding(gameState.ending);
            }, 1500);
            return;
            
        case 'vito_legend':
            gameState.story.push('Встреча с Вито: легенда о крупье');
            gameState.stats.lies++;
            gameState.stats.risk++;
            showMessage('+1 ложь, +1 риск', 'info');
            loadScene('test_skill');
            break;
            
        case 'vito_lenny':
            gameState.story.push('Встреча с Вито: через Ленни');
            gameState.stats.respect++;
            showMessage('+1 уважение', 'success');
            loadScene('test_skill');
            break;
            
        // Тест Навыков
        case 'skill_bluff':
        case 'skill_honest':
            gameState.story.push('Провал теста → работа уборщиком');
            if (choice === 'skill_bluff') {
                gameState.stats.lies++;
                showMessage('+1 ложь', 'info');
            } else {
                gameState.stats.respect++;
                showMessage('+1 уважение', 'success');
            }
            gameState.stats.risk += 2;
            gameState.job = 'janitor';
            showMessage('+2 риск', 'warning');
            loadScene('week_later');
            break;
            
        case 'skill_show':
            gameState.story.push('Успешный тест → работа крупье');
            gameState.stats.respect += 2;
            gameState.job = 'dealer';
            showMessage('+2 уважение', 'success');
            loadScene('week_later');
            break;
            
        // Неделя спустя
        case 'week_continue':
            if (gameState.job === 'dealer') {
                gameState.stats.evidence++;
                showMessage('📄 +1 улика (наблюдение за игроками)', 'evidence');
            } else {
                gameState.stats.evidence += 2;
                showMessage('📄 +2 улики (обрывки документов)', 'evidence');
            }
            loadScene('cheater');
            break;
            
        // Мухлеж
        case 'cheater_call':
            gameState.story.push('Позвал охрану → администрация благодарна');
            gameState.stats.money += 500;
            gameState.stats.respect += 2;
            gameState.bag.push('доверие администрации');
            showMessage('+500$, +2 уважение', 'success');
            loadScene('documents');
            break;
            
        case 'cheater_silent':
            gameState.story.push('Промолчал и проследил → узнал схему');
            gameState.stats.evidence += 2;
            gameState.stats.risk++;
            gameState.bag.push('информация о схеме мулежа');
            showMessage('📄 +2 улики, +1 риск', 'evidence');
            loadScene('documents');
            break;
            
        case 'cheater_stop':
            gameState.story.push('Остановил сам → риск, но заметили');
            gameState.stats.risk += 2;
            gameState.stats.respect++;
            showMessage('+2 риск, +1 уважение', 'warning');
            loadScene('documents');
            break;
            
        // Документы
        case 'docs_all':
            gameState.ending = 'ПРОВАЛ: ПОЙМАН НА МЕСТЕ';
            gameState.story.push('Вас раскрыли. Мафия не прощает ошибок. Ваше тело найдено в пустыне Невада. AFP объявляет о пропаже сотрудника в Лас-Вегасе, но эта новость остается незамеченной. Расследование похоронено вместе с вами. Только ветер гуляет по пустыне...');
            showMessage('💀 ВАС ПОЙМАЛИ...', 'danger');
            setTimeout(() => {
                showEnding(gameState.ending);
            }, 1500);
            return;
            
        case 'docs_select':
            gameState.story.push('Нашёл ключевые улики');
            gameState.stats.evidence += 3;
            gameState.bag.push('схемы отмывания денег');
            gameState.bag.push('бухгалтерия казино');
            showMessage('📄 +3 улики!', 'success');
            loadScene('don_meeting');
            break;
            
        case 'docs_leave':
            gameState.story.push('Решил не рисковать');
            showMessage('Вы ушли ни с чем', 'info');
            loadScene('don_meeting');
            break;
            
        // Встреча с Доном
        case 'don_agree':
            gameState.ending = 'СДЕЛКА: ЧЕЛОВЕК МАФИИ';
            gameState.story.push('Вы соглашаетесь, – Дон довольно кивает. Через месяц вы пишете речи для Дона вместо статей для AFP. Вы выбрали путь, с которым изначально боролись.');
            showMessage('⚜️ СДЕЛКА С ДЬЯВОЛОМ...', 'warning');
            setTimeout(() => {
                showEnding(gameState.ending);
            }, 1500);
            return;
            
        case 'don_refuse':
            gameState.story.push('Отказ → покушение');
            gameState.stats.risk += 3;
            showMessage('+3 риск', 'danger');
            setTimeout(() => {
                showFinalChoice();
            }, 1500);
            return;
            
        case 'don_trick':
            gameState.story.push('Попытка перехитрить Дона');
            showMessage('Попытка перехитрить...', 'info');
            setTimeout(() => {
                showTrickChoice();
            }, 1500);
            return;
            
        // Финальные выборы
        case 'final_publish':
            gameState.ending = 'ПУЛИТЦЕРОВСКАЯ ПРЕМИЯ';
            gameState.story.push('Вы публикуете сенсационное расследование: Дона арестовывают, казино опечатывают. Вы награждаетесь Пулитцеровской премией. Но мафия объявила награду 100 000$ за вашу голову. Вы живете под охраной, меняя квартиры каждую неделю.');
            showEnding('ПУЛИТЦЕР');
            return;
            
        case 'final_compromise':
            gameState.ending = 'СДЕЛКА: БОГАТСТВО И СОВЕСТЬ';
            gameState.story.push('Пошёл на сделку с Доном');
            gameState.stats.money += 200000;
            showEnding('СДЕЛКА');
            return;
            
        case 'final_destroy':
            gameState.ending = 'ПРОВАЛ: НИЧТО';
            gameState.story.push('Уничтожил всё и уехал');
            showEnding('ПРОВАЛ');
            return;
            
        case 'trick_steal':
            gameState.ending = 'ПРОВАЛ: ПОЙМАН';
            gameState.story.push('Попытка кражи провалилась');
            showEnding('ПРОВАЛ');
            return;
            
        case 'trick_police':
            gameState.ending = 'СВИДЕТЕЛЬ: НОВАЯ ЖИЗНЬ';
            gameState.story.push('Пошёл в полицию');
            showEnding('СВИДЕТЕЛЬ');
            return;
            
        case 'trick_run':
            gameState.ending = 'ПРОВАЛ: ТРУС';
            gameState.story.push('Сбежал');
            showEnding('ПРОВАЛ');
            return;
            
        default:
            console.log('Unknown choice:', choice);
            showMessage('Ошибка выбора', 'error');
    }
    

    updateUI();
    updateInventory();
    autoSave();
}

// Функции для финальных сцен
function showFinalChoice() {
    const gameScreen = document.getElementById('gameScreen');
    
    gameScreen.innerHTML = `
        <div class="scene">
            <div class="scene-title">ПОСЛЕДНИЙ ШАНС</div>
            <div class="scene-description">
                В мотеле. Кровь на рубашке. Материалы с вами.<br>
                Улик собрано: ${gameState.stats.evidence}
            </div>
            
            <div class="choices">
                <button class="choice-btn" onclick="choiceMade('final_publish')">
                    1 - Опубликовать всё — Пулитцер или смерть
                </button>
                <button class="choice-btn" onclick="choiceMade('final_compromise')">
                    2 - Опубликовать часть, договориться с Доном
                </button>
                <button class="choice-btn" onclick="choiceMade('final_destroy')">
                    3 - Уничтожить всё и уехать
                </button>
            </div>
        </div>
    `;
}

function showTrickChoice() {
    const gameScreen = document.getElementById('gameScreen');
    
    gameScreen.innerHTML = `
        <div class="scene">
            <div class="scene-title">ПОСЛЕДНИЙ ШАНС</div>
            <div class="scene-description">
                - Мне нужно подумать, Дон. День-два.<br>
                Дон усмехается: "Думай. Но недолго."<br>
                За вами следят. Вы понимаете: выхода нет.
            </div>
            
            <div class="choices">
                <button class="choice-btn" onclick="choiceMade('trick_steal')">
                    1 - Украсть ноутбук Дона и сбежать
                </button>
                <button class="choice-btn" onclick="choiceMade('trick_police')">
                    2 - Пойти в полицию с материалами
                </button>
                <button class="choice-btn" onclick="choiceMade('trick_run')">
                    3 - Всё бросить и улететь
                </button>
            </div>
        </div>
    `;
}

// Показ концовки 
function showEnding(type) {
    const gameScreen = document.getElementById('gameScreen');
    gameState.ending = type;
    

    gameScreen.setAttribute('data-ending', type);
    gameScreen.removeAttribute('data-scene');
    
    let endingTitle = '';
    let endingDescription = '';
    
    switch(type) {
        case 'ЧЕСТНЫЙ, НО МЕРТВЫЙ':
            endingTitle = '💀 ПРОВАЛ МИССИИ 💀';
            endingDescription = `
                Вы решили искать правду честным путем.<br>
                Вы верили, что справедливость важнее хитрости.<br>
                Вы не врали, не предавали, не играли по их правилам.<br>
                Но в мире беззакония, честность — не оружие.<br><br>
                Вас нашли на рассвете. Пустыня Невада молчаливо приняла ваше тело.<br>
                Никто не слышал выстрелов. Никто ничего не видел.<br>
                AFP ищет вас до сих пор. Запросы в полицию, звонки в морги,<br>
                письма в больницы. Но пустыня умеет хранить тайны.<br>
                Ваше имя осталось в списке пропавших без вести.<br>
                Расследование умерло вместе с вами.
            `;
            break;
            
        case 'ПРОВАЛ: ПОЙМАН НА МЕСТЕ':
            endingTitle = '💀 ПРОВАЛ МИССИИ 💀';
            endingDescription = `
                Вас раскрыли. Мафия не прощает ошибок.<br>
                Ваше тело найдено в пустыне Невада.<br>
                AFP объявляет о пропаже сотрудника в Лас-Вегасе, но эта новость остается незамеченной.<br>
                Расследование похоронено вместе с вами.<br>
                Только ветер гуляет по пустыне...
            `;
            break;
            
        case 'СДЕЛКА: ЧЕЛОВЕК МАФИИ':
        case 'СДЕЛКА: БОГАТСТВО И СОВЕСТЬ':
        case 'СДЕЛКА':
            endingTitle = '⚜️ СДЕЛКА С ДЬЯВОЛОМ ⚜️';
            endingDescription = `
                Вы соглашаетесь, – Дон довольно кивает.<br>
                Через месяц вы пишете речи для Дона вместо статей для AFP.<br>
                Вы выбрали путь, с которым изначально боролись.
            `;
            break;
            
        case 'ПУЛИТЦЕРОВСКАЯ ПРЕМИЯ':
        case 'ПУЛИТЦЕР':
            endingTitle = '🏆 ПУЛИТЦЕРОВСКАЯ ПРЕМИЯ 🏆';
            endingDescription = `
                Вы публикуете сенсационное расследование:<br>
                Дона арестовывают, казино опечатывают.<br>
                Вы награждаетесь Пулитцеровской премией.<br>
                Но мафия объявила награду 100 000$ за вашу голову.<br>
                Вы живете под охраной, меняя квартиры каждую неделю.
            `;
            break;
            
        case 'СВИДЕТЕЛЬ: НОВАЯ ЖИЗНЬ':
        case 'СВИДЕТЕЛЬ':
            endingTitle = '👮 СВИДЕТЕЛЬ: НОВАЯ ЖИЗНЬ 👮';
            endingDescription = `
                ФБР берёт Дона по вашим материалам.<br>
                Вы входите в программу защиты свидетелей.<br>
                Новое имя, новый город, новая жизнь.<br>
                AFP так и не узнает, кто провёл расследование.<br>
                Пустыня Невады остаётся позади...
            `;
            break;
            
        case 'ПРОВАЛ: НИЧТО':
        case 'ПРОВАЛ: ТРУС':
        case 'ПРОВАЛ: ПОЙМАН':
        case 'ПРОВАЛ':
            endingTitle = '💀 ПРОВАЛ МИССИИ 💀';
            endingDescription = `
                Вы проиграли. Мафия победила.<br>
                Расследование похоронено.<br>
                Только ветер гуляет по пустыне...
            `;
            break;
            
        default:
            endingTitle = type;
            endingDescription = 'Игра окончена.';
    }
    
    gameScreen.innerHTML = `
        <div class="scene">
            <div class="ending">
                <div class="ending-title">${endingTitle}</div>
                <div class="scene-description">${endingDescription}</div>
                
                <div class="ending-stats">
                    <div class="ending-stat">📄 Улики: ${gameState.stats.evidence}</div>
                    <div class="ending-stat">👑 Уважение: ${gameState.stats.respect}</div>
                    <div class="ending-stat">⚠️ Риск: ${gameState.stats.risk}</div>
                    <div class="ending-stat">💰 Деньги: ${gameState.stats.money}$</div>
                    <div class="ending-stat">🎭 Ложь: ${gameState.stats.lies}</div>
                </div>
                
                <div class="scene-description">
                    <strong>Ключевые события:</strong><br>
                    ${gameState.story.slice(-5).map(e => '• ' + e).join('<br>')}
                </div>
                
                <div class="inventory-items" style="justify-content: center; margin: 20px 0;">
                    ${gameState.bag.map(item => `<div class="inventory-item">${item}</div>`).join('')}
                </div>
                
                <div class="choices">
                    <button class="choice-btn" onclick="resetGame()">
                        🔄 Начать новую игру
                    </button>
                </div>
            </div>
        </div>
    `;
    
    saveToFile();
    autoSave();
    updateUI();
}

function saveToFile() {
    // Сохранение для истории
    const gameResult = {
        ending: gameState.ending,
        story: gameState.story,
        stats: gameState.stats,
        bag: gameState.bag,
        date: new Date().toISOString()
    };
    
    const savedGames = JSON.parse(localStorage.getItem('vegas_history')) || [];
    savedGames.push(gameResult);
    localStorage.setItem('vegas_history', JSON.stringify(savedGames));
    
    
    let content = `ФИНАЛ: ${gameState.ending}\n`;
    content += '='.repeat(50) + '\n\n';
    content += 'ПОЛНАЯ ИСТОРИЯ:\n';
    gameState.story.forEach((event, i) => {
        content += `${i+1}. ${event}\n`;
    });
    content += `\nСТАТИСТИКА:\n`;
    content += `  Улики: ${gameState.stats.evidence}\n`;
    content += `  Уважение: ${gameState.stats.respect}\n`;
    content += `  Риск: ${gameState.stats.risk}\n`;
    content += `  Деньги: ${gameState.stats.money}$\n`;
    content += `  Ложь: ${gameState.stats.lies}\n`;
    content += `\nИНВЕНТАРЬ:\n`;
    gameState.bag.forEach(item => content += `  • ${item}\n`);
    
    localStorage.setItem('vegas_last_result', content);
    console.log('Game saved to localStorage:', content);
}

function autoSave() {
    localStorage.setItem('vegas_lastGame', JSON.stringify(gameState));
    if (currentUser) {
        users[currentUser].gameState = JSON.parse(JSON.stringify(gameState));
        localStorage.setItem('vegas_users', JSON.stringify(users));
    }
}