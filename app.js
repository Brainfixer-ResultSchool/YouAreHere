'use strict';

const GEOCODE_API_KEY = '1313977089914138472x18455';

const btn = document.querySelector('.footer__btn');
const flagsContainer = document.querySelector('.flags');

const snd = new Audio();
snd.srс = 'sound.mp3';

document.addEventListener('click', (e) => {
  flagsContainer
    .querySelectorAll('.flag')
    .forEach((f) => f.classList.remove('active'));
  const flag = e.target.closest('.flag');
  if (flag) {
    flag.classList.add('active');
    snd.play();
  }
});

function displayCountry(data, neighbour = false) {
  const html = `
		<div class="flag ${neighbour ? 'flag-neighbour' : ''}">
			<div class="flag__front">
				<img class="flag__img" src="${data.flags.png}" />
			</div>
			<div class="flag__back">
				<h3 class="country__name">${data.name.common}</h3>
				<h4 class="country__region">${data.region}</h4>
				<div class="country__info-img">👨‍👩‍👧‍👦</div>
				<p class="country__row">
					${(+data.population / 1000000).toFixed(1)} million
				</p>
				<div class="country__info-img">🗣️</div>
				<p class="country__row">${Object.values(data.languages).join('<br>')}</p>
				<div class="country__info-img">💰</div>
				<p class="country__row">
				${Object.values(data.currencies)
          .map((c) => `${c.symbol}: ${c.name}`)
          .join('<br>')}
				</div>
			</div>
		</div>
  `;
  flagsContainer.insertAdjacentHTML('beforeend', html);
  flagsContainer.style.opacity = 1;
}

function getCountryData(country) {
  flagsContainer.innerHTML = '';
  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then((response) => {
      if (!response.ok) throw 'Не удалось получить данные.';
      return response.json();
    })
    .then((data) => {
      [data] = data;
      displayCountry(data);
      return data.borders;
    })
    .then((borders) => {
      if (!borders)
        countriesContainer.insertAdjacentHTML(
          'beforeend',
          'Соседних стран нет.'
        );
      return Promise.all(
        borders.map((border) =>
          fetch(`https://restcountries.com/v3.1/alpha/${border}`)
        )
      );
    })
    .then((borderResponses) => {
      return Promise.all(borderResponses.map((response) => response.json()));
    })
    .then((countries) => {
      countries.forEach((country) => {
        [country] = country;
        displayCountry(country, true);
      });
    })
    .catch((err) => console.log(err.message));
}

async function displayCountryByGPS(lat, lng) {
  const response = await fetch(
    `https://geocode.xyz/${lat},${lng}?geoit=json&auth=${GEOCODE_API_KEY}`
  );
  if (!response.ok) return;
  const json = await response.json();
  const { country, city } = json;
  console.log(`You are in ${city}, ${country}`);

  getCountryData(country.toLowerCase());
}

btn.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      displayCountryByGPS(latitude, longitude);
    },
    () => displayCountryByGPS(55.751, 37.617)
  );
});
