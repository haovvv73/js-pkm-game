// dom element
const canvas = document.querySelector('canvas')
const game = canvas.getContext('2d')

// size game
canvas.width = 1280;
canvas.height = 700;

// MAP img
const mapimg = new Image()
mapimg.src = './static/img/pkmjsmap.png'

// PLAYER img
const playerimg = new Image()
playerimg.src = './static/img/playerDown.png'
const playerUpimg = new Image()
playerUpimg.src = './static/img/playerUp.png'
const playerLeftimg = new Image()
playerLeftimg.src = './static/img/playerLeft.png'
const playerRightimg = new Image()
playerRightimg.src = './static/img/playerRight.png'

// BATTLE img
const constbattleimg = new Image()
constbattleimg.src = './static/img/battleBackground.png'

const embyimg = { src: './static/img/embySprite.png' }
const draggleimg = { src: './static/img/draggleSprite.png' }

// FOREGROUND img
const foreGroundimg = new Image()
foreGroundimg.src = './static/img/foreground.png'

// ------------------------- map and player -----------------------------------------
// default coordinate display game
const offset = {
    x: -1720,
    y: -750,
}
const backGround = new Sprite({
    position: {
        x: offset.x,
        y: offset.y,
    },
    veclo: 0,
    image: mapimg,
})
const player = new Sprite({
    position: {
        x: canvas.width / 2 - 10,
        y: canvas.height / 2 + 10,
    },
    veclo: 0,
    image: playerimg,
    frames: {
        max: 4,
        hold: 12,
    },
    sprites: {
        up: playerUpimg,
        down: playerimg,
        left: playerLeftimg,
        right: playerRightimg,
    }
})
const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y,
    },
    veclo: 0,
    image: foreGroundimg,
})

// flag move
const key = {
    up: false,
    down: false,
    left: false,
    right: false,
    lastKey: '',
}

// ACTION : move
// turn on move
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        // ---- case 1 ---
        case 's':
            key.down = true;
            key.lastKey = 's'
            break;
        case 'w':
            key.up = true;
            key.lastKey = 'w'
            break;
        case 'd':
            key.right = true;
            key.lastKey = 'd'
            break;
        case 'a':
            key.left = true;
            key.lastKey = 'a'
            break;
        // ---- case 2  ---
        case 'ArrowDown':
            key.down = true;
            key.lastKey = 's'
            break;
        case 'ArrowUp':
            key.up = true;
            key.lastKey = 'w'
            break;
        case 'ArrowRight':
            key.right = true;
            key.lastKey = 'd'
            break;
        case 'ArrowLeft':
            key.left = true;
            key.lastKey = 'a'
            break;
    }
})
// turn off move
window.addEventListener('keyup', (e) => {
    switch (e.key) {
        // ---- case 1 ---
        case 's':
            key.down = false;
            break;
        case 'w':
            key.up = false;
            break;
        case 'd':
            key.right = false;
            break;
        case 'a':
            key.left = false;
            break;
        // ---- case 2  ---
        case 'ArrowDown':
            key.down = false;
            break;
        case 'ArrowUp':
            key.up = false;
            break;
        case 'ArrowRight':
            key.right = false;
            break;
        case 'ArrowLeft':
            key.left = false;
            break;
    }
})
// ----------------------------- battle -------------------------------
const battle = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    veclo: 0,
    image: constbattleimg,
})
// monster
let emby
let draggle

// animation Frame id
let animationBattleID
// arr monster render
let renderBattle
// array command attack of enemy monster
let queue
// arr button attack option
const arrbtn = ['tackle', 'ember']

