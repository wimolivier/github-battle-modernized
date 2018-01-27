const axios = require('axios');

const getProfile = (username) => axios.get(`https://api.github.com/users/${username}`)
  .then((user) => user.data);

const getRepos = (username) => axios.get(`https://api.github.com/users/${username}/repos?per_page=100`);

const getStarCount = (repos) => repos.data.reduce((count, repo) => (count + repo.stargazers_count), 0);

const calculateScore = (profile, repos) => {
  const followers = profile.followers;
  const totalStars = getStarCount(repos);

  return (followers * 3 + totalStars);
}

const handleError = (error) => {
  console.log(error);
  return null;
}

const getUserData = (player) => Promise.all([
  getProfile(player),
  getRepos(player)
]).then((data) => {
  const profile = data[0];
  const repos = data[1];

  return {
    profile,
    score: calculateScore(profile, repos)
  }
});

const sortPlayers = (players) => players.sort((a, b) => b.score - a.score);               // From MDN: To compare numbers instead of strings, the compare function can simply subtract b from a);

module.exports = {
  battle: (players) => axios.all(players.map(getUserData))
    .then(sortPlayers)
    .catch(handleError),
  fetchPopularRepos: (language) => {
    var encodedURI = window.encodeURI(`https://api.github.com/search/repositories?q=stars:>1+language:${language}&sort=stars&order=desc&type=Repositories`);

    return axios.get(encodedURI)
      .then((response) => response.data.items);
  }
}