const ResultCard = ({
  tipo_conteudo,
  nome_disciplina,
  periodo,
  curso,
  ementa,
  conteudo,
  titulo_documento,
  titulo_secao,
  nome_pessoa,
  cargo,
  titulacao,
  area_atuacao,
  carga_horaria_total,
  carga_horaria_teorica,
  carga_horaria_pratica,
  carga_horaria_atividade,
  pre_requisitos,
  tags,
  pagina,
  url_documento,
  score,
  max_score,
}) => {
  const isDiscipline = tipo_conteudo === "disciplina";
  const isSection = tipo_conteudo === "secao_texto";
  const isPerson = tipo_conteudo === "pessoa";

  // Determine display title
  let displayTitle = titulo_documento;
  if (isDiscipline && nome_disciplina) displayTitle = nome_disciplina;
  if (isSection && titulo_secao) displayTitle = titulo_secao;
  if (isPerson && nome_pessoa) displayTitle = nome_pessoa;

  // Determine icon
  let icon = "description";
  if (isDiscipline) icon = "school";
  if (isPerson) icon = "person";
  if (isSection) icon = "article";

  // Determine main body text
  let bodyText = ementa || conteudo;
  if (isPerson) {
      bodyText = [cargo, titulacao, area_atuacao].filter(Boolean).join(" • ");
  }

  const relevancePercent = max_score > 0 ? Math.round((score / max_score) * 100) : 0;

  const handleClick = () => {
    if (url_documento) {
      window.open(url_documento, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 md:p-6 hover:border-secondary dark:hover:border-secondary hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Header: course + relevance */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-unifal-bg dark:bg-gray-700 rounded-full flex shrink-0 items-center justify-center text-primary dark:text-secondary">
            <span className="material-symbols-outlined">
              {icon}
            </span>
          </div>
          <div className="min-w-0">
            <span className="font-bold text-gray-900 dark:text-on-surface line-clamp-1 leading-tight block">
              {curso || titulo_documento || "Documento"}
            </span>
            {periodo && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{periodo}º Período</span>
            )}
          </div>
        </div>

        {/* Relevance indicator */}
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-primary dark:text-secondary">{relevancePercent}%</span>
            <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary dark:bg-secondary rounded-full transition-all duration-500"
                style={{ width: `${relevancePercent}%` }}
              ></div>
            </div>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="material-symbols-outlined font-light">bookmark</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-on-surface mb-2 group-hover:text-primary dark:group-hover:text-secondary transition-colors">
        {displayTitle}
      </h3>

      {/* Body / Summary */}
      {bodyText && (
        <div className="mb-4">
          {isDiscipline && ementa && (
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ementa</span>
          )}
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 mt-0.5">
            {bodyText}
          </p>
        </div>
      )}

      {/* Workload bar (only for disciplines) */}
      {isDiscipline && carga_horaria_total && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <span className="material-symbols-outlined text-[16px]">timer</span>
            C.H Total: <span className="font-bold text-gray-900 dark:text-on-surface">{carga_horaria_total}h</span>
          </div>
          {carga_horaria_teorica != null && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              Teórica: <span className="font-bold text-gray-800 dark:text-gray-200">{carga_horaria_teorica}h</span>
            </div>
          )}
          {carga_horaria_pratica != null && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              Prática: <span className="font-bold text-gray-800 dark:text-gray-200">{carga_horaria_pratica}h</span>
            </div>
          )}
          {carga_horaria_atividade != null && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              Atividade: <span className="font-bold text-gray-800 dark:text-gray-200">{carga_horaria_atividade}h</span>
            </div>
          )}
        </div>
      )}

      {/* Prerequisites (only if present) */}
      {isDiscipline && pre_requisitos && pre_requisitos.length > 0 && (
        <div className="mb-4 text-xs">
          <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pré-requisitos: </span>
          <span className="text-gray-700 dark:text-gray-300 font-medium">{pre_requisitos.join(", ")}</span>
        </div>
      )}

      {/* Footer: metadata */}
      <div className="flex flex-wrap items-center gap-y-2 gap-x-3 md:gap-4 text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">article</span>
          Página {pagina}
        </div>
        <div className="hidden md:block w-px h-4 bg-gray-200 dark:bg-gray-700"></div>
        {tags && tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="material-symbols-outlined text-[16px]">sell</span>
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-unifal-bg dark:bg-gray-700 text-primary dark:text-secondary rounded-full text-xs font-bold"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="ml-auto flex items-center gap-1 text-primary dark:text-secondary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
          Ver documento
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
        </div>
      </div>
    </article>
  );
};

export default ResultCard;
