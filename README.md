#SIMON SAYS
Simon Says game using Vanilla JS, WebAudio API, and sound FX I synthesized myself in Logic Pro :)

Game loop:

COMPUTER TURN -> Generate random sequence.

Play random sequence.
FOR EACH RANDOM THING:
  ->Indicate tile press
  ->Play sound. When sound done, callback to next tile press.
->When done, give control to Player.

With each player press:

FOR EACH tile in the sequence:
  ->On click:
    ->Indicate tile press
    ->Play sound. When sound done, check to see if correct.
    ->IF correct and not at end of sequence, continue to next.
    ->IF incorrect
      ->IF strict mode, reset
      ->ELSE replay sequence and give control back to Player
    ->IF correct and at end of sequence, NEXT turn.

NEXT turn:
  turn count ++
  if this turn is < maxTurns
    ->Add one random tile to random sequence
  else
    ->Player Won! Display nice message and reset board.

RESET board:
  turn count = 1
  random sequence = blank
  computer turn.
