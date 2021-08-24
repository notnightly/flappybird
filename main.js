import { Canvas } from "https://deno.land/x/sdl2@0.1-alpha.5/src/canvas.ts";

const canvas = new Canvas({
  title: "Flappy Bird in Deno 🐦",
  height: 400,
  width: 800,
  centered: true,
  fullscreen: false,
  hidden: false,
  resizable: false,
  minimized: false,
  maximized: false,
});

const gravity = 1;

function checkCollision(
  x1,
  y1,
  w1,
  h1,
  x2,
  y2,
  w2,
  h2,
) {
  return !(x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2);
}

const font = canvas.loadFont(
  "./fonts/mainfont.ttf",
  128,
  { style: "normal" },
);

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let playerX = 170;
let playerY = 100;
let is_space = false;

// Score value
let score_value = 0;

const upperPipes = [];
const lowerPipes = [];

const UPPER_PIPE_Y = 0;
const LOWER_PIPE_Y_BASE = 800;
const PIPE_WIDTH = 52;
const PIPE_DISTANCE = 320;
const GAP = 180;

let x_font = 0, y_font = 0;
let gameOver = false;
let intro = true;

upperPipes.push({ x: 400 + PIPE_WIDTH, height: getRandomInt(100, 200) });
upperPipes.push({
  x: 400 + (PIPE_WIDTH * 2) + PIPE_DISTANCE,
  height: getRandomInt(100, 200),
});

// Screen width - Corresponding upper pipe height - Random Gap
lowerPipes.push({
  x: 400 + PIPE_WIDTH,
  height: 800 - upperPipes[0].height - GAP,
});
lowerPipes.push({
  x: 400 + (PIPE_WIDTH * 2) + PIPE_DISTANCE,
  height: 800 - upperPipes[1].height - GAP,
});

const birdSurfaceMidflap = canvas.loadSurface("images/yellowbird-midflap.png");
const birdTextureMidflap = canvas.createTextureFromSurface(birdSurfaceMidflap);

const birdSurfaceUpflap = canvas.loadSurface("images/yellowbird-upflap.png");
const birdTextureUpflap = canvas.createTextureFromSurface(birdSurfaceUpflap);

const birdSurfaceDownflap = canvas.loadSurface(
  "images/yellowbird-downflap.png",
);
const birdTextureDownflap = canvas.createTextureFromSurface(
  birdSurfaceDownflap,
);

const BgScreenSurface = canvas.loadSurface("images/background.png");
const BgScreenTexture = canvas.createTextureFromSurface(BgScreenSurface);

const pipeSurfaceUp = canvas.loadSurface("images/pipe-up.png");
const pipeTextureUp = canvas.createTextureFromSurface(pipeSurfaceUp);

const pipeSurfaceDown = canvas.loadSurface("images/pipe-down.png");
const pipeTextureDown = canvas.createTextureFromSurface(pipeSurfaceDown);

const birdTextures = [
  birdTextureUpflap,
  birdTextureMidflap,
  birdTextureDownflap,
];
let animationCycle = 0; // 0, 1, 2

let prevTime = performance.now();

