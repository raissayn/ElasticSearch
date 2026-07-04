export const getSavedKey = (item) =>
  item.document_id ||
  [item.source_id || item.url_documento, item.pagina ?? 0].join('-');
