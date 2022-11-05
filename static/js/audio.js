const audio = {
    Map: new Howl({
        src: './static/audio/map.wav',
        html5: true,
    }),

    initBattle: new Howl({
        src: './static/audio/initBattle.wav',
        html5: true,
        volume: 0.1
    }),
    battle: new Howl({
        src: './static/audio/battle.mp3',
        html5: true,
    }),

    initFireball: new Howl({
        src: './static/audio/initFireball.wav',
        html5: true,
    }),
    fireballHit: new Howl({
        src: './static/audio/fireballHit.wav',
        html5: true,
    }),

    tackleHit: new Howl({
        src: './static/audio/tackleHit.wav',
        html5: true,
    }),

    victory: new Howl({
        src: './static/audio/victory.wav',
        html5: true,
    })
}