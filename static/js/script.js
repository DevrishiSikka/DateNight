// Fetch and display movies
const movieListContainer = document.getElementById("movie-list");
const searchInput = document.getElementById("search");
const genreFilter = document.getElementById("genre-filter");
const platformFilter = document.getElementById("platform-filter");
const currentPageElement = document.getElementById("current-page");
const prevPageButton = document.getElementById("prev-page");
const nextPageButton = document.getElementById("next-page");
const mainContainer = document.getElementsByTagName("main")[0];

// Confirmation Modal Elements
const modal = document.getElementById("confirmation-modal");
const selectedMovieElement = document.getElementById("selected-movie");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const cancelBtn = document.getElementById("cancel-btn");
const confirmBtn = document.getElementById("confirm-btn");
const sender = document.getElementById("sender-name")

// New rating filter element
const ratingFilter = document.getElementById("rating-filter");

// TMDB API URL and Key
const API_URL = "https://api.themoviedb.org/3";
const API_KEY = "3bb591b79b1619fb28cba74d12a4d335"; // Replace with your TMDB API key

let movies = [];
let currentPage = 1;
let totalPages = 1;

// Fetch movie data
async function fetchMovies(query = "", genreId = "", rating = "", page = 1) {
  let url = `${API_URL}/discover/movie?api_key=${API_KEY}&page=${page}`;

  if (query)
    url = `${API_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=${page}`;
  if (genreId) url += `&with_genres=${genreId}`;
  if (rating) url += `&vote_average.gte=${rating}`;

  const response = await fetch(url);
  const data = await response.json();
  movies = data.results;
  totalPages = data.total_pages;
  renderMovies();
  updatePagination(data.page, totalPages);
}

// Render movies to the page
function renderMovies() {
  movieListContainer.innerHTML = "";
  if (movies.length === 0) {
    movieListContainer.innerHTML =
      "<p class='text-gray-600'>No movies found. Try different filters!</p>";
    return;
  }

  movies.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.className = "movie-card";

    const movieCardHTML = `
      <div class="h-3/5">
        <img 
          src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
          alt="${movie.title}"
          class="w-full h-full object-cover"
          loading="lazy"
        >
      </div>
      <div class="p-4 h-5/5 flex flex-col text-center">
        <h3 class="movie-title" data-title="${movie.title}">${movie.title}</h3>
        <p class="text-sm text-gray-600 mb-2">Genre: ${getGenres(
          movie.genre_ids
        )}</p>
        <div class="flex justify-center mb-3">${generateStarRating(
          movie.vote_average
        )}</div>
        <button class="bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 transition-colors select-btn" data-title="${
          movie.title
        }">Select</button>
        <!-- Tooltip for Overview -->
        <div class="tooltip-content">
          ${movie.overview}
        </div>
      </div>
      </div>
    `;

    movieCard.innerHTML += movieCardHTML;
    movieListContainer.appendChild(movieCard);

    document.querySelectorAll(".select-btn").forEach((button) => {
      button.addEventListener("click", () =>
        openModal(button.getAttribute("data-title"))
      );
    });
  });
}

// Generate star rating
function generateStarRating(voteAverage) {
  const filledStars = Math.round(voteAverage / 2);
  let starHTML = "";

  for (let i = 1; i <= 5; i++) {
    starHTML +=
      i <= filledStars
        ? `<span class="text-yellow-400 text-xl">&#9733;</span>`
        : `<span class="text-gray-300 text-xl">&#9734;</span>`;
  }

  return starHTML;
}

// Map genre IDs to names
function getGenres(genreIds) {
  const genreMap = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sc-Fi",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
  };
  return (
    genreIds
      .map((id) => genreMap[id] || "Unknown")
      .slice(0, 2)
      .join(", ") || "Unknown"
  );
}

// Update pagination controls
function updatePagination(page, totalPages) {
  currentPage = page;
  currentPageElement.textContent = `Page ${page} of ${totalPages}`;
  prevPageButton.disabled = page === 1;
  nextPageButton.disabled = page === totalPages;
}

// Fetch genres for filter
async function fetchGenres() {
  const response = await fetch(
    `${API_URL}/genre/movie/list?api_key=${API_KEY}`
  );
  const data = await response.json();
  data.genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre.id;
    option.textContent = genre.name;
    genreFilter.appendChild(option);
  });
}

// Open modal
function openModal(movieTitle) {
  selectedMovieElement.textContent = movieTitle;
  modal.style.display = "flex";
  mainContainer.style.filter = "blur(5px)";
}

// Close modal
function closeModal() {
  modal.style.display = "none";
  mainContainer.style.filter = "blur(0px)";
}

// Get recipients
function getRecipients() {
  const recipientContainer = document.getElementById("recipient-container");
  const recipientItems =
    recipientContainer.getElementsByClassName("recipient-item");
  const recipients = [];

  Array.from(recipientItems).forEach((item) => {
    const nameInput = item.querySelector("input[type='text']");
    const emailInput = item.querySelector("input[type='email']");
    if (nameInput.value && emailInput.value) {
      recipients.push({ name: nameInput.value, email: emailInput.value });
    }
  });

  return recipients;
}

// Confirm movie night
async function confirmMovieNight() {
  const selectedMovie = selectedMovieElement.textContent;
  const date = dateInput.value;
  const time = timeInput.value;
  const senderName = sender.value;
  const recipients = getRecipients();

  if (!date || !time) {
    alert("Please select a date and time!");
    return;
  }

  if (recipients.length === 0) {
    alert("Please add at least one recipient!");
    return;
  }

  const movieNightDetails = { movie: selectedMovie, date, time, senderName, recipients };
  console.log("Movie Night Details:", movieNightDetails);

  try {
    const response = await fetch('/sendEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movieNightDetails),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(result);
      alert(
        `Email sent successfully! Movie Night Confirmed! Movie: ${selectedMovie}, Date: ${date}, Time: ${time}`
      );
      closeModal();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || 'Failed to send email.'}`);
    }
  } catch (err) {
    alert(`An unexpected error occurred: ${err.message}`);
    console.error('Error:', err);
  }
}

// Add recipient field
document.getElementById("add-recipient-btn").addEventListener("click", () => {
  const recipientContainer = document.getElementById("recipient-container");
  const newRecipientItem = document.createElement("div");
  newRecipientItem.className = "recipient-item flex gap-4 mb-2";

  newRecipientItem.innerHTML = `
    <input type="text" placeholder="Recipient Name" class="w-full p-2 border rounded">
    <input type="email" placeholder="Recipient Email" class="w-full p-2 border rounded">
  `;

  recipientContainer.appendChild(newRecipientItem);
});

// Initial fetch
fetchGenres();
fetchMovies();
cancelBtn.addEventListener("click", closeModal);
confirmBtn.addEventListener("click", confirmMovieNight);
searchInput.addEventListener("input", () =>
  fetchMovies(searchInput.value, genreFilter.value, ratingFilter.value, 1)
);
genreFilter.addEventListener("change", () =>
  fetchMovies(searchInput.value, genreFilter.value, ratingFilter.value, 1)
);
ratingFilter.addEventListener("change", () =>
  fetchMovies(searchInput.value, genreFilter.value, ratingFilter.value, 1)
);
prevPageButton.addEventListener("click", () =>
  fetchMovies(
    searchInput.value,
    genreFilter.value,
    ratingFilter.value,
    currentPage - 1
  )
);
nextPageButton.addEventListener("click", () =>
  fetchMovies(
    searchInput.value,
    genreFilter.value,
    ratingFilter.value,
    currentPage + 1
  )
);

