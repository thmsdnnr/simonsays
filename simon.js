window.onload=function() {

  //init audio context
  //HTML5 audio vendor prefixing
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  let GO = { //Global vars
  colors: {
    red: document.querySelector('div#red'),
    green: document.querySelector('div#green'),
    blue: document.querySelector('div#blue'),
    yellow: document.querySelector('div#yellow')
  },
  app:document.querySelector('div.app'),
  colorControls:document.querySelectorAll('div.control'),
  infoDiv:document.querySelector('div#info'),
  context:new AudioContext(),
  gainNode:'',
  round:1, //current round
  turns:20, //set to 20 for "normal" simon
  clickCt:0,
  strictMode:false,
  isOver:false,
  sounds:[],
  sel:["red","green","blue","yellow"],
  nameToNumber:{red:0,green:1,blue:2,yellow:3},
  randomSimon:Array(0), //initial value
  COLOR_DELAY:500, //in ms
  };

  GO.gainNode = GO.context.createGain();
  //load sounds over AJAX and put into buffers
  let soundNames=['ONE.mp3','TWO.mp3','THREE.mp3','FOUR.mp3'];
  let soundPromises=soundNames.map((s)=>loadSound(s));
  //once our sounds are loaded, start the game
  Promise.all(soundPromises).then(function(s){
    GO.sounds=s;
    setTimeout(gameInit,1000); //pause a tad bit so it doesn't start too immediately
  });

  function gameInit() {
    //add click handlers for controls
    let meta=document.querySelectorAll('.meta');
    meta.forEach((i)=>i.addEventListener('click',handleMeta));
    computerTurn();
  }

  function computerTurn()
  {
    unbindClicks();
    updateDisplay();
    GO.randomSimon.push(Math.floor(Math.random()*4));
    playSequence(()=>bindClicks());
  }

  function bindClicks() { GO.colorControls.forEach((c)=>c.addEventListener('click', handleClick)); }
  function unbindClicks() { GO.colorControls.forEach((c)=>c.removeEventListener('click', handleClick)); }
  function handleMeta(e) {
    (e.currentTarget.id==="reset") ? reset() : null;
    if(e.currentTarget.id==="strict") {
      GO.strictMode=!GO.strictMode;
      let sButton=document.querySelector('button#strict');
      (GO.strictMode) ? sButton.classList.add('enabled') : sButton.classList.remove('enabled');
    }
  }


  function nextRound() {
    if (GO.round!==GO.turns)
    {
      GO.round++;
      GO.clickCt=0;
      setTimeout(computerTurn,1000);
    }
    else
    {
      GO.isOver=true;
      updateDisplay("YOU WON YOU ARE SO GREAT!");
      setTimeout(reset,1000);
    }
  }

  function handleClick(e) { //logic to play sounds and check click inputs
    let expected = GO.randomSimon[GO.clickCt]; // correct next tile
    let actual = GO.nameToNumber[e.target.id]; // user-clicked tile
    //let selector=e.target.id;
    playTile(e.target.id);
    if (GO.clickCt<GO.randomSimon.length)
    {
      if (expected===actual) { GO.clickCt++; } //correct tile clicked, keep on a'going
    else { //wrong tile clicked
      if (GO.strictMode) { //if strict mode, reset and start again
        unbindClicks();
        updateDisplay("YOU LOST :( NOW WE START AGAIN.");
        setTimeout(reset,2000);
      }
      else { //repeat the sequence if not in strict mode and let the user try again
        GO.clickCt=0; //restart the user's input sequence
        unbindClicks();
        updateDisplay("Eh, not quite. Try again!");
        setTimeout(replaySequence,1000);
      }
    }
  }
  if ((GO.clickCt==GO.randomSimon.length)&&(!GO.isOver)) { //time for the next round
    unbindClicks();
    nextRound();
  }
}

  function reset() {
    GO.round=1;
    GO.clickCt=0;
    GO.isOver=false;
    GO.randomSimon=Array(0);
    computerTurn();
  }

  function updateDisplay(message) {
    let m=message||`Current Round: ${GO.round}`;
    GO.infoDiv.innerHTML=m;
  }

  //Functions for playing and replaying Simon Sequence
  function replaySequence() {
      playSequence(()=>{
      bindClicks();
      updateDisplay();
    });
  }

  function playSequence(cb) {
    GO.app.classList.remove('enabled');
    for (var i=0;i<GO.randomSimon.length;i++)
    {
      let selector=GO.sel[GO.randomSimon[i]];
      setTimeout(()=>playTile(selector),i*GO.COLOR_DELAY+10);
    }
    setTimeout(function(){
      cb();
      GO.app.classList.add('enabled');
    },GO.randomSimon.length*(GO.COLOR_DELAY+20));
  }

  //Play one tile with sound, accepts optional callback to execute on completion
  function playTile(color, cb) {
    let thisColor=GO.colors[color];
    thisColor.classList.add('animated');
    setTimeout(function(){thisColor.classList.remove('animated');},GO.COLOR_DELAY-100);
      //buffer the sound, play the sound
      let b = GO.context.createBufferSource();
      b.buffer = GO.sounds[GO.nameToNumber[color]];
      b.connect(GO.context.destination);
      b.start(0);
      //by ramping the amplitude we can eliminate some "click" noises on the samples
      GO.gainNode.gain.setTargetAtTime(1, GO.context.currentTime, 0.05);
      GO.gainNode.gain.setTargetAtTime(0.01, GO.context.currentTime, + b.buffer.duration-0.01);
      b.onended = function() {
        return (cb && typeof cb == "function") ? cb() : null;
      }
    }

  function loadSound(soundPath) {
    return new Promise(function(resolve, reject) {
      let getSound = new XMLHttpRequest();
        getSound.open("GET", `sounds/${soundPath}`, true);
        getSound.responseType = "arraybuffer";
        getSound.onload = function() {
          GO.context.decodeAudioData(getSound.response, function(buffer){
            resolve(buffer);
          });
        }
        getSound.send();
      });
    }
}
