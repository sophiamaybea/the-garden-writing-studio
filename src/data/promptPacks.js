// ─── Garden Plot: themed "beds" of prompts ───────────────────────────────────
export const GARDEN_BEDS = [
  {
    id: "roots", name: "Roots", theme: "ORIGIN & FAMILY",
    blurb: "Where you come from, and what grew there before you.",
    c1: "#d9a06b", c2: "#c97b8a",
    seeds: [
      "Write the last thing your grandmother's hands made before they stopped being sure of themselves.",
      "Describe the kitchen you grew up in using only the objects that were never moved.",
      "Write a meal someone cooked for you — the recipe, not the feeling. Let the feeling arrive on its own.",
      "What did the hallway smell like at 6pm in the house you grew up in? Don't name the emotion.",
      "Write the sound of a specific door from your childhood — its weight, its latch, what you could hear through it.",
      "Write a room you used to inhabit. Describe only its dimensions — where the door was, how far the bed was from the window.",
    ],
  },
  {
    id: "thresholds", name: "Thresholds", theme: "TRANSITIONS",
    blurb: "Doors, borders, and the spaces between one thing and the next.",
    c1: "#e8b4a0", c2: "#c4a8d8",
    seeds: [
      "Write the moment a door closed behind you and you knew, without anyone saying it, that you couldn't go back.",
      "Write the hour before a decision was made. Only the peripheral details — the light, the sound underneath.",
      "Describe the exact moment the tide turns — water neither advancing nor receding, briefly suspended.",
      "Write the last fifteen minutes of a long conversation. Track only the pacing and the silences.",
      "Write a threshold you're standing on right now — not the before, not the after, just the line itself.",
      "Write about finishing something that took a long time — not relief, but the texture of the moment the hands go still.",
    ],
  },
  {
    id: "shadows", name: "Shadows", theme: "FEAR & DARKNESS",
    blurb: "What lives in the corners the light doesn't reach.",
    c1: "#8a6fa0", c2: "#5a6b8a",
    seeds: [
      "Write the corner of a lit room that the light doesn't reach. Is it an absence or a presence?",
      "What is your character most afraid someone will discover? Write around it — never name it.",
      "Write about a photograph turned to face the wall. What does it see? What does the wall tell it?",
      "Write a room in the moment the last light is switched off — not darkness arriving, but a world being revoked.",
      "Write about something your body does without consulting you. Consider who, if anyone, is performing it.",
      "Write the space between a first knock and a second. What does uncertainty feel like in that interval?",
    ],
  },
  {
    id: "bloom", name: "Bloom", theme: "JOY & BEAUTY",
    blurb: "The things that open, briefly, and catch the light.",
    c1: "#f2c6da", c2: "#d9e7a6",
    seeds: [
      "Write a moment of unexpected beauty in an ordinary place — a bus stop, a stairwell, a queue.",
      "Describe someone laughing in another room. Write what the laughter sounded like after passing through the wall.",
      "Write about something that opened today — a flower, a hand, a door, a sentence — and the conditions that allowed it.",
      "Write the particular blue the sky turns just before it becomes dark. Not yet grey, not yet black.",
      "Write a star not as a symbol but as an industrial fact — hydrogen fusing into helium at temperatures with no human equivalent.",
      "Write the first warm day of spring as if you were a stone that has been cold for months and is finally being touched by the sun.",
    ],
  },
  {
    id: "storm", name: "Storm", theme: "CONFLICT",
    blurb: "Pressure, friction, and the weather between people.",
    c1: "#6f8a9a", c2: "#8a6f6a",
    seeds: [
      "Write two people in a room who want different things and haven't said so yet. Write only the objects between them.",
      "Write an argument from the perspective of a piece of furniture that has been in the room for both of them.",
      "Describe a conversation where the sentence you needed to say was fully formed but never found its moment.",
      "Write a character who is wrong about something and knows it. Don't let them admit it.",
      "Write the moment someone realises they've been misunderstood — not the correction, just the realisation.",
      "Write a confrontation that happens entirely through small gestures. No one raises their voice.",
    ],
  },
  {
    id: "harvest", name: "Harvest", theme: "ENDINGS",
    blurb: "What's gathered, what's left, what returns to the soil.",
    c1: "#c4a86b", c2: "#d9b07a",
    seeds: [
      "Write the last entry in a notebook that has been filled. Not its content — its condition.",
      "Write a garden one week after its owner has left. Growth as both indifference and persistence.",
      "Write the day as a door that is very nearly shut — not ended, not continuing, just almost closed.",
      "Write a well that has been dry for forty years. Its knowledge of water, its specific kind of absence.",
      "Write the moment a long project is finished — not relief, not pride, but the texture of the doing stopping.",
      "Write about seeds that require fire to germinate — waiting for a specific condition without forcing metaphor.",
    ],
  },
  {
    id: "wildflower", name: "Wildflower", theme: "EXPERIMENTAL",
    blurb: "Strange seeds. Try the form differently.",
    c1: "#9ac4a0", c2: "#c49a9a",
    seeds: [
      "Write a sentence that contains a parenthesis longer than itself — where the digression is the subject.",
      "Write a list of ordinary things in the room. Keep going past the point where the list becomes strange.",
      "Rewrite three declarative sentences as genuine questions. Write what's revealed when certainty returns to uncertainty.",
      "Write a paragraph in a language you invent for this paragraph only. Define the rules first, then use them.",
      "Write a sentence that begins confident and gradually revises itself, accumulating qualifications until it arrives somewhere else.",
      "Write from the perspective of an object that has been in one place for decades. What does long familiarity feel like?",
    ],
  },
  {
    id: "moonlit", name: "Moonlit", theme: "NIGHT & DREAMS",
    blurb: "The half-asleep hour and the things that only happen then.",
    c1: "#7a6fa0", c2: "#9a8ab4",
    seeds: [
      "Write a town you know at 4am — not sinister, not lonely, just running its essential systems on minimal power.",
      "Write the hypnagogic threshold — the instructions for a state you cannot actually instruct yourself into.",
      "Write night as a distinct country with its own customs. A traveller's guide for someone in it for the first time.",
      "Write the silence before snow — the held-breath quality of the sky changing its silence.",
      "Write a dream's ending — not its content, but the frequency of its ending, as if you were a sound engineer.",
      "Write the moment your eyes decide to stop — the visual field becoming unreliable, matter-of-factly.",
    ],
  },
];

