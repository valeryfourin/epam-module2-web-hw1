const randomUserAPI = 'https://random-data-api.com/api/users/random_user';
const randomTextAPI = 'https://random-data-api.com/api/lorem_ipsum/random_lorem_ipsum';
const locationAPIbase = 'https://nominatim.openstreetmap.org/reverse';

const loadBtn = document.getElementById('loadBtn'),
      cards = document.getElementById('cards'),
      footer = document.getElementById('footer');

let userId = 1;

const smallColReviewCount = 2, bigColReviewCount = 3, colCount = 3;


async function renderItems(e) {
    e.target.classList.add('reviews__button--hidden');
    
    for (let i = 0; i < colCount; i++) {
        (i === 0 || i === 2) 
        ? 
        cards.appendChild(createColumn(i, smallColReviewCount))
        :
        cards.appendChild(createColumn(i, bigColReviewCount));
    }

    cards.classList.remove('cards--hidden');
}

function createColumn(key, reviewCount) {
    let cards__col = document.createElement('div');
    cards__col.classList.add('cards__col');

    for (let j = 0; j < reviewCount; j++) {
        let isHeadCard, isHorizCard;
        if (key === 0 && j === 0) {
            isHeadCard = true;
        } else if (key === 1 && j === 0) {
            isHeadCard = true;
            isHorizCard = true;
        };

        const response = fetchAllData([randomUserAPI, randomTextAPI]);
        response.then(result => {
            let user = result[0], text = result[1];
            cards__col.appendChild(createCard(user.first_name, user.last_name, user.employment.title, text.very_long_sentence, isHeadCard, isHorizCard))
        });
    }
    
    return cards__col;
}

function createCard(firstName, lastName, title, text, isHeadCard, isHorizCard) {
    let card = document.createElement('article');
    card.classList.add('card');
    if (isHorizCard) card.classList.add('card--horizontal');
    card.insertAdjacentHTML('afterbegin', `
    ${ isHeadCard ? `
        <div class="card__image">
            <div>
                <img src="images/client${userId}.png" alt="avatar">
            </div>
        </div>` 
        : ''}
    <div class="card__body">
        <div class="card__author">
            ${ isHeadCard ? '' : 
            `<div class="card__avatar">
                <img src="images/client${userId}.png" alt="avatar">
            </div>`
            }
            <footer class="card__info">
                <p class="card__name">${firstName} ${lastName}</p>
                <p class="card__role">${title}</p>
                <img class="card__rating" src="images/stars.png" alt="stars">
            </footer>
        </div>
        <p class="card__text">${text}</p>
    </div>
    `);
    userId < 8 ? userId++ : userId = 0;
    return card;
}

async function fetchData(url) {
    let data;
    try {
        const response = await fetch(url);
        data = response.json();
    } catch (e) {
        data = e;
    }
    return data;
}

async function fetchAllData(urls) {
    let requests, data;
    if (Array.isArray(urls)) {
        requests = urls.map(url => fetch(url));
    }
    data = Promise.all(requests)
        .then(responses => Promise.all(responses.map(res => res.json())));
    return data;
}

function displayLocation() {
    let address = "";

    function getCoords() {
        return new Promise(function (resolve, reject) {
            navigator.geolocation.getCurrentPosition(function (position) {
              resolve([position.coords.latitude, position.coords.longitude]);
            });
          });
    }

    async function setAddress(lat, lon) {
        const response = await fetch(`${locationAPIbase}?lat=${lat}&lon=${lon}&format=json`);
        let responseObj = await response.json();
        address = ` ${responseObj.address.country}, ${responseObj.address.city}, ${responseObj.address.road} ${responseObj.address.house_number}`;
        footer.innerText += address;
    }

    getCoords().then(res => setAddress(res[0], res[1]));
}

window.onload = function () {
    loadBtn.addEventListener('click', (e) => renderItems(e), false);
    displayLocation();
}