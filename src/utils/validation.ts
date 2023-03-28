// This regex checks that the first character is a letter and that the following characters are in \w or -. Specials are disallowed
const objectNameRegex = /([a-zA-Z])([\w-])*/g;
export function objectNameIsValid(fileName: string | null) {
  if (fileName !== null) {
    const regexMatch = fileName.match(objectNameRegex);
    return regexMatch !== null && regexMatch[0] === fileName && fileName.length < 251; // Arango is 256, but we'll be conservative by limiting to 250
  }
  return false;
}
