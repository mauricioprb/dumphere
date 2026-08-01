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
    '#C7A6B7',
    '#A9B7D9',
    '#93BFB4',
    '#C9C08C',
    '#D5A9A2',
    '#A8B98C',
    '#B4A8CE',
    '#8FB6C9',
    '#D2B48C',
    '#B9AFA4',
    '#9FC2A8',
    '#CBA9C6',
    '#A3AEBF',
] as const;

const COLLABORATOR_INKS: Record<(typeof COLLABORATOR_COLORS)[number], string> = {
    '#C7A6B7': '#3E2233',
    '#A9B7D9': '#21304F',
    '#93BFB4': '#14332C',
    '#C9C08C': '#3A3411',
    '#D5A9A2': '#47231D',
    '#A8B98C': '#2C3714',
    '#B4A8CE': '#2E2450',
    '#8FB6C9': '#12333F',
    '#D2B48C': '#4A3418',
    '#B9AFA4': '#3B322A',
    '#9FC2A8': '#1D3A26',
    '#CBA9C6': '#412340',
    '#A3AEBF': '#26303D',
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
