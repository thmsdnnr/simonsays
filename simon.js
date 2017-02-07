window.onload=function() {

  let GO= {
  round:1, //current round
  turns:4, //set to 20 for normal simon
  clickCt:0,
  isOver:false,
  SEQUENCE_DELAY:400, //in ms
  COLOR_DELAY:500, //in ms
  sel:["#red","#green","#blue","#yellow"],
  numberToName:{red:0,green:1,blue:2,yellow:3},
  randomSimon:Array(0), //initial value
  strictMode:false};

  let inputs=document.querySelectorAll('input');
  inputs.forEach((i)=>i.addEventListener('click',handleMeta));
  console.log(inputs);
  computerTurn();

function handleMeta(e) {
    console.log('meta',e);
    console.log(e.currentTarget.id);
    if(e.currentTarget.id=="strict") {GO.strictMode=!GO.strictMode;}
    if(e.currentTarget.id=="reset") {reset(); console.log('reset');}
  }

function bindClicks() {
  let colorControls=document.querySelectorAll('div.control');
  colorControls.forEach((c)=>c.addEventListener('click', handleClick));
}

function unbindClicks() {
  let colorControls=document.querySelectorAll('div.control');
  colorControls.forEach((c)=>c.removeEventListener('click', handleClick));
}

function replaySequence() {
  console.log('replay');
  playSequence(function(){
    playerTurn();
  });
}

function computerTurn()
{
  console.log('computerturn');
  unbindClicks();
  updateDisplay();
  GO.randomSimon.push(Math.floor(Math.random()*4));
  playSequence(function() {
    playerTurn();
  });
}

function playerTurn() {
  console.log('playerturn');
  bindClicks();
  var interval = setInterval(function(){ //polling to check for next round
    if ((GO.clickCt==GO.randomSimon.length)&&(!GO.isOver)) {
    console.log('next round');
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
  playSound(color,null);
    if (GO.clickCt<GO.randomSimon.length)
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
            replaySequence();
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

function playSequence(cb) {
  for (var i=0;i<GO.randomSimon.length;i++)
  {
    let selector=GO.sel[GO.randomSimon[i]];
    setTimeout(function(){
      playAnim(selector);
    },i*GO.COLOR_DELAY);
  }
  setTimeout(function(){
    cb();
  },GO.randomSimon.length*GO.COLOR_DELAY);
}

function playAnim(sel, callback) {
  var color=sel.slice(1);
  document.querySelector(sel).classList.add('animated');
  playSound(color, function() {
      document.querySelector(sel).classList.remove('animated');
  });
}

  function playSound(color, cb) {
    var red = document.getElementById("s_red");
    var green = document.getElementById("s_green");
    var blue = document.getElementById("s_blue");
    var yellow = document.getElementById("s_yellow");
    var colors = {red:red,green:green,blue:blue,yellow:yellow};
    colors[color].currentTime=0;
    colors[color].play();
    colors[color].addEventListener('ended',function(){
      return (cb && typeof cb == "function") ? cb() : null;
    });
  }
}