// init battle
const initBattle = () => {
    // resert default interface bar
    document.getElementById('battleInterface').style.display = 'block'
    document.getElementById('healthDraggleBar').style.width = '100%'
    document.getElementById('healthEmbyBar').style.width = '100%'
    document.getElementById('dialogbox').style.display = 'none'
    document.querySelector('#battlebox').replaceChildren()

    emby = new Monster({
        position: {
            x: 360,
            y: 420,
        },
        veclo: 0,
        image: embyimg,
        frames: {
            max: 4,
            hold: 30,
        },
        animate: true,
        nameMonster: 'emby',

    })
    draggle = new Monster({
        position: {
            x: 1010,
            y: 145,
        },
        veclo: 0,
        image: draggleimg,
        frames: {
            max: 4,
            hold: 30,
        },
        animate: true,
        isEnemy: true,
        nameMonster: 'draggle',
    })
    renderBattle = [draggle, emby]
    queue = []

    // create btn attack
    arrbtn.forEach(btnName => {
        const button = document.createElement('button')
        button.innerHTML = btnName
        document.querySelector('#battlebox').append(button)
    })

    // event call attack
    document.querySelectorAll('button').forEach(btn => {
        // display attack type
        btn.addEventListener('mouseenter', (e) => {
            document.getElementById('battletype').innerHTML = attacks[e.currentTarget.innerHTML].typeATK
            document.getElementById('battletype').style.color = attacks[e.currentTarget.innerHTML].color
        })
        btn.addEventListener('mouseleave', (e) => {
            document.getElementById('battletype').innerHTML = 'attack type'
            document.getElementById('battletype').style.color = 'black'
        })

        // action attack
        btn.addEventListener('click', (e) => {
            emby.attack({
                attack: attacks[e.currentTarget.innerHTML],
                recipient: draggle,
                renderBattle: renderBattle,
            })

            // check enemy monster faint
            if (draggle.healthBar <= 0) {
                // enemy monster faint
                queue.push(() => {
                    draggle.faint()
                })

                // move to map game
                queue.push(() => {
                    gsap.to('#overlapSense', {
                        opacity: 1,
                        onComplete: () => {
                            // draw again game
                            cancelAnimationFrame(animationBattleID)
                            animation()
                            // hide battle sence
                            document.getElementById('battleInterface').style.display = 'none'
                            gsap.to('#overlapSense', {
                                opacity: 0,
                            })
                            battleAction.battle = false;
                            // music game
                            audio.Map.play()
                        }
                    })
                })
            }

            // add enemy battle func
            queue.push(() => {
                draggle.attack({
                    attack: attacks.tackle,
                    recipient: emby,
                    renderBattle: renderBattle,
                })
            })
        })
    })
}
// dialog battle ( enemy monster attack after your monster attack )
document.querySelector('#dialogbox').addEventListener('click', (e) => {
    if (queue.length > 0) {
        queue[0]()
        queue.shift();

        // check your monster is faint
        if (emby.healthBar <= 0) {
            // your monster faint
            queue.push(() => {
                emby.faint()
            })
            // move to map game
            queue.push(() => {
                gsap.to('#overlapSense', {
                    opacity: 1,
                    onComplete: () => {
                        // draw again game
                        cancelAnimationFrame(animationBattleID)
                        animation()
                        // hide battle sence
                        document.getElementById('battleInterface').style.display = 'none'
                        gsap.to('#overlapSense', {
                            opacity: 0,
                        })
                        battleAction.battle = false;
                        // music game
                        audio.Map.play()
                    }
                })
            })
        }

    } else {
        e.currentTarget.style.display = 'none'
    }
})


// ---------------------------- collision/boundary ------------------------------------------
// collisions
const collisionMap = []
// split each row data
for (let i = 0; i < collision.length; i += 110) {
    collisionMap.push(collision.slice(i, 110 + i))
}
// boundaries
const boundaries = []
// create coordinate boundary 
collisionMap.forEach((row, i) => {
    row.forEach((item, j) => {
        if (item == 1025) {
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y,
                    }
                })
            )
        }
    })
})
// ---------------------
// battle zone
const battlezoneMap = []
// split each row data
for (let i = 0; i < battlezone.length; i += 110) {
    battlezoneMap.push(battlezone.slice(i, 110 + i))
}
// boundaries battle
const boundaryBattle = []
// create coordinate boundary battlezone 
battlezoneMap.forEach((row, i) => {
    row.forEach((item, j) => {
        if (item == 1025) {
            boundaryBattle.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y,
                    }
                })
            )
        }
    })
})

// checkCollisions
const checkCollisions = ({ obj1 = {}, obj2 = {} }) => {
    return (obj1.position.x + obj1.width >= obj2.position.x &&
        obj1.position.x <= obj2.position.x + obj2.width &&
        obj1.position.y <= obj2.position.y + obj2.height &&
        obj1.position.y + obj1.height >= obj2.position.y)
}

