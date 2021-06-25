var winMsg = document.getElementById("win");
var uscore = 0;
var cscore = 0;
var wins = 0;
var loses = 0;
var rock = document.getElementById("r");
var paper = document.getElementById("p");
var scissor = document.getElementById("s");
var user = document.getElementById("user");
var winnr = document.getElementById("winnerComp");
var userScore = document.getElementById("user-score");
var compScore = document.getElementById("comp-score");
var userwin = document.getElementById("winnerUser");
var u = document.getElementById("u");

const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataname)
};

function convert(word){
  if(word === "s") return "Qayçı";
  if(word === "p") return "Kağız";
  
  return "Daş";
}

function comp(){
  const choices = ["r","p","s"];
  const random = choices[Math.floor(Math.random() * choices.length)];
  
  return random;
}

function win(uc, cc){
  uscore++;
  if(uscore === 10){
    wins++;
    uscore = 0;
    userScore.innerHTML = uscore;
    userwin.innerHTML = wins;
  } else {
  userScore.innerHTML = uscore;
  compScore.innerHTML = cscore;
  }
  
  
 return winMsg.innerHTML = `Sən ${convert(uc)} seçdin, Robot isə ${convert(cc)} seçdi. Sən qalib gəldin!`;  
};

function lose(u, c){
  cscore++;
  if(cscore === 10){
    cscore = 0;
    loses++;
    compScore.innerHTML = cscore;
    winnr.innerHTML = loses;
  } else {
  userScore.innerHTML = uscore;
  compScore.innerHTML = cscore;
  }
  
  return winMsg.innerHTML = `Sən ${convert(u)} seçdin, Robot isə ${convert(c)} seçdi. Təəssüf ki, sən uduzdun. :(`;
}

function draw(ufc, cfc){
  return winMsg.innerHTML = `Sən ${convert(ufc)} seçdin, Robot da həmçinin ${convert(cfc)} seçdi. Bərabərə!`;
}

function game(user){
  const userChoice = user;
  const compChoice = comp();
  
  switch (userChoice + compChoice){
    case "rs":
    case "pr":
    case "sp":
      win(userChoice, compChoice)
      break;
    case "rp":
    case "ps":
    case "sr":
       lose(userChoice, compChoice)
      break;
    case "ss":
    case "pp":
    case "rr":
      draw(userChoice, compChoice)
      break;
 }
}

function main(){
  rock.addEventListener('click', () =>{
   game("r")
})
  
  scissor.addEventListener('click',() =>{
     game("s");
  })
  
  paper.addEventListener('click',() =>{
   game("p");
  })
}

main();