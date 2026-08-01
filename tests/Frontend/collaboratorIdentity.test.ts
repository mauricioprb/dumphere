import { describe, expect, it } from 'vitest';
import {
    COLLABORATOR_COLORS,
    COLLABORATOR_NAMES,
    collaboratorInkColor,
    generateUniqueCollaboratorName,
    randomCollaboratorColor,
    randomCollaboratorNames,
} from '../../resources/js/Lib/collaboratorIdentity';

describe('collaborator identity', () => {
    it('selects distinct names from the product collaborator list', () => {
        const names = randomCollaboratorNames(2);

        expect(names).toHaveLength(2);
        expect(new Set(names)).toHaveLength(2);
        expect(names.every((name) => COLLABORATOR_NAMES.some((candidate) => candidate === name))).toBe(true);
    });

    it('avoids names that are already in use', () => {
        const onlyAvailableName = COLLABORATOR_NAMES.at(-1)!;
        const usedNames = COLLABORATOR_NAMES.slice(0, -1);

        expect(generateUniqueCollaboratorName([...usedNames])).toBe(onlyAvailableName);
    });

    it('selects colors from the collaborator palette', () => {
        expect(COLLABORATOR_COLORS).toContain(randomCollaboratorColor());
    });

    it('pairs each collaborator color with a darker tonal ink', () => {
        COLLABORATOR_COLORS.forEach((color) => {
            expect(collaboratorInkColor(color)).toMatch(/^#[0-9A-F]{6}$/i);
            expect(collaboratorInkColor(color)).not.toBe(color);
        });
    });
});
