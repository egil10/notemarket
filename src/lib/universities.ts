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
    courseCode: string,
    title: string,
    username: string
): string {
    const sanitizedCourseCode = sanitizeFilename(courseCode.toUpperCase());
    const sanitizedTitle = sanitizeFilename(title);
    const sanitizedUsername = sanitizeFilename(username);

    return `${sanitizedCourseCode}_${sanitizedTitle}_${sanitizedUsername}.pdf`;
}
