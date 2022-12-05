import axios from "axios";
import * as $ from 'jquery';

const DEFAULT_IMAGE_URL: string = "https://cdn.pixabay.com/photo/2022/11/19/09/35/forest-7601671_960_720.jpg";
const BASE_SHOW_API_URL: string = "http://api.tvmaze.com/search/shows";
const BASE_EPISODE_API_URL: string = "http://api.tvmaze.com/shows";
const $showsList: JQuery<HTMLElement> = $("#showsList");
const $episodesArea: JQuery<HTMLElement> = $("#episodesArea");
const $episodeList: JQuery<HTMLElement> = $("#episodesList");
const $searchForm: JQuery<HTMLElement> = $("#searchForm");
const $searchInput: JQuery<HTMLInputElement> = $("#searchForm-term");

interface ShowInterface {
  id: number;
  name: string;
  summary: string;
  image: string;
}

interface EpisodeInterface {
  id: number;
  name: string;
  season: number;
  number: number;
}

interface ShowInterfaceAPI {
  score: number;
  show: {};
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<Array<ShowInterface>> {

  let response = await axios.get(
    BASE_SHOW_API_URL,
    {params: {q: term}}
  );

  console.log('RESPONSE', response);

  const shows: Array<ShowInterface> = response.data.map((s: ShowInterfaceAPI) => ({ //TODO:Make a show API interface
    id: s.show.id,
    name: s.show.name,
    summary: s.show.summary,
    image: s.show.image?.medium || DEFAULT_IMAGE_URL
  }));

  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: Array<ShowInterface>): void {
  $showsList.empty();

  for (let show of shows) {
    const $show: JQuery<HTMLElement> = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt="Bletchly Circle San Francisco" //TODO: update to use show.name
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay(): Promise<void> {
  const term = $searchInput.val() as string;
  const shows = await getShowsByTerm(term); //TODO: need type

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt: JQuery.SubmitEvent): Promise<void> {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function searchForEpisodesAndDisplay(id: string): Promise<void> {
  $episodeList.empty();
  const episodes = await getEpisodesOfShow(id); //TODO: need type
  populateEpisodes(episodes);
}


async function getEpisodesOfShow(id: string): Promise<Array<EpisodeInterface>> {
  let response = await axios.get(
    `${BASE_EPISODE_API_URL}/${id}/episodes`
  );

  const episodes: Array<EpisodeInterface> = response.data.map(e => ({ //TODO: add a type for 'e'
    id: e.id,
    name: e.name,
    season: e.season,
    number: e.number
  }));

  return episodes;
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes: Array<EpisodeInterface>): void{
  $episodesArea.show();

  for (const episode of episodes) {
    const $episode: JQuery<HTMLElement> = $(
      `
        <li>
          <h5>${episode.name}</h5>
          <p>Season: ${episode.season}</p>
          <p>Episode: ${episode.number}</p>
        </li>
      `
    )
    $episodeList.append($episode);
  }
}

$showsList.on("click", "button", async function (evt: JQuery.ClickEvent): Promise<void> {
  console.log('button click');
  evt.preventDefault();
  const id: string = $(evt.target).closest('.Show').attr('data-show-id');
  console.log('SHOW ID', id);
  await searchForEpisodesAndDisplay(id);
});