canvas.on("draw", () => {
  if (intro) {
    return;
  }

  const currTime = performance.now();
  const deltaTime = currTime - prevTime;
  prevTime = currTime;

  canvas.copy(BgScreenTexture, { x: 0, y: 0, width: 400, height: 800 }, {
    x: 0,
    y: 0,
    width: 400,
    height: 800,
  });

  for (let idx = 0; idx < upperPipes.length; idx++) {
    if (
      checkCollision(
        playerX,
        playerY,
        34,
        24,
        upperPipes[idx].x,
        UPPER_PIPE_Y,
        PIPE_WIDTH,
        upperPipes[idx].height,
      ) ||
      checkCollision(
        playerX,
        playerY,
        34,
        24,
        lowerPipes[idx].x,
        LOWER_PIPE_Y_BASE - lowerPipes[idx].height,
        PIPE_WIDTH,
        lowerPipes[idx].height,
      )
    ) {
      // Only runs once
      if (!gameOver) {
        gameOver = true;
        canvas.playMusic(
          "./audio/game_over.wav",
        );
        canvas.present();
      }
    }
    if (
      checkCollision(
        playerX + 50 / 2,
        playerY,
        0,
        50,
        upperPipes[idx].x + PIPE_WIDTH / 2,
        upperPipes[idx].height,
        0,
        800 - upperPipes[idx].height - lowerPipes[idx].height,
      )
    ) {
      score_value += 1;
      let score_effects = ["scored_1.wav", "scored_2.wav"];
      canvas.playMusic(
        "./audio/" + score_effects[Math.floor(Math.random() * 2)],
      );
    }

    // Debug:
    // canvas.fillRect(playerX + 50 / 2, playerY, 0, 50)
    // canvas.fillRect(upperPipes[idx].x + PIPE_WIDTH / 2, upperPipes[idx].height, 0, 800 - upperPipes[idx].height - lowerPipes[idx].height);

    // Pipes
    canvas.copy(pipeTextureDown, { x: 0, y: 0, width: 52, height: 320 }, {
      x: upperPipes[idx].x,
      y: UPPER_PIPE_Y,
      width: PIPE_WIDTH,
      height: upperPipes[idx].height,
    });
    canvas.copy(pipeTextureUp, { x: 0, y: 0, width: 52, height: 320 }, {
      x: lowerPipes[idx].x,
      y: LOWER_PIPE_Y_BASE - lowerPipes[idx].height,
      width: PIPE_WIDTH,
      height: lowerPipes[idx].height,
    });
    canvas.copy(birdTextures[animationCycle], {
      x: 0,
      y: 0,
      width: 34,
      height: 24,
    }, {
      x: playerX,
      y: playerY,
      width: 34,
      height: 24,
    });
    if (!gameOver) {
      // Wing animation
      animationCycle += 1;
      if (animationCycle >= 3) {
        animationCycle = 0;
      }

      upperPipes[idx].x -= 1;
      lowerPipes[idx].x -= 1;
      if (upperPipes[idx].x <= -PIPE_WIDTH) {
        upperPipes[idx].x = 800 + PIPE_WIDTH;
        upperPipes[idx].height = getRandomInt(100, 200);
        lowerPipes[idx].x = 800 + PIPE_WIDTH;
        lowerPipes[idx].height = 800 - upperPipes[idx].height - GAP;
      }

      if (playerY >= 800 - 50) {
        gameOver = true;

        canvas.playMusic(
          "./audio/game_over.wav",
        );
      }
    }
    canvas.renderFont(font, score_value.toString(), {
      blended: { color: { r: 255, g: 255, b: 255, a: 255 } },
    }, {
      x: 10,
      y: -20,
    });
    if (is_space) {
      playerY -= 50;
      is_space = false;
    } else {
      // Give player gravity downwards
      playerY += gravity;
    }
    if (playerY >= 800 - 50) {
      playerY = 800 - 50;
    }
  }

  canvas.present();
  Deno.sleepSync(10);
});

canvas.on("event", (e) => {
  if (e.type == "quit") {
    canvas.quit();
  }
  if (e.type == "key_down") {
    // Space
    if (e.keycode == 32 && !gameOver) {
      intro = false;
      is_space = true;
    }
  }
});

canvas.clear();

canvas.copy(BgScreenTexture, { x: 0, y: 0, width: 400, height: 800 }, {
  x: 0,
  y: 0,
  width: 400,
  height: 800,
});

const height = Math.floor(170 / 3) - 25;

canvas.renderFont(font, "flappybird!", {
  blended: { color: { r: 255, g: 255, b: 255, a: 255 } },
}, {
  x: (400 / 2) - 130,
  y: (800 / 2) - (2 * height),
  width: Math.floor(770 / 5),
  height,
});

const width = Math.floor(770 / 3);

canvas.renderFont(font, "Press Space to start", {
  blended: { color: { r: 255, g: 255, b: 255, a: 255 } },
}, {
  x: (400 / 2) - 130,
  y: (800 / 2) - height,
  width,
  height,
});

canvas.present();

await canvas.start();
