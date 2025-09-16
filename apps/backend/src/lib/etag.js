import etagLib from 'etag';

export function sendWithETag(res, data, req) {
  const json = JSON.stringify(data);
  const tag = etagLib(json);
  const inm = req.headers['if-none-match'];
  if (inm && inm === tag) {
    res.status(304).end();
    return true;
  }
  res.setHeader('ETag', tag);
  res.json(data);
  return false;
}