// ─── Sensitive Pen: prompt groups ────────────────────────────────────────────
export const PEN_GROUPS = [
  { cat: "Weather & Sky", prompts: [
    { t: "Barometric Memory", p: "Atmospheric pressure drops before rain, and some people feel it in their joints before any instrument registers it. Write a paragraph in which the body knows something before the mind catches up — but keep the writing in the body, in the joints and the jaw and the inner ear. Don't name what is known." },
    { t: "The Rain That Has No Opinion of You", p: "Write about rain falling on your particular street tonight as if it has absolutely no relationship with anything human — no mood, no metaphorical intention, no interest in being perceived. Notice how the writing changes when the rain is indifferent." },
    { t: "The Particular Blue Before It Becomes Dark", p: "There is a moment when the sky is still blue but has become a different blue — not yet grey, not yet black, but blue that knows what is coming. Write four sentences about something that is still itself but has already started becoming something else." },
    { t: "Dusk Measured in Decibels", p: "As light fails, sound takes over: the birds shift register, traffic changes character, the human voice in the garden next door changes pitch. Write a dusk that you could only perceive through hearing — in which the light is inferred entirely from sound." },
  ]},
  { cat: "The Body at Rest", prompts: [
    { t: "The Specific Temperature of Your Own Wrist", p: "Put two fingers on your inner wrist. Write what you find there — the pulse, the temperature, the particular feel of skin over tendon. Write it as though you are a doctor who is also a poet, and has never felt indifferent to this small fact." },
    { t: "The Jaw That Has Been Holding Something All Day", p: "Most people clench their jaws without noticing. Write the moment of deliberate release — the jaw unclenching, the face softening — as if it were the most significant act of the day. Give it the weight it probably deserves." },
    { t: "Gravity at 11pm", p: "Gravity feels different when you are very tired — more present, more insistent, as if it has been patiently waiting for you to stop fighting it. Write a piece in which gravity is a character: not personified, but present, patient, without agenda." },
    { t: "The Back of the Hand", p: "Write the back of your hand as if you were encountering it for the first time tonight: its specific geography, the tendons like very small bridges, the particular colour it is in this light. Don't reach for what it means. Stay entirely on the surface." },
  ]},
  { cat: "Rooms & Domestic Space", prompts: [
    { t: "The Corner That Stays Dark", p: "Every lit room has a corner the light doesn't reach. Write that corner — its specific quality of unlit air, what it holds, whether it is an absence or a presence — without metaphorising it into a psychological state." },
    { t: "The Object That Has Moved Slightly", p: "You notice an object is not where you left it — not dramatically displaced, but turned a few degrees, shifted a centimetre. Write the small cognitive event of this noticing: not with suspicion, but with the specific texture of slight perceptual disorientation." },
    { t: "Light Switches and What They Revoke", p: "When you turn off the last light, you don't just create darkness — you revoke a particular arrangement of the room, the specific world that light made. Write a room in the moment of being revoked: not as darkness arriving, but as a previous state being recalled." },
    { t: "The Book Left Open on a Surface", p: "A book left open and face-down is holding its page. Write about this small act of faith — that you will return, that the page will still be there, that the sentence waiting mid-thought will still be coherent in the morning." },
  ]},
  { cat: "Memory Without Strain", prompts: [
    { t: "A Bus Journey That No Longer Exists", p: "Write a bus route that has since been discontinued — a specific journey, the particular window seat, the stops in order, the people who got on at the same stop every time. Write it not as elegy but as a timetable of the ordinary." },
    { t: "Someone Laughing in Another Room", p: "Write about overhearing laughter you weren't part of — not with envy, not with loneliness, but as a sound that moved through a wall and arrived changed. Write what the laughter sounded like once it had passed through the architecture." },
    { t: "The Hour Before a Decision Was Made", p: "Write the hour before a decision was made — any decision, any size — but write only the peripheral details: what the light was, what you were eating, what sound was running underneath. Don't name the decision. Don't approach it." },
    { t: "A Meal Cooked by Someone Who Is Gone", p: "Write a dish made by someone you no longer eat with — not the emotional fact of this, but the recipe as you remember it: the specific technique, the quantities that were never measured, the exact colour it turned when it was done." },
  ]},
  { cat: "Language & Syntax Itself", prompts: [
    { t: "The Parenthesis as a Room Inside a Sentence", p: "Write a sentence that contains a parenthesis longer than the sentence itself — in which the digression is the subject, and the sentence that frames it is merely the excuse to get there. Notice whether the parenthesis is a burden or a gift." },
    { t: "The Word Your Hand Reaches for Before Your Mind Does", p: "In fast drafting, the hand sometimes produces a word that the conscious mind would not have chosen — a slightly wrong word that is more right than the right one. Write a paragraph in which you allow this to happen, and then write a note describing the word the hand chose." },
    { t: "The List That Doesn't Want to End", p: "Write a list of ordinary things in the room around you, but keep going past the expected end — past the point where the list becomes strange, into the territory where it starts inventing or misremembering." },
    { t: "The Title as a Promise the Piece Has to Keep", p: "Write three possible titles for something you are working on. Write a sentence about what each title promises — what contract it makes with the reader — and whether the piece actually honours it." },
  ]},
  { cat: "Water & Tide", prompts: [
    { t: "The River's Total Indifference to Drowning", p: "Write a river doing exactly what rivers do — flowing, distributing pressure across its bed, moving sediment — in complete and non-dramatic indifference to whether anyone is watching, swimming, or in danger. Write the river's relationship with physics alone." },
    { t: "The Exact Moment the Tide Turns", p: "The tide's turning point is a moment of absolute stillness — the water is neither advancing nor receding, briefly suspended between two directions. Write that moment as if it were a formal pause: not an ending, not a beginning, but a held note." },
    { t: "Rain That Cannot Decide If It Is Rain", p: "Write the specific meteorological condition of mizzle — the between-rain of certain climates, neither fully rain nor properly mist, the precipitation that resists categorisation. Write it as a meditation on things that don't fit the available vocabulary." },
    { t: "A Well That Has Been Dry for Forty Years", p: "Write a well that no longer functions — dry, stone-lined, still covered as if expecting to be used again. Write its knowledge of water: the specific kind of absence that belongs to something built for a purpose it can no longer fulfil." },
  ]},
  { cat: "Gardens, Forests & the Natural World", prompts: [
    { t: "The Gardener's Final Round", p: "Write a gardener doing a last round of the garden at last light — not emotionally, not philosophically, but procedurally: what is checked, what is pinched back, what is noted for tomorrow, what is simply registered and left. Write the mind of a person who maintains something." },
    { t: "The Underside of a Leaf", p: "The underside of a leaf is where most of the leaf's actual work happens — the stomata, the veins more prominent, the colour different. Write a brief essay on the underside: what we learn from looking at the part of a thing that is not presented to us." },
    { t: "Seeds That Require Fire to Germinate", p: "Some seeds will not germinate without exposure to fire — they have evolved to wait for the right disaster. Write a piece about the kind of waiting that requires a specific condition, without forcing it toward obvious metaphor." },
    { t: "What a Plant Knows About the Direction of Light", p: "A plant on a windowsill will slowly turn toward the light over the course of weeks — not dramatically, but measurably, following a logic entirely internal to the plant. Write a short piece about orientation without self-awareness: moving toward something without knowing you are moving." },
  ]},
  { cat: "Time & Endings", prompts: [
    { t: "The Day That Has Not Quite Closed", p: "Write the day as a door that is very nearly shut — the light still coming through the gap, the frame not yet fully in, the mechanism not yet engaged. Write the not-yet-over in its precise state: not ended, not continuing." },
    { t: "The Penultimate Chapter", p: "Write a short meditation on the penultimate — the second-to-last, the one before the last one. The penultimate is under-discussed: it carries all the weight of ending without being allowed to end. What is it like to be second-to-last?" },
    { t: "A Year Ending Without Announcement", p: "Write 31 December as if it were an unremarkable Thursday: the ordinary tasks, the same light, the same sounds. Let the calendar date be nowhere in the piece, and see if the ending of a year can be written without being named." },
    { t: "Finishing Something That Took a Long Time", p: "Write the moment of finishing a long project — not relief, not pride, not any of the expected responses, but the precise texture of the moment when the final thing is done and the doing has stopped and the hands are still." },
  ]},
  { cat: "Silence, Sound & Absence", prompts: [
    { t: "The Particular Frequency of This Building", p: "Every building has its own baseline vibration — from traffic, from the pipes, from the shared walls. Write the frequency of the building you are in tonight as if you were a geologist taking a reading: objective, precise, without affect." },
    { t: "The Sentence That Never Arrived", p: "Write about a conversation in which the sentence you needed to say was fully formed in your mind but never found its moment — a sentence so ready it was almost physical, that eventually had to be un-said, slowly, like a held breath released underwater." },
    { t: "What Happens to a Room When You Stop Talking", p: "Write the moment in a long conversation when both speakers stop and the room reasserts itself — the objects coming back into focus, the ambient sound re-establishing itself, the room briefly recovering its own character from the conversation that temporarily occupied it." },
    { t: "The Silence After a Bell", p: "Write the silence that follows a bell — not just any bell but a specific one: a church bell, a school bell, a doorbell you know. Write the silence as the bell's continuation, not its absence, as if the sound is still occurring in a different register." },
  ]},
  { cat: "Dreams, Thresholds & the Unreal", prompts: [
    { t: "The Museum of Things You Have Never Seen", p: "Write a room in an imagined museum that contains objects which have never been observed by anyone — events with no witnesses, conversations with no listener, landscapes no one passed through. Write one exhibit in full detail." },
    { t: "The Archive of Almost-Decisions", p: "Imagine a building that holds every decision you nearly made but didn't. Write one room in this building — what it holds, how it is organised, whether it is crowded or sparse, what the light is like, what the air smells of." },
    { t: "A Future Archaeologist's Field Notes on Your Bedroom", p: "Write field notes from an archaeologist excavating your bedroom one thousand years from now — noting the objects, the material culture, the evidence of ritual and habit, without understanding any of it. Write the annotations of someone who is interpreting accurately without comprehending." },
    { t: "The Second Knock", p: "There is always, in old stories, a second knock — the one that confirms the first was not imagined. Write the space between the first knock and the second: what that interval feels like when you are not sure whether the first knock was real." },
  ]},
];

// ─── Garden Plot: whisper nudges that unlock at word counts ───────────────────
export const GARDEN_NUDGES = [
  { at: 25, q: "What is your character most afraid someone will discover?" },
  { at: 80, q: "Put an object in their hands right now. What is it — and why that one?" },
  { at: 160, q: "Make them want two things that can't both be true." },
  { at: 260, q: "Bring in the one person they'd never dare say this in front of." },
  { at: 380, q: "End on a single image. What do we see last — with no explaining?" },
];