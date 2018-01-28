import axios from 'axios';

const getProfile = (username) => axios.get(`https://api.github.com/users/${username}`)
  .then(({ data }) => data);

const getRepos = (username) => axios.get(`https://api.github.com/users/${username}/repos?per_page=100`);

const getStarCount = (repos) => repos.data.reduce((count, { stargazers_count }) => (count + stargazers_count), 0);

const calculateScore = ({ followers }, repos) => followers * 3 + getStarCount(repos);

const handleError = (error) => {
  console.log(error);
  return null;
}

const getUserData = (player) => Promise.all([             // include babel-polyfill to be able to use 'Promise' (webpack.config.js)
  getProfile(player),
  getRepos(player)
]).then(([profile, repos]) => ({                          // destructure the array received
  profile,
  score: calculateScore(profile, repos)
})
  );

const sortPlayers = (players) => players.sort((a, b) => b.score - a.score);               // From MDN: To compare numbers instead of strings, the compare function can simply subtract b from a);

export const battle = (players) => Promise.all(players.map(getUserData)).then(sortPlayers).catch(handleError);

export const fetchPopularRepos = (language) => {
  const encodedURI = window.encodeURI(`https://api.github.com/search/repositories?q=stars:>1+language:${language}&sort=stars&order=desc&type=Repositories`);

  return axios.get(encodedURI).then(({ data }) => data.items);
}