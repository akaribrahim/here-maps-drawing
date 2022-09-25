export const rectangleSvg = (border: string = '#bebebe'): string => `
  <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg">
    <rect width="12" height="12" style="fill:rgb(255,255,255);stroke-width:2;stroke:${border}" />
  </svg>
`;

export const standartIcon = (
  color: string,
  text: string,
  textColor: string = '#fff'
): string => `
  <svg width="30px" height="30px" viewBox="0 0 10 30" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50%" cy="50%" r="11" stroke="${textColor}" fill="${color}"/>
    <text x="50%" y="50%" text-anchor="middle" fill="${textColor}" dy=".3em" font-size="12" font-weight="200" font-family="Roboto, sans-serif">
      ${text}
    </text>
  </svg>
`;
