let movies = [];
let currentPage = 1;
const moviesPerPage = 12;

/*
loads movies from movies.txt
Splits each line into new array element
*/
async function loadMovies() {
    const response = await fetch('http://localhost:5500/movies.txt');
    const text = await response.text();
    const titles = text.split('\n').filter(title => title.trim() !== '');
    const startIndex = (currentPage - 1) * moviesPerPage;
    const endIndex = startIndex + moviesPerPage;

    const moviePromises = titles.map(async (title, idx) => {
        const data = await fetchMovieData(title.split(' (')[0]);
        if (data) {
            movies.push(data);
            if (idx >= startIndex && idx <= endIndex) displayMovie(data);
        }
        return data;
    })

    await Promise.all(moviePromises); // Wait for all promises to resolve
    updatePaginationButtons();
}

function displayMovie(movie) {
    const movieList = document.getElementById('movie-list');
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
        <img src="${movie.Poster}" alt="${movie.Title} poster" onerror="this.src='placeholder.jpg'">
        <div class="movie-info">
            <h2>${movie.Title} (${movie.Year})</h2>
            <p><strong>Director:</strong> ${movie.Director}</p>
            <p><strong>Genre:</strong> ${movie.Genre}</p>
            <p><strong>IMDb Rating:</strong> ${movie.imdbRating}</p>
        </div>
    `;
    movieList.appendChild(card);
}

async function fetchMovieData(title) {
    try {
        const response = await fetch(`json/${title}.json`);
        if (!response.ok) throw new Error('Movie data not found');
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data for ${title}:`, error);
        return null;
    }
}

function displayMovies() {
    const movieList = document.getElementById('movie-list');
    movieList.innerHTML = '';

    const startIndex = (currentPage - 1) * moviesPerPage;
    const endIndex = startIndex + moviesPerPage;
    const moviesToDisplay = movies.slice(startIndex, endIndex);

    moviesToDisplay.forEach(movie => displayMovie(movie));

    updatePaginationButtons(moviesToShow.length);
}

function updatePaginationButtons() {
    const totalPages = Math.ceil(movies.length / moviesPerPage);

    document.getElementById('prev-page-top').disabled = currentPage === 1;
    document.getElementById('prev-page-bottom').disabled = currentPage === 1;
    document.getElementById('curr-page-top').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('curr-page-bottom').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('next-page-top').disabled = currentPage === totalPages;
    document.getElementById('next-page-bottom').disabled = currentPage === totalPages;
}

function prevPage() {
    currentPage--;
    updatePaginationButtons();
    displayMovies();
}

function nextPage() {
    currentPage++;
    updatePaginationButtons();
    displayMovies();
}

function searchMovies() {
    currentPage = 1;
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const filteredMovies = movies.filter(movie => 
        movie.Title.toLowerCase().includes(searchTerm) ||
        movie.Director.toLowerCase().includes(searchTerm) ||
        movie.Genre.toLowerCase().includes(searchTerm)
    );
    displayMovies(filteredMovies);
}

document.getElementById('search').addEventListener('input', searchMovies);

loadMovies();