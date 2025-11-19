export const UNIVERSITIES = [
    // Videregående Skole
    { name: 'Videregående Skole', abbreviation: 'VGS' },

    // Universiteter
    { name: 'Universitetet i Agder', abbreviation: 'UiA' },
    { name: 'Universitetet i Bergen', abbreviation: 'UiB' },
    { name: 'Universitetet i Innlandet', abbreviation: 'INN' },
    { name: 'Norges miljø- og biovitenskapelige universitet', abbreviation: 'NMBU' },
    { name: 'Nord universitet', abbreviation: 'Nord' },
    { name: 'Norges teknisk-naturvitenskapelige universitet', abbreviation: 'NTNU' },
    { name: 'Universitetet i Oslo', abbreviation: 'UiO' },
    { name: 'OsloMet – storbyuniversitetet', abbreviation: 'OsloMet' },
    { name: 'Universitetet i Stavanger', abbreviation: 'UiS' },
    { name: 'Universitetet i Sørøst-Norge', abbreviation: 'USN' },
    { name: 'UiT Norges arktiske universitet', abbreviation: 'UiT' },

    // Vitenskapelige høgskoler
    { name: 'Arkitektur- og designhøgskolen i Oslo', abbreviation: 'AHO' },
    { name: 'Handelshøyskolen BI', abbreviation: 'BI' },
    { name: 'Høgskolen i Molde', abbreviation: 'HiMolde' },
    { name: 'Kunsthøgskolen i Oslo', abbreviation: 'KHiO' },
    { name: 'MF vitenskapelig høyskole', abbreviation: 'MF' },
    { name: 'Norges handelshøyskole', abbreviation: 'NHH' },
    { name: 'Norges idrettshøgskole', abbreviation: 'NIH' },
    { name: 'Norges musikkhøgskole', abbreviation: 'NMH' },
    { name: 'VID vitenskapelige høgskole', abbreviation: 'VID' },
] as const;

export type University = typeof UNIVERSITIES[number];

export function getUniversityAbbreviation(universityName: string): string {
    const university = UNIVERSITIES.find(u => u.name === universityName);
    return university?.abbreviation || universityName;
}

export function sanitizeFilename(text: string): string {
    return text
        .replace(/[^a-zA-Z0-9æøåÆØÅ\-_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

export function generateDocumentFilename(
    title: string,
    courseCode: string,
    university: string,
    username: string
): string {
    const parts: string[] = [];

    // Add title (required)
    if (title) {
        parts.push(sanitizeFilename(title));
    }

    // Add university abbreviation (optional)
    if (university) {
        const abbr = getUniversityAbbreviation(university);
        parts.push(sanitizeFilename(abbr));
    }

    // Add course code (optional)
    if (courseCode) {
        parts.push(sanitizeFilename(courseCode.toUpperCase()));
    }

    // Add timestamp (YYYY-MM-DD-HH-MM)
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
    parts.push(timestamp);

    // Add username (required)
    if (username) {
        parts.push(sanitizeFilename(username));
    }

    return parts.join('_') + '.pdf';
}
