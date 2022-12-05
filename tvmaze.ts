import axios from "axios";
import * as $ from "jquery";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");
const API_URL = "https://api.tvmaze.com/search/shows";
const MISSING_IMG_URL = "https://tinyurl.com/tv-missing";

interface IShow {
  score: number;
  show: {
    id: number;
    name: string;
    summary: string;
    image?: {
      medium: string;
    };
  };
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<Array<IShow>> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const resp = await axios.get(API_URL, {
    params: { q: term },
  });
  return resp.data;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: Array<IShow>) {
  $showsList.empty();

  for (let show of shows) {
    console.log(show, "show");
    const { id, name, summary, image } = show.show;
    const $show = $(
      `<div data-show-id="${id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${image?.medium || MISSING_IMG_URL}"
              alt=${name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${name}</h5>
             <div><small>${summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
interface IEpisode {
  id: number;
  name: string;
  season: number;
  number: number;
}

/** Get episodes of a show.
 *
 * Given an id of a show
 *
 * returns a list of episodes for that show
 */
async function getEpisodesOfShow(id: number): Promise<IEpisode[]> {
  const { data } = await axios.get(
    `http://api.tvmaze.com/shows/${id}/episodes`
  );
  return data;
}

/** Write a clear docstring for this function... */

// function populateEpisodes(episodes) { }

/**
 * Add all episodes for a show to the DOM.
 *
 * Accepts a list of episodes
 *
 * Returns void.
 */
function populateEpisodes(episodes: IEpisode[]): void {
  $episodesArea.show();
  for (const { name, season, number } of episodes) {
    const $li = $(`<li>${name} (Season: ${season} Number: ${number})</li>`);
    $episodesList.append($li);
  }
}

/**
 * CLick event listener for episodes button.
 *
 * Get the id off the data attribute on the ancestor div.
 *
 * Populates the list area.
 */
$showsList.on(
  "click",
  "button.Show-getEpisodes",
  async function (evt: $.ClickEvent) {
    const id = $(evt.target).closest(".Show").data("show-id");
    const episodes = await getEpisodesOfShow(id);
    populateEpisodes(episodes);
  }
);
