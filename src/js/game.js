const simpleLevelPlan = `
.................................................#
..#......=.......................................#
..#....................o.........................#
..#.........o.o..###|.###..#.........o.o....######
..#.@......#####...#.......#........######..#.....
..#####............#....o..#####............#.....
......#++++++++++++#...........#++##++++++++#.....
......##############+++++++++++##############.....
..................................................`;

function overlap(actor1, actor2) {
    return actor1.pos.x + actor1.size.x > actor2.pos.x && 
        actor1.pos.x < actor2.pos.x + actor2.size.x &&
        actor1.pos.y + actor1.size.y > actor2.pos.y && 
        actor1.pos.y < actor2.pos.y + actor2.size.y;
}

function trackKeys(keys) {
    const down = Object.create(null);

    function track(e) {
        console.log(down);
        if (keys.includes(e.key)) {
            down[e.key] = e.type == 'keydown';
            e.preventDefault();
        }
    }

    window.addEventListener('keydown', track);
    window.addEventListener('keyup', track);

    return down;
}

const arrowKeys = trackKeys([ 'ArrowLeft', 'ArrowRight', 'ArrowUp' ]);

let paused = false;

window.addEventListener('keypress', (e) => {
    if (e.key == 'p') paused = !paused;
});

function runAnimation(frameFn) {
    let lastTime = null;

    function frame(time) {
        if (!paused) {
            if (lastTime != null) {
                const timeStep = Math.min(time - lastTime, 100) / 1000;
                if (frameFn(timeStep) === false) return;
            }
            lastTime = time;
        }

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

function runLevel(level, Display) {
    let display = new Display(document.body, level);
    let state = State.start(level);
    let ending = 1;

    return new Promise(resolve => {
        runAnimation(time => {
            state = state.update(time, arrowKeys);
            display.syncState(state);

            if (state.status == 'playing') {
                return true;
            } else if (ending > 0) {
                ending -= time;
                return true;
            } else {
                display.clear();
                resolve(state.status);
                return false;
            }
        });
    });
}

async function runGame(plans, Display) {
    for (let level = 0; level < plans.length;) {
        let status = await runLevel(new Level(plans[level]), Display);

        if (status == 'won') level++;
    }
    console.log('You\'ve won!');
}