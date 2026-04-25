export interface EmojiDef {
    emoji: string[]
    filename: string
    label: string
    labelPt: string
    searchTerms: string[]
}

export const EMOJIS: EmojiDef[] = [
    // --- Faces ---
    {
        emoji: ['😊', '☺️', '🙂'],
        filename: 'smile.png',
        label: 'Smile', labelPt: 'Sorriso',
        searchTerms: ['smile', 'happy', 'sorriso', 'feliz', 'emoji'],
    },
    {
        emoji: ['😉'],
        filename: 'winking.png',
        label: 'Wink', labelPt: 'Piscadinha',
        searchTerms: ['wink', 'piscar', 'piscadinha', 'emoji'],
    },
    {
        emoji: ['☹️', '🙁'],
        filename: 'sad.png',
        label: 'Sad', labelPt: 'Triste',
        searchTerms: ['sad', 'triste', 'unhappy', 'emoji'],
    },
    {
        emoji: ['😔'],
        filename: 'disappointed.png',
        label: 'Disappointed', labelPt: 'Decepcionado',
        searchTerms: ['disappointed', 'decepcionado', 'sad', 'emoji'],
    },
    {
        emoji: ['😳'],
        filename: 'embarrassed.png',
        label: 'Embarrassed', labelPt: 'Envergonhado',
        searchTerms: ['embarrassed', 'blush', 'envergonhado', 'corado', 'emoji'],
    },
    {
        emoji: ['😮', '😯'],
        filename: 'open-mouthed_smile.png',
        label: 'Open Mouth', labelPt: 'Boca aberta',
        searchTerms: ['open mouth', 'boca aberta', 'surprised', 'emoji'],
    },
    {
        emoji: ['😲', '😦'],
        filename: 'surprised.png',
        label: 'Shocked', labelPt: 'Chocado',
        searchTerms: ['shocked', 'surprised', 'chocado', 'surpreso', 'emoji'],
    },
    {
        emoji: ['😛', '😋'],
        filename: 'sticking_tongue_out.png',
        label: 'Tongue Out', labelPt: 'Língua de fora',
        searchTerms: ['tongue', 'língua', 'silly', 'emoji'],
    },
    {
        emoji: ['😕', '🫤'],
        filename: 'confused.png',
        label: 'Confused', labelPt: 'Confuso',
        searchTerms: ['confused', 'confuso', 'emoji'],
    },
    {
        emoji: ['😢', '😭'],
        filename: 'crying.png',
        label: 'Crying', labelPt: 'Chorando',
        searchTerms: ['crying', 'cry', 'chorar', 'chorando', 'lágrimas', 'emoji'],
    },
    {
        emoji: ['🤷', '🤷‍♀️', '🤷‍♂️'],
        filename: 'i_do_not_know.png',
        label: "I Don't Know", labelPt: 'Não sei',
        searchTerms: ['shrug', 'dont know', 'não sei', 'emoji'],
    },
    {
        emoji: ['🤔'],
        filename: 'thinking.png',
        label: 'Thinking', labelPt: 'Pensando',
        searchTerms: ['thinking', 'think', 'pensando', 'pensar', 'emoji'],
    },
    {
        emoji: ['😏'],
        filename: 'sarcastic.png',
        label: 'Sarcastic', labelPt: 'Sarcástico',
        searchTerms: ['sarcastic', 'smirk', 'sarcástico', 'emoji'],
    },
    {
        emoji: ['🤢', '🤮'],
        filename: 'sick.png',
        label: 'Sick', labelPt: 'Doente',
        searchTerms: ['sick', 'ill', 'doente', 'nausea', 'emoji'],
    },
    {
        emoji: ['🎉', '🎊'],
        filename: 'party.png',
        label: 'Party', labelPt: 'Festa',
        searchTerms: ['party', 'celebrate', 'festa', 'comemorar', 'emoji'],
    },
    {
        emoji: ['😪', '😴'],
        filename: 'sleepy.png',
        label: 'Sleepy', labelPt: 'Sonolento',
        searchTerms: ['sleepy', 'sleep', 'tired', 'sonolento', 'cansado', 'emoji'],
    },
    {
        emoji: ['🙄'],
        filename: 'eye-rolling.png',
        label: 'Eye Roll', labelPt: 'Revirando os olhos',
        searchTerms: ['eye roll', 'rolling', 'olhos', 'emoji'],
    },
    {
        emoji: ['🤓'],
        filename: 'nerd.png',
        label: 'Nerd', labelPt: 'Nerd',
        searchTerms: ['nerd', 'geek', 'glasses', 'óculos', 'emoji'],
    },
    {
        emoji: ['😬'],
        filename: 'baring_teeth.png',
        label: 'Grimacing', labelPt: 'Grimace',
        searchTerms: ['grimace', 'teeth', 'awkward', 'constrangido', 'emoji'],
    },
    {
        emoji: ['😑', '😐'],
        filename: 'whatever.png',
        label: 'Whatever', labelPt: 'Tanto faz',
        searchTerms: ['whatever', 'neutral', 'meh', 'tanto faz', 'emoji'],
    },
    {
        emoji: ['😤'],
        filename: 'steaming_mad.png',
        label: 'Steaming Mad', labelPt: 'Furioso',
        searchTerms: ['steaming', 'mad', 'furioso', 'frustrated', 'emoji'],
    },
    {
        emoji: ['🥶'],
        filename: 'freezing.png',
        label: 'Freezing', labelPt: 'Gelado',
        searchTerms: ['freezing', 'cold', 'gelado', 'frio', 'emoji'],
    },
    {
        emoji: ['😍', '🥰'],
        filename: 'in_love.png',
        label: 'In Love', labelPt: 'Apaixonado',
        searchTerms: ['love', 'in love', 'heart eyes', 'apaixonado', 'amor', 'emoji'],
    },
    {
        emoji: ['😠', '😡'],
        filename: 'angry.png',
        label: 'Angry', labelPt: 'Bravo',
        searchTerms: ['angry', 'rage', 'bravo', 'raiva', 'mad', 'emoji'],
    },
    {
        emoji: ['🥵'],
        filename: 'hot.png',
        label: 'Hot', labelPt: 'Com calor',
        searchTerms: ['hot', 'calor', 'heat', 'emoji'],
    },
    {
        emoji: ['🤐', '😶'],
        filename: 'secret_telling.png',
        label: 'Secret', labelPt: 'Segredo',
        searchTerms: ['secret', 'shh', 'lips sealed', 'segredo', 'emoji'],
    },
    {
        emoji: ['🤨'],
        filename: 'hmmm.png',
        label: 'Hmm', labelPt: 'Hmm',
        searchTerms: ['hmm', 'skeptical', 'suspicious', 'desconfiado', 'emoji'],
    },
    {
        emoji: ['🦇', '🧛'],
        filename: 'vampire_bat.png',
        label: 'Vampire Bat', labelPt: 'Morcego vampiro',
        searchTerms: ['bat', 'vampire', 'morcego', 'vampiro', 'emoji'],
    },
    // --- People / Gestures ---
    {
        emoji: ['👸'],
        filename: 'princess.png',
        label: 'Princess', labelPt: 'Princesa',
        searchTerms: ['princess', 'princesa', 'queen', 'emoji'],
    },
    {
        emoji: ['👽', '👾'],
        filename: 'alien.png',
        label: 'Alien', labelPt: 'Alienígena',
        searchTerms: ['alien', 'alienígena', 'ufo', 'emoji'],
    },
    {
        emoji: ['🤘'],
        filename: 'punk.png',
        label: 'Rock On', labelPt: 'Rock',
        searchTerms: ['punk', 'rock', 'metal', 'horns', 'emoji'],
    },
    {
        emoji: ['👊'],
        filename: 'punch.png',
        label: 'Punch', labelPt: 'Soco',
        searchTerms: ['punch', 'soco', 'fist', 'emoji'],
    },
    {
        emoji: ['🤗'],
        filename: 'right_hug.png',
        label: 'Hug', labelPt: 'Abraço',
        searchTerms: ['hug', 'abraço', 'right hug', 'emoji'],
    },
    {
        emoji: ['🫂'],
        filename: 'left_hug.png',
        label: 'Big Hug', labelPt: 'Abraço apertado',
        searchTerms: ['big hug', 'abraço apertado', 'hug', 'emoji'],
    },
    {
        emoji: ['🥷'],
        filename: 'ninja.png',
        label: 'Ninja', labelPt: 'Ninja',
        searchTerms: ['ninja', 'emoji'],
    },
    {
        emoji: ['🙌'],
        filename: 'high_five.png',
        label: 'High Five', labelPt: 'High Five',
        searchTerms: ['high five', 'celebration', 'hands', 'emoji'],
    },
    {
        emoji: ['😘'],
        filename: 'flirty_female.png',
        label: 'Flirty', labelPt: 'Flerte',
        searchTerms: ['flirty', 'kiss', 'flerte', 'beijo', 'emoji'],
    },
    {
        emoji: ['😜'],
        filename: 'joking.png',
        label: 'Joking', labelPt: 'Brincando',
        searchTerms: ['joking', 'joke', 'brincadeira', 'emoji'],
    },
    {
        emoji: ['☝️', '👆'],
        filename: 'point_up.png',
        label: 'Point Up', labelPt: 'Apontando',
        searchTerms: ['point', 'up', 'apontar', 'emoji'],
    },
    {
        emoji: ['👧'],
        filename: 'girl.png',
        label: 'Girl', labelPt: 'Menina',
        searchTerms: ['girl', 'menina', 'emoji'],
    },
    {
        emoji: ['👦'],
        filename: 'boy.png',
        label: 'Boy', labelPt: 'Menino',
        searchTerms: ['boy', 'menino', 'emoji'],
    },
    // --- Animals ---
    {
        emoji: ['🐱', '🐈'],
        filename: 'cat_face.png',
        label: 'Cat', labelPt: 'Gato',
        searchTerms: ['cat', 'gato', 'kitty', 'emoji'],
    },
    {
        emoji: ['🐶', '🐕'],
        filename: 'dog_face.png',
        label: 'Dog', labelPt: 'Cachorro',
        searchTerms: ['dog', 'cachorro', 'puppy', 'emoji'],
    },
    {
        emoji: ['🐰', '🐇'],
        filename: 'rabbit.png',
        label: 'Rabbit', labelPt: 'Coelho',
        searchTerms: ['rabbit', 'bunny', 'coelho', 'emoji'],
    },
    {
        emoji: ['🐌'],
        filename: 'snail.png',
        label: 'Snail', labelPt: 'Caracol',
        searchTerms: ['snail', 'caracol', 'slow', 'emoji'],
    },
    {
        emoji: ['🐢'],
        filename: 'turtle.png',
        label: 'Turtle', labelPt: 'Tartaruga',
        searchTerms: ['turtle', 'tartaruga', 'slow', 'emoji'],
    },
    // --- Good vs Evil ---
    {
        emoji: ['😈', '👿'],
        filename: 'devil.png',
        label: 'Devil', labelPt: 'Diabo',
        searchTerms: ['devil', 'evil', 'diabo', 'maldade', 'emoji'],
    },
    {
        emoji: ['😇', '👼'],
        filename: 'angel.png',
        label: 'Angel', labelPt: 'Anjo',
        searchTerms: ['angel', 'anjo', 'innocent', 'inocente', 'emoji'],
    },
    // --- Objects & Symbols ---
    {
        emoji: ['⭐', '🌟', '✨'],
        filename: 'star.png',
        label: 'Star', labelPt: 'Estrela',
        searchTerms: ['star', 'estrela', 'shine', 'emoji'],
    },
    {
        emoji: ['☀️', '🌞'],
        filename: 'sunshine.png',
        label: 'Sunshine', labelPt: 'Sol',
        searchTerms: ['sun', 'sunshine', 'sol', 'sunny', 'emoji'],
    },
    {
        emoji: ['🎂', '🍰'],
        filename: 'birthday_cake.png',
        label: 'Birthday Cake', labelPt: 'Bolo de aniversário',
        searchTerms: ['cake', 'birthday', 'bolo', 'aniversário', 'emoji'],
    },
    {
        emoji: ['🍜', '🍲'],
        filename: 'bowl.png',
        label: 'Noodles', labelPt: 'Macarrão',
        searchTerms: ['bowl', 'noodles', 'macarrão', 'ramen', 'emoji'],
    },
    {
        emoji: ['📽️', '🎞️', '🎬'],
        filename: 'filmstrip.png',
        label: 'Film', labelPt: 'Filme',
        searchTerms: ['film', 'movie', 'filme', 'cinema', 'emoji'],
    },
    {
        emoji: ['🎵', '🎶', '🎼'],
        filename: 'note.png',
        label: 'Music Note', labelPt: 'Nota musical',
        searchTerms: ['music', 'note', 'música', 'nota', 'emoji'],
    },
    {
        emoji: ['☮️'],
        filename: 'peace.png',
        label: 'Peace', labelPt: 'Paz',
        searchTerms: ['peace', 'paz', 'emoji'],
    },
    {
        emoji: ['📚', '🎒'],
        filename: 'school.png',
        label: 'School', labelPt: 'Escola',
        searchTerms: ['school', 'books', 'escola', 'livros', 'emoji'],
    },
    {
        emoji: ['🍺', '🍻'],
        filename: 'beer_mug.png',
        label: 'Beer', labelPt: 'Cerveja',
        searchTerms: ['beer', 'cerveja', 'mug', 'emoji'],
    },
    {
        emoji: ['☕', '🍵'],
        filename: 'coffee_cup.png',
        label: 'Coffee', labelPt: 'Café',
        searchTerms: ['coffee', 'café', 'tea', 'emoji'],
    },
    {
        emoji: ['🍸', '🥂', '🍹'],
        filename: 'martini_glass.png',
        label: 'Cocktail', labelPt: 'Drinque',
        searchTerms: ['martini', 'cocktail', 'drink', 'drinque', 'emoji'],
    },
    {
        emoji: ['📧', '✉️'],
        filename: 'e-mail.png',
        label: 'Email', labelPt: 'Email',
        searchTerms: ['email', 'mail', 'envelope', 'emoji'],
    },
    {
        emoji: ['🌹'],
        filename: 'red_rose.png',
        label: 'Rose', labelPt: 'Rosa',
        searchTerms: ['rose', 'rosa', 'flower', 'flor', 'emoji'],
    },
    {
        emoji: ['🎁'],
        filename: 'gift_with_a_bow.png',
        label: 'Gift', labelPt: 'Presente',
        searchTerms: ['gift', 'present', 'presente', 'emoji'],
    },
    {
        emoji: ['💡'],
        filename: 'light_bulb.png',
        label: 'Light Bulb', labelPt: 'Lâmpada',
        searchTerms: ['light bulb', 'idea', 'lâmpada', 'ideia', 'emoji'],
    },
    {
        emoji: ['💋'],
        filename: 'red_lips.png',
        label: 'Lips', labelPt: 'Lábios',
        searchTerms: ['lips', 'kiss', 'lábios', 'beijo', 'emoji'],
    },
    {
        emoji: ['❤️', '♥️', '❤', '♥'],
        filename: 'red_heart.png',
        label: 'Heart', labelPt: 'Coração',
        searchTerms: ['heart', 'love', 'coração', 'amor', 'emoji'],
    },
    {
        emoji: ['👎'],
        filename: 'thumbs_down.png',
        label: 'Thumbs Down', labelPt: 'Negativo',
        searchTerms: ['thumbs down', 'dislike', 'negativo', 'emoji'],
    },
    {
        emoji: ['⏰', '🕐'],
        filename: 'clock.png',
        label: 'Clock', labelPt: 'Relógio',
        searchTerms: ['clock', 'time', 'relógio', 'hora', 'emoji'],
    },
    {
        emoji: ['📷', '📸'],
        filename: 'camera.png',
        label: 'Camera', labelPt: 'Câmera',
        searchTerms: ['camera', 'photo', 'câmera', 'foto', 'emoji'],
    },
    {
        emoji: ['🌈'],
        filename: 'rainbow.png',
        label: 'Rainbow', labelPt: 'Arco-íris',
        searchTerms: ['rainbow', 'arco-íris', 'colorful', 'emoji'],
    },
    {
        emoji: ['🌙', '🌜', '🌛'],
        filename: 'sleeping_half-moon.png',
        label: 'Moon', labelPt: 'Lua',
        searchTerms: ['moon', 'lua', 'night', 'noite', 'emoji'],
    },
    {
        emoji: ['📞', '☎️'],
        filename: 'telephone_receiver.png',
        label: 'Phone', labelPt: 'Telefone',
        searchTerms: ['phone', 'call', 'telefone', 'ligação', 'emoji'],
    },
    {
        emoji: ['💔'],
        filename: 'broken_heart.png',
        label: 'Broken Heart', labelPt: 'Coração partido',
        searchTerms: ['broken heart', 'heartbreak', 'coração partido', 'emoji'],
    },
    {
        emoji: ['🥀'],
        filename: 'wilted_rose.png',
        label: 'Wilted Rose', labelPt: 'Rosa murcha',
        searchTerms: ['wilted rose', 'dead flower', 'rosa murcha', 'emoji'],
    },
    {
        emoji: ['👍'],
        filename: 'thumbs_up.png',
        label: 'Thumbs Up', labelPt: 'Joinha',
        searchTerms: ['thumbs up', 'like', 'good', 'joinha', 'emoji'],
    },
    {
        emoji: ['😒'],
        filename: 'envious.png',
        label: 'Envious', labelPt: 'Com inveja',
        searchTerms: ['envious', 'jealous', 'inveja', 'unamused', 'emoji'],
    },
    {
        emoji: ['✈️', '🛫'],
        filename: 'airplane.png',
        label: 'Airplane', labelPt: 'Avião',
        searchTerms: ['airplane', 'flight', 'avião', 'voo', 'emoji'],
    },
    {
        emoji: ['🚗', '🚙'],
        filename: 'auto.png',
        label: 'Car', labelPt: 'Carro',
        searchTerms: ['car', 'auto', 'carro', 'drive', 'emoji'],
    },
    {
        emoji: ['💻', '🖥️'],
        filename: 'computer.png',
        label: 'Computer', labelPt: 'Computador',
        searchTerms: ['computer', 'laptop', 'computador', 'emoji'],
    },
    {
        emoji: ['🏝️', '🌴'],
        filename: 'island_with_a_palm_tree.png',
        label: 'Island', labelPt: 'Ilha',
        searchTerms: ['island', 'palm tree', 'ilha', 'praia', 'emoji'],
    },
    {
        emoji: ['⚡'],
        filename: 'lightning.png',
        label: 'Lightning', labelPt: 'Raio',
        searchTerms: ['lightning', 'thunder', 'raio', 'emoji'],
    },
    {
        emoji: ['💰', '💵'],
        filename: 'money.png',
        label: 'Money', labelPt: 'Dinheiro',
        searchTerms: ['money', 'cash', 'dinheiro', 'emoji'],
    },
    {
        emoji: ['📱'],
        filename: 'mobile_phone.png',
        label: 'Mobile', labelPt: 'Celular',
        searchTerms: ['mobile', 'phone', 'celular', 'emoji'],
    },
    {
        emoji: ['🍕'],
        filename: 'pizza.png',
        label: 'Pizza', labelPt: 'Pizza',
        searchTerms: ['pizza', 'food', 'comida', 'emoji'],
    },
    {
        emoji: ['🍽️'],
        filename: 'plate.png',
        label: 'Plate', labelPt: 'Prato',
        searchTerms: ['plate', 'food', 'prato', 'comida', 'emoji'],
    },
    {
        emoji: ['⚽'],
        filename: 'soccer_ball.png',
        label: 'Soccer', labelPt: 'Futebol',
        searchTerms: ['soccer', 'football', 'futebol', 'ball', 'emoji'],
    },
    {
        emoji: ['⛈️', '🌩️'],
        filename: 'stormy_cloud.png',
        label: 'Storm', labelPt: 'Tempestade',
        searchTerms: ['storm', 'thunder', 'tempestade', 'emoji'],
    },
    {
        emoji: ['☂️', '☔', '🌂'],
        filename: 'umbrella.png',
        label: 'Umbrella', labelPt: 'Guarda-chuva',
        searchTerms: ['umbrella', 'rain', 'guarda-chuva', 'chuva', 'emoji'],
    },
]

export const EMOJI_TO_FILENAME: Record<string, string> = {}
for (const def of EMOJIS) {
    for (const emoji of def.emoji) {
        EMOJI_TO_FILENAME[emoji] = def.filename
    }
}

const emojiChars = Object.keys(EMOJI_TO_FILENAME).sort((a, b) => b.length - a.length)

function escapeRegex(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const EMOJI_REGEX = new RegExp(emojiChars.map(escapeRegex).join('|'), 'gu')
