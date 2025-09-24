const formatDateUTC = (utcTime: number) => {
  const date = new Date(utcTime * 1000);

  const pad = (n: number) => n.toString().padStart(2, '0');

  const yyyy = date.getUTCFullYear();
  const mm = pad(date.getUTCMonth() + 1);
  const dd = pad(date.getUTCDate());
  const hh = pad(date.getUTCHours());
  const min = pad(date.getUTCMinutes());
  const ss = pad(date.getUTCSeconds());

  return `${ yyyy }/${ mm }/${ dd } ${ hh }:${ min }:${ ss }`;
};

export default formatDateUTC;
