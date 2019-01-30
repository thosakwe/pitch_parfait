var notes = {
  C: 261.63,
  "C#": 277.18,
  D: 293.66,
  "D#": 311.13,
  E: 329.63,
  F: 349.23,
  "F#": 369.99,
  G: 392.0,
  "G#": 415.3,
  A: 440.0,
  "A#": 466.16,
  B: 493.88
};

$(function() {
  $("#start-button").click(function() {
    $("#landing").hide();
    $("#game").show();
    $(".buttons").show();
    $("#difficulty").change(function() {
      var val = $(this).val();
      var game = loadGame();
      if (val !== game.mode) {
        game.mode = val;
        saveGame(game);
        updateHud(game);
      }
    });

    var game = loadGame();
    updateHud(game);
    doTurn(game);
  });

  $("#replay").click(function() {
    playTones(loadGame());
  });

  $("#submit").click(function() {
    submitGame(loadGame());
  });

  $("#restart").click(function() {
    if (confirm("Really delete all saved progress, and start again?")) {
      localStorage.removeItem("game");
      var game = loadGame();
      updateHud(game);
      doTurn(game);
    }
  });

  $(".buttons button").click(function() {
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
    } else {
      var game = loadGame();
      $(this).addClass("selected");
      submitGame(game);
    }
  });
});

function submitGame(game) {
  var selectedNotes = $("button.selected").map(function() {
    return $(this)
      .text()
      .trim();
  });
  selectedNotes.sort();

  if (game.tones.length <= selectedNotes.length) {
    var success = true;

    for (var i = 0; i < game.tones.length; i++) {
      if (selectedNotes[i] !== game.tones[i]) {
        success = false;
        break;
      }
    }

    game.total++;

    if (success) {
      game.correct++;
    } else {
      var s = game.tones.join(", ");
      alert("Incorrect! Answer: " + s);
    }

    game.tones = [];
    saveGame(game);
    updateHud(game);
    doTurn(game);
  }
}

function doTurn(game) {
  // Scoreboard
  var tones = (game.tones = pickTones(game));
  $("button.selected").removeClass("selected");
  $("#turn").text("Turn " + (game.total + 1));
  $("#tones").text(tones.length + " tone(s)");
  saveGame(game);

  // Play the tones.
  playTones(game);
}

function playTones(game) {
  var synth = new Tone.PolySynth().toMaster();
  var octave = 4;

  if (game.mode != "hard") {
    octave += Math.floor(Math.random() * 2) - 1;
  } else {
    octave += Math.floor(Math.random() * 4) - 2;
  }

  for (var i in game.tones) {
    var note = game.tones[i];

    synth.triggerAttackRelease(note + octave, 1);
  }
}

function pickTones(game) {
  if (game.tones && game.tones.length) return game.tones;

  // How many tones?
  var maxTones = 1,
    toneCount;
  if (game.mode === "medium") maxTones = 2;
  else if (game.mode === "hard") maxTones = 3;
  toneCount = Math.floor(Math.random() * maxTones) + 1;

  // Pick tones
  var tones = [];

  for (var i = 0; i < toneCount; i++) {
    var tone;

    while (!tone || tones.indexOf(tone) !== -1) {
      var keys = Object.keys(notes);
      var idx = Math.floor(Math.random() * keys.length);
      tone = keys[idx];
    }

    tones.push(tone);
  }

  tones.sort();
  return tones;
}

function updateHud(game) {
  $("#scoreboard").text("Correct: " + game.correct + "/" + game.total);
  $("#difficulty").val(game.mode);
}

function loadGame(game) {
  if (localStorage.getItem("game")) {
    return JSON.parse(localStorage.getItem("game"));
  } else {
    return saveGame({
      mode: "easy",
      total: 0,
      correct: 0,
      tones: []
    });
  }
}

function saveGame(game) {
  localStorage.setItem("game", JSON.stringify(game));
  return game;
}
