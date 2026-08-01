export const COLLABORATOR_NAMES = [
    'Albert Einstein',
    'Isaac Newton',
    'Nikola Tesla',
    'Marie Curie',
    'Richard Feynman',
    'Niels Bohr',
    'Stephen Hawking',
    'Max Planck',
    'Erwin Schrödinger',
    'Werner Heisenberg',
    'Lise Meitner',
    'Enrico Fermi',
    'Chien-Shiung Wu',
    'Ada Lovelace',
    'Alan Turing',
    'Carl Gauss',
    'Leonhard Euler',
    'Blaise Pascal',
    'Hypatia',
    'Emmy Noether',
    'Ramanujan',
    'Katherine Johnson',
    'Mary Jackson',
    'Dorothy Vaughan',
    'Santos Dumont',
    'Leonardo da Vinci',
    'Thomas Edison',
    'Hedy Lamarr',
    'Alexander Bell',
    'Guglielmo Marconi',
    'Nikolaus Otto',
    'George Washington Carver',
    'Charles Darwin',
    'Rosalind Franklin',
    'Gregor Mendel',
    'Louis Pasteur',
    'Dmitri Mendeleev',
    'Linus Pauling',
    'Barbara McClintock',
    'Jane Goodall',
    'Rachel Carson',
    'Alexander Fleming',
    'Galileo Galilei',
    'Johannes Kepler',
    'Carl Sagan',
    'Vera Rubin',
    'Edwin Hubble',
    'Copérnico',
    'Neil deGrasse Tyson',
    'Jocelyn Bell Burnell',
    'Grace Hopper',
    'John von Neumann',
    'Claude Shannon',
    'Tim Berners-Lee',
    'Linus Torvalds',
    'Dennis Ritchie',
    'Margaret Hamilton',
    'Donald Knuth',
    'César Lattes',
    'Johanna Döbereiner',
    'Vital Brazil',
    'Carlos Chagas',
    'Mário Schenberg',
    'Oswaldo Cruz',
    'Nise da Silveira',
    'Milton Santos',
    'Enedina Alves Marques',
    'Ayrton Senna',
    'Machado de Assis',
    'Tarsila do Amaral',
] as const;

export const COLLABORATOR_COLORS = [
    '#EF9A9A',
    '#F48FB1',
    '#CE93D8',
    '#B39DDB',
    '#9FA8DA',
    '#90CAF9',
    '#80CBC4',
    '#A5D6A7',
    '#C5E1A5',
    '#FFCC80',
    '#FFAB91',
    '#BCAAA4',
    '#B0BEC5',
] as const;

const COLLABORATOR_INKS: Record<(typeof COLLABORATOR_COLORS)[number], string> = {
    '#EF9A9A': '#611B1B',
    '#F48FB1': '#651638',
    '#CE93D8': '#50185B',
    '#B39DDB': '#351B63',
    '#9FA8DA': '#25336A',
    '#90CAF9': '#124B73',
    '#80CBC4': '#0B554E',
    '#A5D6A7': '#245A2B',
    '#C5E1A5': '#435D18',
    '#FFCC80': '#713800',
    '#FFAB91': '#702A19',
    '#BCAAA4': '#513831',
    '#B0BEC5': '#35474F',
};

export function randomCollaboratorColor(): string {
    return COLLABORATOR_COLORS[Math.floor(Math.random() * COLLABORATOR_COLORS.length)];
}

export function collaboratorInkColor(color: string): string {
    return COLLABORATOR_INKS[color.toUpperCase() as keyof typeof COLLABORATOR_INKS] ?? '#263238';
}

export function randomCollaboratorNames(count: number): string[] {
    const names = [...COLLABORATOR_NAMES];

    for (let index = names.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [names[index], names[randomIndex]] = [names[randomIndex], names[index]];
    }

    return names.slice(0, Math.max(0, count));
}

export function generateUniqueCollaboratorName(usedNames: string[]): string {
    const availableNames = COLLABORATOR_NAMES.filter((name) => !usedNames.includes(name));

    if (availableNames.length === 0) {
        const fallbackName = COLLABORATOR_NAMES[Math.floor(Math.random() * COLLABORATOR_NAMES.length)];
        return `${fallbackName} ${Math.floor(Math.random() * 1000)}`;
    }

    return availableNames[Math.floor(Math.random() * availableNames.length)];
}
