import { describe, expect, it } from 'vitest';
import {
    COLLABORATOR_COLORS,
    COLLABORATOR_NAMES,
    collaboratorInkColor,
    generateUniqueCollaboratorName,
    randomCollaboratorColor,
} from '../../resources/js/Lib/collaboratorIdentity';

describe('collaborator identity', () => {
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
