/** Render fintech SVG as a solid white mark for wallet cards. */
export function toWhiteSvgMarkup(svg: string): string {
  let result = svg;

  result = result.replace(/\bfill="url\([^"]+\)"/gi, 'fill="#FFFFFF"');
  result = result.replace(/\bfill='url\([^']+\)'/gi, "fill='#FFFFFF'");

  result = result.replace(
    /\bfill="(?!none)([^"]+)"/gi,
    'fill="#FFFFFF"',
  );
  result = result.replace(
    /\bfill='(?!none)([^']+)'/gi,
    "fill='#FFFFFF'",
  );

  result = result.replace(
    /\bstroke="(?!none)([^"]+)"/gi,
    'stroke="#FFFFFF"',
  );
  result = result.replace(
    /\bstroke='(?!none)([^']+)'/gi,
    "stroke='#FFFFFF'",
  );

  result = result.replace(/stop-color="[^"]+"/gi, 'stop-color="#FFFFFF"');
  result = result.replace(/stop-color='[^']+'/gi, "stop-color='#FFFFFF'");

  return result;
}
