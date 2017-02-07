window.onload=function() {

  let GO= {
  round:1, //current round
  turns:4, //set to 20 for normal simon
  clickCt:0,
  isOver:false,
  SEQUENCE_DELAY:400, //in ms
  sel:["#red","#green","#blue","#yellow"],
  numberToName:{red:0,green:1,blue:2,yellow:3},
  randomSimon:Array(0), //initial value
  strictMode:false};
  //had div.app before


computerTurn();
document.querySelector('input').addEventListener('click',handleMeta)

function handleMeta(e) {
    console.log(e);
    console.log(e.currentTarget.id);
    if(e.currentTarget.id=="strict") {GO.strictMode=!GO.strictMode;}
    if(e.currentTarget.id=="reset") {reset();}
  }

function bindClicks() {
  let colorControls=document.querySelectorAll('div.control');
  colorControls.forEach((c)=>c.addEventListener('click', handleClick));
  console.log("bound clicks");
}
function unbindClicks() {
  let colorControls=document.querySelectorAll('div.control');
  colorControls.forEach((c)=>c.removeEventListener('click', handleClick));
  console.log("UNbound clicks");
}

function replaySequence() {
  console.log(GO.randomSimon);
  playSequence(GO.randomSimon);
  setTimeout(bindClicks,((GO.SEQUENCE_DELAY*GO.randomSimon.length)+400));
}

function computerTurn()
{
  unbindClicks();
  updateDisplay();
  GO.randomSimon.push(Math.floor(Math.random()*4));
  playSequence(GO.randomSimon);
  setTimeout(playerTurn,(GO.SEQUENCE_DELAY*GO.randomSimon.length+400));
}

function playerTurn() {
  bindClicks();
  var interval = setInterval(function(){
    if ((GO.clickCt==GO.randomSimon.length)&&(!GO.isOver)) {
    unbindClicks();
    clearInterval(interval);
    nextRound();
  }},10);
}

function nextRound() {
  if (GO.round!==GO.turns)
  {
    GO.round++;
    GO.clickCt=0;
    console.log("nextRound Round: "+GO.round+" nextRound clickCt: "+GO.clickCt);
    setTimeout(computerTurn,1000);
  }
  else
  {
    GO.isOver=true;
    document.querySelector('div#info').innerHTML="YOU WON YOU ARE SO GREAT!";
    setTimeout(reset,1000);
  }
}

function handleClick(e) { //logic to play sounds and check click inputs
  console.log('clicked on',e.target.id);
  var color=e.target.id;
  playSound(color);
  if (GO.clickCt<GO.randomSimon.length) //where 10 is really GO.turns on turn=10
  {
    var expected = GO.randomSimon[GO.clickCt];
    var actual = GO.numberToName[e.target.id]; // input value

    if (actual!=undefined) // will be undefined if click on board but not on a tile with a target
    {
      if (expected===actual)
      {
        console.log("right");
        console.log("clickCt: "+GO.clickCt+" expected: "+expected+" actual: "+actual);
        GO.clickCt++;
      }
      else
      {
        console.log("wrong");
        console.log("clickCt: "+GO.clickCt+" expected: "+expected+" actual: "+actual);
        //repeat playing the sequence if not in strict mode, otherwise reset and start again
        if (GO.strictMode)
        {
        unbindClicks();
        document.querySelector('div#info').innerHTML="YOU LOST :( NOW WE START AGAIN.";
        setTimeout(reset,2000);
        }
        else
        {
          GO.clickCt=0;
          unbindClicks();
          document.querySelector('div#info').innerHTML="Eh, not quite. Try again!";
          setTimeout(replaySequence,600); // rebind clicks after sequence is played through callback
        }
      }
    }
    else {
      console.log("UNDEFINED");
      console.log("clickCt: "+GO.clickCt+" expected: "+expected+" actual: "+actual);
    }
  }
}

function reset() {
  GO.round=1;
  GO.clickCt=0;
  GO.isOver=false;
  GO.randomSimon=Array(0);
  computerTurn();
}

function updateDisplay() {
  document.querySelector('div#info').innerHTML="Current Round: "+GO.round;
}

function playSequence(seq) {
  for (var i=0;i<seq.length;i++) {
  var selector=GO.sel[seq[i]];
  playAnim(selector,GO.SEQUENCE_DELAY*i);
  }
}

function playSound(color) {
  console.log('playing sound');
  var red = document.getElementById("s_red");
  var green = document.getElementById("s_green");
  var blue = document.getElementById("s_blue");
  var yellow = document.getElementById("s_yellow");
  var colors = {red:red,green:green,blue:blue,yellow:yellow};
  colors[color].currentTime=0;
  colors[color].play();
}

function playAnim(sel, delay) {
  GO.animTimeout = setTimeout(function(){
  var color=sel.slice(1);
  playSound(color);
  document.querySelector(sel).classList.add('animated');
  setTimeout(function(){document.querySelector(sel).classList.remove('animated');},GO.SEQUENCE_DELAY);
  },delay);
}

}