// move to battle sense when player overlap boudary
const battleAction = {
    battle: false
}
//------------------------ music ---------------------------------------
let clicked = false
addEventListener('keydown', () => {
    if (!clicked) {
        // this will create tag audio be careful your src must right
        audio.Map.play()
        clicked = true
    }
})
//------------------------render---------------------------------------
//game
const groupGo = [backGround, ...boundaries, foreground, ...boundaryBattle]
const animation = () => {
    const animationID = window.requestAnimationFrame(animation)
    let moving = true;
    player.animate = false;
    // battle sense
    if (battleAction.battle) return
    // logic boundary battle
    if (key.down || key.up || key.left || key.right) {
        {
            for (let i = 0; i < boundaryBattle.length; i++) {
                const bdbattlezone = boundaryBattle[i]
                // overlap this arena check collision between player and battle zone
                const overlap = (Math.min(player.position.x + player.width, bdbattlezone.position.x + bdbattlezone.width) -
                    Math.max(player.position.x, bdbattlezone.position.x)) *
                    (Math.min(player.position.y + player.height, bdbattlezone.position.y + bdbattlezone.height) -
                        Math.max(player.position.y, bdbattlezone.position.y));
                if (checkCollisions({
                    obj1: player,
                    obj2: {
                        ...bdbattlezone,
                        position: {
                            x: bdbattlezone.position.x,
                            y: bdbattlezone.position.y,
                        },
                    },
                }) &&
                    overlap >= (player.width * player.height) / 2 &&
                    Math.random() < 0.01) {
                    // cancel animation game
                    cancelAnimationFrame(animationID)
                    // play music battle sense
                    audio.Map.stop()
                    audio.initBattle.play()
                    audio.battle.play()
                    // animation move to battle
                    gsap.to('#overlapSense', {
                        opacity: 1,
                        repeat: 3,
                        yoyo: true,
                        duration: 0.4,
                        onComplete() {
                            gsap.to('#overlapSense', {
                                opacity: 1,
                                duration: 0.4,
                                onComplete() {
                                    // call function animation battle
                                    initBattle()
                                    animationBattle()
                                    gsap.to('#overlapSense', {
                                        opacity: 0,
                                        duration: 0.4,
                                    })
                                }
                            })
                        }
                    })
                    battleAction.battle = true;
                    break;
                }
            }
        }
    }
    // logic moving
    if (key.up && key.lastKey === 'w') {
        // start animation
        player.animate = true;
        player.image = player.sprites.up;
        // boundary collision
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (checkCollisions({
                obj1: player,
                obj2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x,
                        y: boundary.position.y + 3,
                    },
                },
            })) {
                moving = false;
                break;
            }
        }
        if (moving)
            groupGo.forEach((item) => { item.goUp() })
    } else if (key.down && key.lastKey === 's') {
        // start animation
        player.animate = true;
        player.image = player.sprites.down;
        // boundary collisions
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (checkCollisions({
                obj1: player,
                obj2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x,
                        y: boundary.position.y - 3,
                    },
                },
            })) {
                moving = false;
                break;
            }
        }
        if (moving)
            groupGo.forEach((item) => { item.goDown() })
    } else if (key.left && key.lastKey === 'a') {
        // start animation
        player.animate = true;
        player.image = player.sprites.left;
        // boundary collisions
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (checkCollisions({
                obj1: player,
                obj2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x + 3,
                        y: boundary.position.y,
                    },
                },
            })) {
                moving = false;
                break;
            }
        }
        if (moving)
            groupGo.forEach((item) => { item.goLeft() })
    } else if (key.right && key.lastKey === 'd') {
        // start animation
        player.animate = true;
        player.image = player.sprites.right;
        // boundary collisions
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (checkCollisions({
                obj1: player,
                obj2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x - 3,
                        y: boundary.position.y,
                    },
                },
            })) {
                moving = false;
                break;
            }
        }
        if (moving)
            groupGo.forEach((item) => { item.goRight() })
    }
    // render map
    backGround.draw();
    // render boundaries / boundarybattle => boundaries wil move with player because animation() run continue
    // boundaryBattle.forEach((item) => {
    //     item.draw()
    // })
    // render player
    player.draw()
    // render foreground
    foreground.draw()
}
animation()

// battle sense
const animationBattle = () => {

    // render battle sense
    game.drawImage(battle.image, 0, 0, 1280, 700)
    // render monster from arr
    renderBattle.forEach(sprite => {
        sprite.draw()
    })

    animationBattleID = window.requestAnimationFrame(animationBattle)
}
// initBattle()
// animationBattle()


