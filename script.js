// Fetch and display movies
const movieListContainer = document.getElementById("movie-list");
const searchInput = document.getElementById("search");
const genreFilter = document.getElementById("genre-filter");
const platformFilter = document.getElementById("platform-filter");
const languageFilter = document.getElementById("language-filter"); // New language filter
const currentPageElement = document.getElementById("current-page");
const prevPageButton = document.getElementById("prev-page");
const nextPageButton = document.getElementById("next-page");

// Confirmation Modal Elements
const modal = document.getElementById("confirmation-modal");
const selectedMovieElement = document.getElementById("selected-movie");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const cancelBtn = document.getElementById("cancel-btn");
const confirmBtn = document.getElementById("confirm-btn");

let movies = [];
let currentPage = 1;
let totalPages = 1;
const moviesPerPage = 6;

// TMDB API URL and Key
const API_URL = "https://api.themoviedb.org/3";
const API_KEY = "3bb591b79b1619fb28cba74d12a4d335"; // Replace with your TMDB API key

// Fetch movie data
async function fetchMovies(query = "", genreId = "", rating = "", language = "", page = 1) {
    let url = `${API_URL}/discover/movie?api_key=${API_KEY}&page=${page}`;

    if (query) url = `${API_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=${page}`;
    if (genreId) url += `&with_genres=${genreId}`;
    if (rating) url += `&vote_average.gte=${rating}`;  // Filter by rating
    if (language) url += `&language=${language}`; // Filter by language

    const response = await fetch(url);
    const data = await response.json();
    movies = data.results;
    totalPages = data.total_pages;  // Update total pages
    renderMovies();
    updatePagination(data.page, totalPages);
}

// Render movies to the page
function renderMovies() {
    movieListContainer.innerHTML = "";
    if (movies.length === 0) {
        movieListContainer.innerHTML = "<p class='text-gray-600'>No movies found. Try different filters!</p>";
        return;
    }

    movies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.className = "bg-white shadow-md rounded overflow-hidden flex flex-col h-[450px]";

        // Generate star rating
        const ratingStars = generateStarRating(movie.vote_average);

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
                <!-- Movie Title -->
                <h3 class="movie-title" data-title="${movie.title}">
                    ${movie.title}
                </h3>

                <!-- Movie Genre -->
                <p class="text-sm text-gray-600 mb-2">Genre: ${getGenres(movie.genre_ids)}</p>

                <!-- Star Rating -->
                <div class="flex justify-center mb-3">
                    ${ratingStars}
                </div>

                <!-- Select Button -->
                <button 
                    class="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 transition-colors select-btn"
                    data-title="${movie.title}"
                >
                    Select
                </button>
            </div>
        `;

        movieCard.innerHTML = movieCardHTML;
        movieListContainer.appendChild(movieCard);

        // Check if the title is truncated and apply the scrolling effect if necessary
        const movieTitleElement = movieCard.querySelector(".movie-title");
        const titleWidth = movieTitleElement.offsetWidth;
        const containerWidth = movieTitleElement.parentElement.offsetWidth;

        if (titleWidth > containerWidth) {
            // Title is too wide, apply the scrolling effect
            movieTitleElement.classList.add("scrolling");
        } else {
            // Title fits, no need for scrolling effect
            movieTitleElement.classList.remove("scrolling");
        }
    });

    // Add event listeners for select buttons
    document.querySelectorAll(".select-btn").forEach(button => {
        button.addEventListener("click", () => openModal(button.getAttribute("data-title")));
    });
}

// Function to generate star rating (out of 5 stars)
function generateStarRating(voteAverage) {
    const maxStars = 5;
    const filledStars = Math.round(voteAverage / 2); // Convert rating to 0-5 scale
    let starHTML = "";

    for (let i = 1; i <= maxStars; i++) {
        if (i <= filledStars) {
            // Filled Star
            starHTML += `<span class="text-yellow-400 text-xl">&#9733;</span>`;
        } else {
            // Empty Star
            starHTML += `<span class="text-gray-300 text-xl">&#9734;</span>`;
        }
    }

    return starHTML;
}

// Function to map genre IDs to names
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
        37: "Western"
    };

    const genres = genreIds.slice(0, 2).map(id => genreMap[id] || "Unknown").join(", ");
    return genres || "Unknown";
}

// Update pagination controls
function updatePagination(page, totalPages) {
    currentPage = page;
    currentPageElement.textContent = `Page ${page} of ${totalPages}`;
    prevPageButton.disabled = page === 1;
    nextPageButton.disabled = page === totalPages;
}

// Fetch genres for the filter dropdown
async function fetchGenres() {
    const response = await fetch(`${API_URL}/genre/movie/list?api_key=${API_KEY}`);
    const data = await response.json();
    data.genres.forEach(genre => {
        const option = document.createElement("option");
        option.value = genre.id;
        option.textContent = genre.name;
        genreFilter.appendChild(option);
    });
}

// Open confirmation modal
function openModal(movieTitle) {
    selectedMovieElement.textContent = movieTitle;
    modal.style.display = "block";
}

// Close modal
function closeModal() {
    modal.style.display = "none";
}

// Confirm movie night
function confirmMovieNight() {
    const selectedMovie = selectedMovieElement.textContent;
    const date = dateInput.value;
    const time = timeInput.value;

    if (!date || !time) {
        alert("Please select a date and time!");
        return;
    }

    alert(`Movie Night Confirmed!\nMovie: ${selectedMovie}\nDate: ${date}\nTime: ${time}`);
    closeModal();
}

// New rating filter element
const ratingFilter = document.getElementById("rating-filter");

// Update the fetchMovies function to include the rating filter
ratingFilter.addEventListener("change", () => {
    const selectedRating = ratingFilter.value;

    let ratingValue = "";
    switch (selectedRating) {
        case "1":
            ratingValue = "2";  // 1 Star & Up corresponds to a minimum rating of 1
            break;
        case "2":
            ratingValue = "4";  // 2 Stars & Up corresponds to a minimum rating of 3
            break;
        case "3":
            ratingValue = "6";  // 3 Stars & Up corresponds to a minimum rating of 5
            break;
        case "4":
            ratingValue = "8";  // 4 Stars & Up corresponds to a minimum rating of 7
            break;
        case "5":
            ratingValue = "9";  // 5 Stars & Up corresponds to a minimum rating of 8
            break;
        default:
            ratingValue = "";  // No filter if no rating is selected
            break;
    }

    fetchMovies(searchInput.value, genreFilter.value, ratingValue, languageFilter.value, 1);
});

// Event Listeners
searchInput.addEventListener("input", () => fetchMovies(searchInput.value, genreFilter.value, 1));
genreFilter.addEventListener("change", () => fetchMovies(searchInput.value, genreFilter.value, 1));
prevPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
        fetchMovies(searchInput.value, genreFilter.value, ratingFilter.value, languageFilter.value, currentPage - 1);
    }
});
nextPageButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
        fetchMovies(searchInput.value, genreFilter.value, ratingFilter.value, languageFilter.value, currentPage + 1);
    }
});

cancelBtn.addEventListener("click", closeModal);
confirmBtn.addEventListener("click", confirmMovieNight);

// Initial fetch on page load
fetchGenres();
fetchMovies();
