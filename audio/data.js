const data = [  // search element names
    { name: "To search, type: title, music type, singers gender and all (to get every song)", artist: "help", category: ":help" }, // if :help is typed

    { name: "Feel the vibe", artist: "DJJR", category: "dance", audio: "DJJR - Feel the vibe.mp3" },
    { name: "Feel the vibe", artist: "DJJR", category: "new", audio: "DJJR - Feel the vibe.mp3" },
    { name: "Feel the vibe", artist: "DJJR", category: "upbeat", audio: "DJJR - Feel the vibe.mp3" },
    { name: "Feel the vibe", artist: "DJJR", category: "male singing", audio: "DJJR - Feel the vibe.mp3" },
    { name: "Feel the vibe", artist: "DJJR", category: "all", audio: "DJJR - Feel the vibe.mp3" },
    { name: "Feel the vibe", artist: "DJJR", category: "feel the vibe", audio: "DJJR - Feel the vibe.mp3" },
    
    { name: "No Way Back Home", artist: "DJJR", category: "dance", audio: "DJJR - No Way Back Home.mp3" },
    { name: "No Way Back Home", artist: "DJJR", category: "sad", audio: "DJJR - No Way Back Home.mp3" },
    { name: "No Way Back Home", artist: "DJJR", category: "no way back home", audio: "DJJR - No Way Back Home.mp3" },
    { name: "No Way Back Home", artist: "DJJR", category: "female singing", audio: "DJJR - No Way Back Home.mp3" },
    { name: "No Way Back Home", artist: "DJJR", category: "no way back home", audio: "DJJR - No Way Back Home.mp3" },
    { name: "No Way Back Home", artist: "DJJR", category: "all", audio: "DJJR - No Way Back Home.mp3" },

    { name: "Trapped in the Sea", artist: "DJJR", category: "nu-metal", audio: "DJJR - Trapped in the Sea.mp3" },
    { name: "Trapped in the Sea", artist: "DJJR", category: "numetal", audio: "DJJR - Trapped in the Sea.mp3" },
    { name: "Trapped in the Sea", artist: "DJJR", category: "nu metal", audio: "DJJR - Trapped in the Sea.mp3" },
    { name: "Trapped in the Sea", artist: "DJJR", category: "rap", audio: "DJJR - Trapped in the Sea.mp3" },
    { name: "Trapped in the Sea", artist: "DJJR", category: "rock", audio: "DJJR - Trapped in the Sea.mp3" },
    { name: "Trapped in the Sea", artist: "DJJR", category: "hard rock", audio: "DJJR - Trapped in the Sea.mp3" },
    { name: "Trapped in the Sea", artist: "DJJR", category: "trapped in the sea", audio: "DJJR - Trapped in the Sea.mp3" },
    { name: "Trapped in the Sea", artist: "DJJR", category: "male singing", audio: "DJJR - Trapped in the Sea.mp3" },
    { name: "Trapped in the Sea", artist: "DJJR", category: "all", audio: "DJJR - Trapped in the Sea.mp3" },

    { name: "Break the Silence", artist: "DJJR", category: "nu-metal", audio: "DJJR - Break the Silence.mp3" },
    { name: "Break the Silence", artist: "DJJR", category: "numetal", audio: "DJJR - Break the Silence.mp3" },
    { name: "Break the Silence", artist: "DJJR", category: "nu metal", audio: "DJJR - Break the Silence.mp3" },
    { name: "Break the Silence", artist: "DJJR", category: "rap", audio: "DJJR - Break the Silence.mp3" },
    { name: "Break the Silence", artist: "DJJR", category: "rock", audio: "DJJR - Break the Silence.mp3" },
    { name: "Break the Silence", artist: "DJJR", category: "hard rock", audio: "DJJR - Break the Silence.mp3" },
    { name: "Break the Silence", artist: "DJJR", category: "break the silence", audio: "DJJR - Break the Silence.mp3" },
    { name: "Break the Silence", artist: "DJJR", category: "male singing", audio: "DJJR - Break the Silence.mp3" },
    { name: "Break the Silence", artist: "DJJR", category: "all", audio: "DJJR - Break the Silence.mp3" },

    { name: "Can't let go", artist: "DJJR", category: "sad", audio: "DJJR - Can't let go.mp3" },
    { name: "Can't let go", artist: "DJJR", category: "dance", audio: "DJJR - Can't let go.mp3" },
    { name: "Can't let go", artist: "DJJR", category: "female singing", audio: "DJJR - Can't let go.mp3" },
    { name: "Can't let go", artist: "DJJR", category: "can't let go", audio: "DJJR - Can't let go.mp3" },
    { name: "Can't let go", artist: "DJJR", category: "all", audio: "DJJR - Can't let go.mp3" },

    { name: "Dancing With Ghosts", artist: "DJJR", category: "sad", audio: "DJJR - Dancing With Ghosts.mp3" },
    { name: "Dancing With Ghosts", artist: "DJJR", category: "dance", audio: "DJJR - Dancing With Ghosts.mp3" },
    { name: "Dancing With Ghosts", artist: "DJJR", category: "female singing", audio: "DJJR - Dancing With Ghosts.mp3" },
    { name: "Dancing With Ghosts", artist: "DJJR", category: "dancing with ghosts", audio: "DJJR - Dancing With Ghosts.mp3" },
    { name: "Dancing With Ghosts", artist: "DJJR", category: "all", audio: "DJJR - Dancing With Ghosts.mp3" },

    { name: "Reaper's Call", artist: "DJJR", category: "metal", audio: "DJJR - Reaper's Call.mp3" },
    { name: "Reaper's Call", artist: "DJJR", category: "heavy metal", audio: "DJJR - Reaper's Call.mp3" },
    { name: "Reaper's Call", artist: "DJJR", category: "death", audio: "DJJR - Reaper's Call.mp3" },
    { name: "Reaper's Call", artist: "DJJR", category: "reapers call", audio: "DJJR - Reaper's Call.mp3" },
    { name: "Reaper's Call", artist: "DJJR", category: "all", audio: "DJJR - Reaper's Call.mp3" },
    { name: "Reaper's Call", artist: "DJJR", category: "male singing", audio: "DJJR - Reaper's Call.mp3" },

    { name: "Hollow Throne", artist: "DJJR", category: "metal", audio: "DJJR - Hollow Throne.mp3" },
    { name: "Hollow Throne", artist: "DJJR", category: "heavy metal", audio: "DJJR - Hollow Throne.mp3" },
    { name: "Hollow Throne", artist: "DJJR", category: "death", audio: "DJJR - Hollow Throne.mp3" },
    { name: "Hollow Throne", artist: "DJJR", category: "hollow throne", audio: "DJJR - Hollow Throne.mp3" },
    { name: "Hollow Throne", artist: "DJJR", category: "male singing", audio: "DJJR - Hollow Throne.mp3" },
    { name: "Hollow Throne", artist: "DJJR", category: "all", audio: "DJJR - Hollow Throne.mp3" },

    { name: "Dancing in the dark", artist: "DJJR", category: "dance", audio: "DJJR - Dancing in the dark.mp3" },
    { name: "Dancing in the dark", artist: "DJJR", category: "sad", audio: "DJJR - Dancing in the dark.mp3" },
    { name: "Dancing in the dark", artist: "DJJR", category: "female singing", audio: "DJJR - Dancing in the dark.mp3" },
    { name: "Dancing in the dark", artist: "DJJR", category: "all", audio: "DJJR - Dancing in the dark.mp3" },

    { name: "Realm of Decay", artist: "DJJR", category: "metal", audio: "DJJR - Realm of Decay.mp3" },
    { name: "Realm of Decay", artist: "DJJR", category: "heavy metal", audio: "DJJR - Realm of Decay.mp3" },
    { name: "Realm of Decay", artist: "DJJR", category: "death", audio: "DJJR - Realm of Decay.mp3" },
    { name: "Realm of Decay", artist: "DJJR", category: "realm of decay", audio: "DJJR - Realm of Decay.mp3" },
    { name: "Realm of Decay", artist: "DJJR", category: "male singing", audio: "DJJR - Realm of Decay.mp3" },
    { name: "Realm of Decay", artist: "DJJR", category: "all", audio: "DJJR - Realm of Decay.mp3" },

    { name: "The End Is Near", artist: "DJJR", category: "rock", audio: "DJJR - The End Is Near.mp3" },
    { name: "The End Is Near", artist: "DJJR", category: "hard rock", audio: "DJJR - The End Is Near.mp3" },
    { name: "The End Is Near", artist: "DJJR", category: "alternative rock", audio: "DJJR - The End Is Near.mp3" },
    { name: "The End Is Near", artist: "DJJR", category: "male singing", audio: "DJJR - The End Is Near.mp3" },
    { name: "The End Is Near", artist: "DJJR", category: "the end is near", audio: "DJJR - The End Is Near.mp3" },
    { name: "The End Is Near", artist: "DJJR", category: "all", audio: "DJJR - The End Is Near.mp3" },

    { name: "Calling Out", artist: "DJJR", category: "rock", audio: "DJJR - Calling Out.mp3" },
    { name: "Calling Out", artist: "DJJR", category: "alternative rock", audio: "DJJR - Calling Out.mp3" },
    { name: "Calling Out", artist: "DJJR", category: "sad", audio: "DJJR - Calling Out.mp3" },
    { name: "Calling Out", artist: "DJJR", category: "female singing", audio: "DJJR - Calling Out.mp3" },
    { name: "Calling Out", artist: "DJJR", category: "calling out", audio: "DJJR - Calling Out.mp3" },
    { name: "Calling Out", artist: "DJJR", category: "all", audio: "DJJR - Calling Out.mp3" },

    { name: "Echoes of You", artist: "DJJR", category: "instrumental", audio: "DJJR - Echoes of You (instrumental).mp3" },
    { name: "Echoes of You", artist: "DJJR", category: "no singing", audio: "DJJR - Echoes of You (instrumental).mp3" },
    { name: "Echoes of You", artist: "DJJR", category: "echoes of you", audio: "DJJR - Echoes of You (instrumental).mp3" },
    { name: "Echoes of You", artist: "DJJR", category: "all", audio: "DJJR - Echoes of You (instrumental).mp3" },

    { name: "Fading lights", artist: "DJJR", category: "rock", audio: "DJJR  - Fading Lights.mp3" },
    { name: "Fading lights", artist: "DJJR", category: "soft rock", audio: "DJJR  - Fading Lights.mp3" },
    { name: "Fading lights", artist: "DJJR", category: "sad", audio: "DJJR  - Fading Lights.mp3" },
    { name: "Fading lights", artist: "DJJR", category: "female singing", audio: "DJJR  - Fading Lights.mp3" },
    { name: "Fading lights", artist: "DJJR", category: "fading lights", audio: "DJJR  - Fading Lights.mp3" },
    { name: "Fading lights", artist: "DJJR", category: "all", audio: "DJJR  - Fading Lights.mp3" },

    { name: "Falling apart", artist: "DJJR", category: "rock", audio: "DJJR - Falling apart.mp3" },
    { name: "Falling apart", artist: "DJJR", category: "soft rock", audio: "DJJR - Falling apart.mp3" },
    { name: "Falling apart", artist: "DJJR", category: "sad", audio: "DJJR - Falling apart.mp3" },
    { name: "Falling apart", artist: "DJJR", category: "female singing", audio: "DJJR - Falling apart.mp3" },
    { name: "Falling apart", artist: "DJJR", category: "falling apart", audio: "DJJR - Falling apart.mp3" },

   ];