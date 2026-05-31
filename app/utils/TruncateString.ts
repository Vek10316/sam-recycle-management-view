const TruncateString = (input: string, truncateAtIndex: number) =>
    input.slice(0, truncateAtIndex) + "...";

export default TruncateString;