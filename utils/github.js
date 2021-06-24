const axios = require("axios")

async function getGithubUser(token){
    let user = await axios.get("https://api.github.com/user", {
      headers : {
        Authorization : "token " + token
      }
    })
    
    return user.data
}

module.exports = {
    getGithubUser
};